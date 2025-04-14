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
    onLoad?: () => void; // 模型加载完成回调
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
    fullscreen = false,
    onLoad
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
            // 重要：将Taro的触摸事件转换为three-platformize可以理解的格式
            // 这确保了OrbitControls可以正确处理多指缩放
            platformRef.current.dispatchTouchEvent(e);

            // 记录日志帮助调试
            if (e.type === 'touchstart' && e.touches && e.touches.length === 2) {
                console.log('检测到两指触摸，可能是缩放手势');
            }
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
                    const gl = canvas.getContext('webgl', {
                        alpha: true, // 确保支持透明
                        antialias: true,
                        premultipliedAlpha: false, // 关闭premultipliedAlpha以确保alpha处理正确
                        preserveDrawingBuffer: false
                    });
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
                // 设置渲染器支持透明背景
                renderer.setClearColor(0x000000, 0); // 设置透明度为0
                // 启用色调映射，使场景整体更暗且带黄色调
                renderer.outputEncoding = THREE.sRGBEncoding;
                renderer.toneMapping = THREE.ACESFilmicToneMapping;
                renderer.toneMappingExposure = 0.65; // 保持适当曝光度
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
                    60, windowSize.width / windowSize.height, 0.1, 1000
                );
                camera.position.z = 10; // 进一步增加初始距离
                cameraRef.current = camera;

                // 添加控制器
                if (enableControls) {
                    const controls = new OrbitControls(camera, canvas);
                    controls.enableDamping = true;
                    controls.dampingFactor = 0.25; // 动态阻尼系数，鼠标拖拽旋转灵敏度
                    controls.enableZoom = true;    // 允许缩放
                    controls.zoomSpeed = 1.2;      // 增加缩放速度
                    controls.minDistance = 1;      // 设置最小缩放距离
                    controls.maxDistance = 30;     // 增加最大缩放距离
                    controlsRef.current = controls;
                }

                // 添加灯光 - 不产生阴影
                const ambientLight = new THREE.AmbientLight(0xfff0c0, 0.65); // 改为暖黄色环境光
                scene.add(ambientLight);

                // 添加直射光，模拟太阳光
                const directionalLight = new THREE.DirectionalLight(0xffdc8a, 0.45); // 改为金黄色直射光
                directionalLight.position.set(1, 1, 1);
                directionalLight.castShadow = false;
                scene.add(directionalLight);

                // 添加第二个方向光，照亮模型背面
                const directionalLight2 = new THREE.DirectionalLight(0xffe082, 0.3); // 改为浅黄色光
                directionalLight2.position.set(-1, 0.5, -1);
                directionalLight2.castShadow = false;
                scene.add(directionalLight2);

                // 添加顶部点光源，增强整体亮度
                const topLight = new THREE.PointLight(0xffeec0, 0.25); // 改为淡黄色点光源
                topLight.position.set(0, 5, 0);
                scene.add(topLight);

                // 添加坐标系辅助线
                if (showAxesHelper) {
                    const axesHelper = new THREE.AxesHelper(5);
                    scene.add(axesHelper);
                }

                // 设置动画循环函数（将在模型加载后调用）
                const createAnimationLoop = (model) => {
                    return () => {
                        if (!isMounted) return;

                        try {
                            if (controlsRef.current) {
                                controlsRef.current.update();
                            } else if (autoRotate && model) {
                                // 如果没有控制器但启用了自动旋转
                                model.rotation.y += 0.01;
                            }

                            // 在每一帧渲染前清除画布
                            renderer.clear();
                            renderer.render(scene, camera);
                            // @ts-ignore
                            animationRef.current = THREE.$requestAnimationFrame(animate);
                        } catch (e) {
                            console.error('动画渲染错误:', e);
                        }
                    };
                };

                let animate;

                // 加载3D模型
                try {
                    // 使用GLTFLoader
                    console.log('正在准备加载模型:', modelUrl);

                    if (!modelUrl || modelUrl === '') {
                        console.log('未提供有效的模型URL，显示加载失败');
                        setLoadError('未提供有效的模型URL');
                        setIsLoading(false);
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

                                // 添加加载的模型
                                console.log('模型加载成功:', gltf);
                                const model = gltf.scene;

                                // 遍历模型中的所有网格，禁用阴影
                                model.traverse((child: any) => {
                                    if (child.isMesh) {
                                        child.castShadow = false;
                                        child.receiveShadow = false;

                                        // 处理材质，优化光照响应
                                        if (child.material) {
                                            // 确保材质双面可见
                                            child.material.side = THREE.DoubleSide;

                                            // 如果是MeshStandardMaterial，调整其属性
                                            if (child.material.type === 'MeshStandardMaterial') {
                                                child.material.roughness = Math.min(child.material.roughness, 0.85);
                                                child.material.metalness = Math.max(child.material.metalness, 0.1);
                                                child.material.envMapIntensity = 0.75;
                                            }

                                            // 为所有材质增加少量的环境色
                                            if (child.material.color) {
                                                const baseColor = child.material.color.clone();

                                                // 向材质颜色添加黄色调
                                                child.material.color.r = Math.min(1, baseColor.r * 1.05);
                                                child.material.color.g = Math.min(1, baseColor.g * 1.03);
                                                child.material.color.b = Math.max(0, baseColor.b * 0.95);

                                                // 添加黄色调的自发光
                                                child.material.emissive = new THREE.Color(
                                                    0.05,
                                                    0.03,
                                                    0.01
                                                );
                                            }

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
                                // 进一步增大系数，使模型显示更小
                                camera.position.z = maxDim * 3.2 || 8;

                                // 创建并开始动画循环
                                animate = createAnimationLoop(model);
                                animate();
                                setIsLoading(false);

                                // 调用加载完成回调
                                if (onLoad && typeof onLoad === 'function') {
                                    onLoad();
                                }
                            } catch (e) {
                                console.error('处理加载成功的模型时发生错误:', e);
                                setLoadError(`处理模型时发生错误: ${(e as Error).message}`);
                                setIsLoading(false);
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
                            setLoadError(`模型加载失败: ${error.message}`);
                            setIsLoading(false);
                        }
                    );
                } catch (loaderError) {
                    console.error('创建或使用GLTFLoader时发生错误:', loaderError);
                    setLoadError(`加载器初始化失败: ${(loaderError as Error).message}`);
                    setIsLoading(false);
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
            {!isLoading && !loadError && enableControls && (
                <div className="zoom-tip">
                    <p>双指缩放可调整模型大小</p>
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