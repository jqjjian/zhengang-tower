import { Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState, useRef } from 'react';
import './index.scss';

// 正确导入three-platformize组件
// @ts-ignore
import * as THREE from 'three-platformize';
// @ts-ignore
import { PLATFORM } from 'three-platformize';
// @ts-ignore
import { WechatPlatform } from 'three-platformize/src/WechatPlatform';
// @ts-ignore
import { GLTFLoader } from 'three-platformize/examples/jsm/loaders/GLTFLoader';
// @ts-ignore
import { OrbitControls } from 'three-platformize/examples/jsm/controls/OrbitControls';

// 获取微信全局对象
// @ts-ignore
const wx = typeof window !== 'undefined' ? window.wx : global.wx;

// 创建空方法来覆盖canvas.getContext('2d')，防止内部代码尝试使用2d上下文
const createEmptyContext = () => {
    return {
        // 提供足够的空方法来满足可能的调用
        getImageData: () => ({ data: new Uint8Array(0) }),
        putImageData: () => { },
        drawImage: () => { },
        fillRect: () => { },
        clearRect: () => { },
        measureText: () => ({ width: 0 }),
        fillText: () => { }
    };
};

interface ThreeModelProps {
    modelUrl: string;  // 模型URL地址
    width?: number;    // 容器宽度
    height?: number;   // 容器高度
    backgroundColor?: string; // 背景色
    autoRotate?: boolean; // 是否自动旋转
    modelColor?: string; // 模型颜色，用于默认模型
    showErrorModel?: boolean; // 加载失败时是否显示错误模型
    enableControls?: boolean; // 是否启用交互控制
    showAxesHelper?: boolean; // 是否显示坐标系辅助线
    fullscreen?: boolean; // 是否全屏显示
}

/**
 * 3D模型显示组件 - 使用three-platformize实现
 */
const ThreeModel: React.FC<ThreeModelProps> = ({
    modelUrl,
    width = 300,
    height = 300,
    backgroundColor = 'transparent',
    autoRotate = true,
    modelColor = '#3498db',
    showErrorModel = false,
    enableControls = true,
    showAxesHelper = false,
    fullscreen = false
}) => {
    const [canvasId] = useState(`model-canvas-${Date.now()}`);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [windowSize, setWindowSize] = useState({ width: width, height: height });
    const animationRef = useRef<number | null>(null);
    const sceneRef = useRef<any>(null);
    const rendererRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);
    const modelRef = useRef<any>(null);
    const platformRef = useRef<any>(null);
    const controlsRef = useRef<any>(null);

    // 获取窗口尺寸
    useEffect(() => {
        if (fullscreen) {
            try {
                // @ts-ignore
                const systemInfo = Taro.getSystemInfoSync();
                setWindowSize({
                    width: systemInfo.windowWidth,
                    height: systemInfo.windowHeight
                });
                console.log('窗口尺寸:', systemInfo.windowWidth, systemInfo.windowHeight);
            } catch (e) {
                console.error('获取窗口尺寸失败:', e);
            }
        } else {
            setWindowSize({ width, height });
        }
    }, [fullscreen, width, height]);

    // 处理触摸事件，传递给平台处理
    const handleTouchEvent = (e: any) => {
        if (platformRef.current) {
            platformRef.current.dispatchTouchEvent(e);
        }
    };

    // 清理动画循环和资源
    useEffect(() => {
        return () => {
            if (animationRef.current !== null) {
                try {
                    // @ts-ignore 忽略可能的类型错误
                    THREE.$cancelAnimationFrame(animationRef.current);
                } catch (e) {
                    console.error('清理动画循环失败:', e);
                }
            }
            // 清理场景资源
            if (sceneRef.current && modelRef.current) {
                try {
                    sceneRef.current.remove(modelRef.current);
                } catch (e) {
                    console.error('清理场景资源失败:', e);
                }
            }
            // 清理平台资源
            if (platformRef.current) {
                try {
                    PLATFORM.dispose();
                } catch (e) {
                    console.error('清理平台资源失败:', e);
                }
            }
        };
    }, []);

    // 组件挂载后初始化3D场景
    useEffect(() => {
        let isMounted = true;

        const initScene = async () => {
            try {
                setIsLoading(true);
                setLoadError(null);

                // 获取Canvas上下文
                let canvas;
                try {
                    // @ts-ignore 忽略Taro API可能的TS错误
                    const query = Taro.createSelectorQuery();
                    canvas = await new Promise<any>((resolve, reject) => {
                        query.select(`#${canvasId}`)
                            .fields({ node: true, size: true })
                            .exec((res) => {
                                if (res && res[0] && res[0].node) {
                                    resolve(res[0].node);
                                } else {
                                    reject(new Error('获取Canvas节点失败'));
                                }
                            });
                    });

                    // 检查Canvas对象是否可用
                    if (!canvas || typeof canvas.getContext !== 'function') {
                        throw new Error('Canvas对象不可用或不支持getContext方法');
                    }

                    // 检查是否支持webgl上下文
                    const gl = canvas.getContext('webgl');
                    if (!gl) {
                        throw new Error('当前环境不支持WebGL');
                    }

                    // 修补canvas.getContext方法，拦截对'2d'上下文的请求
                    const originalGetContext = canvas.getContext;
                    canvas.getContext = function (contextType, ...args) {
                        if (contextType === '2d') {
                            console.warn('检测到尝试获取2d上下文，返回模拟对象');
                            return createEmptyContext();
                        }
                        if (contextType === 'webgl2') {
                            console.warn('检测到尝试获取webgl2上下文，降级到webgl');
                            contextType = 'webgl';
                        }
                        return originalGetContext.call(this, contextType, ...args);
                    };
                } catch (err) {
                    console.error('Canvas查询失败:', err);
                    throw new Error(`获取Canvas失败: ${err.message}`);
                }

                // 如果组件已卸载，不继续执行
                if (!isMounted) return;

                // 使用WechatPlatform初始化Three.js
                console.log('创建WechatPlatform实例');

                // 创建平台实例并设置全局平台
                const platform = new WechatPlatform(canvas);
                platformRef.current = platform;
                PLATFORM.set(platform);

                // 创建渲染器
                const renderer = new THREE.WebGLRenderer({
                    canvas,
                    antialias: true,
                    alpha: true,
                    powerPreference: 'default',
                    precision: 'highp',
                    // 强制使用webgl1，避免尝试使用webgl2
                    context: canvas.getContext('webgl', {
                        alpha: true,
                        antialias: true,
                        depth: true,
                        premultipliedAlpha: true,
                        preserveDrawingBuffer: false,
                        stencil: true
                    })
                });
                renderer.setSize(windowSize.width, windowSize.height);
                // 禁用阴影
                renderer.shadowMap.enabled = false;
                rendererRef.current = renderer;

                try {
                    // 获取设备像素比
                    // @ts-ignore
                    const pixelRatio = Taro.getSystemInfoSync().pixelRatio;
                    renderer.setPixelRatio(pixelRatio);
                } catch (e) {
                    console.error('获取设备像素比失败', e);
                    renderer.setPixelRatio(2);
                }

                // 创建场景
                const scene = new THREE.Scene();
                scene.background = null; // 透明背景
                sceneRef.current = scene;

                // 创建相机
                const camera = new THREE.PerspectiveCamera(
                    75, windowSize.width / windowSize.height, 0.1, 1000
                );
                camera.position.z = 5;
                cameraRef.current = camera;

                // 添加控制器
                if (enableControls) {
                    const controls = new OrbitControls(camera, canvas);
                    controls.enableDamping = true;
                    controls.dampingFactor = 0.25; // 动态阻尼系数，鼠标拖拽旋转灵敏度
                    controls.enableZoom = true;    // 允许缩放
                    controlsRef.current = controls;
                }

                // 添加灯光 - 不产生阴影
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
                scene.add(ambientLight);

                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
                directionalLight.position.set(1, 1, 1);
                // 禁用阴影
                directionalLight.castShadow = false;
                scene.add(directionalLight);

                // 添加坐标系辅助线
                if (showAxesHelper) {
                    const axesHelper = new THREE.AxesHelper(5);
                    scene.add(axesHelper);
                }

                // 创建一个默认的立方体
                const createCube = () => {
                    console.log('创建默认立方体');
                    const geometry = new THREE.BoxGeometry(1, 1, 1);
                    const material = new THREE.MeshBasicMaterial({
                        color: modelColor
                    });
                    const cube = new THREE.Mesh(geometry, material);
                    // 禁用阴影
                    cube.castShadow = false;
                    cube.receiveShadow = false;
                    scene.add(cube);
                    modelRef.current = cube;

                    // 设置动画循环
                    const animate = () => {
                        if (!isMounted) return;

                        try {
                            if (controlsRef.current) {
                                controlsRef.current.update();
                            } else if (autoRotate && cube) {
                                // 如果没有控制器但启用了自动旋转
                                cube.rotation.y += 0.01;
                            }

                            renderer.render(scene, camera);
                            // @ts-ignore
                            animationRef.current = THREE.$requestAnimationFrame(animate);
                        } catch (e) {
                            console.error('动画渲染错误:', e);
                        }
                    };

                    animate();
                    setIsLoading(false);
                };

                // 创建默认立方体（先显示一个，然后尝试加载模型）
                createCube();

                // 加载3D模型
                try {
                    // 使用GLTFLoader
                    console.log('正在准备加载模型:', modelUrl);

                    if (!modelUrl || modelUrl === '') {
                        console.log('未提供有效的模型URL，已显示默认立方体');
                        return;
                    }

                    // 检查URL是否包含资源占位符
                    const processedUrl = modelUrl.includes('@/')
                        ? modelUrl.replace('@/', '')
                        : modelUrl;

                    console.log('处理后的模型URL:', processedUrl);

                    // 禁用纹理自动创建ImageBitmaps，避免内部尝试使用2d上下文
                    // @ts-ignore - 忽略整个方法重写的类型问题
                    THREE.ImageBitmapLoader.prototype.load = function (url, onLoad) {
                        // 创建一个模拟的ImageBitmap对象
                        const mockImageBitmap = {
                            width: 1,
                            height: 1,
                            close: () => { }
                        } as unknown as ImageBitmap;

                        // 异步调用回调
                        if (onLoad) setTimeout(() => onLoad(mockImageBitmap), 0);
                        return mockImageBitmap;
                    };

                    // 使用three-platformize的GLTFLoader
                    const loader = new GLTFLoader();

                    loader.load(
                        processedUrl,
                        (gltf) => {
                            try {
                                if (!isMounted) return;

                                // 模型加载成功，移除默认立方体
                                if (modelRef.current) {
                                    scene.remove(modelRef.current);
                                }

                                // 添加加载的模型
                                console.log('模型加载成功:', gltf);
                                const model = gltf.scene;

                                // 遍历模型中的所有网格，禁用阴影
                                model.traverse((child: any) => {
                                    if (child.isMesh) {
                                        child.castShadow = false;
                                        child.receiveShadow = false;

                                        // 可选：将材质更改为不产生阴影的材质
                                        if (child.material) {
                                            child.material.shadowSide = THREE.DoubleSide;
                                            child.material.needsUpdate = true;
                                        }
                                    }
                                });

                                scene.add(model);
                                modelRef.current = model;

                                // 调整模型位置和大小
                                const box = new THREE.Box3().setFromObject(model);
                                const size = box.getSize(new THREE.Vector3());
                                const center = box.getCenter(new THREE.Vector3());

                                model.position.x = -center.x;
                                model.position.y = -center.y;
                                model.position.z = -center.z;

                                // 根据模型大小调整相机位置
                                const maxDim = Math.max(size.x, size.y, size.z);
                                camera.position.z = maxDim * 2.5 || 5;

                                // 重新设置动画循环
                                const animate = () => {
                                    if (!isMounted) return;

                                    try {
                                        if (controlsRef.current) {
                                            controlsRef.current.update();
                                        } else if (autoRotate && model) {
                                            // 如果没有控制器但启用了自动旋转
                                            model.rotation.y += 0.01;
                                        }

                                        renderer.render(scene, camera);
                                        // @ts-ignore
                                        animationRef.current = THREE.$requestAnimationFrame(animate);
                                    } catch (e) {
                                        console.error('动画渲染错误:', e);
                                    }
                                };

                                animate();
                                setIsLoading(false);
                            } catch (e) {
                                console.error('处理加载成功的模型时发生错误:', e);
                                // 已经显示了默认立方体，不需要处理错误
                                console.log('继续使用默认立方体');
                            }
                        },
                        (progress) => {
                            // 加载进度回调
                            if (!isMounted) return;
                            const percent = progress.loaded / progress.total * 100 || 0;
                            console.log(`模型加载进度: ${percent.toFixed(0)}%`);
                        },
                        (error) => {
                            // 加载错误处理
                            if (!isMounted) return;
                            console.error('模型加载失败:', error);
                            // 已经显示了默认立方体，只记录错误不显示
                            console.log('继续使用默认立方体');
                        }
                    );
                } catch (loaderError) {
                    console.error('创建或使用GLTFLoader时发生错误:', loaderError);
                    // 已经显示了默认立方体，不需要额外处理
                    console.log('继续使用默认立方体');
                }

            } catch (error) {
                if (isMounted) {
                    console.error('初始化3D场景失败:', error);
                    setLoadError(`初始化3D场景失败: ${(error as Error).message}`);
                    setIsLoading(false);
                }
            }
        };

        // 初始化场景
        initScene().catch(error => {
            console.error('initScene Promise错误:', error);
            if (isMounted) {
                setLoadError(`初始化3D场景失败: ${(error as Error).message}`);
                setIsLoading(false);
            }
        });

        // 组件卸载时的清理
        return () => {
            isMounted = false;
            if (animationRef.current !== null) {
                try {
                    // @ts-ignore 忽略可能的类型错误
                    THREE.$cancelAnimationFrame(animationRef.current);
                } catch (e) {
                    console.error('卸载时清理动画循环失败:', e);
                }
            }
        };
    }, [canvasId, modelUrl, windowSize.width, windowSize.height, autoRotate, modelColor, showErrorModel, enableControls, showAxesHelper]);

    return (
        <div
            className="three-model-container"
            style={{
                width: windowSize.width,
                height: windowSize.height,
                backgroundColor,
                position: fullscreen ? 'fixed' : 'relative',
                top: fullscreen ? 0 : 'auto',
                left: fullscreen ? 0 : 'auto',
                zIndex: fullscreen ? 10 : 'auto',
            }}
        >
            <Canvas
                id={canvasId}
                type="webgl"
                className="model-canvas"
                style={{ width: '100%', height: '100%' }}
                onTouchStart={handleTouchEvent}
                onTouchMove={handleTouchEvent}
                onTouchEnd={handleTouchEvent}
            />
            {isLoading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">加载中...</p>
                </div>
            )}
            {loadError && (
                <div className="error-container">
                    <p className="error-text">加载失败</p>
                    <p className="error-detail">{loadError}</p>
                </div>
            )}
        </div>
    );
};

export default ThreeModel; 