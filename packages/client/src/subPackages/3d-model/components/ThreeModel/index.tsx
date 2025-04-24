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
    focusPart?: 'top' | 'middle' | 'bottom' | null; // 新增：需要聚焦的部位
    lightingPreset?: 'default' | 'detail'; // 新增：光照预设
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
    onLoad,
    focusPart = null, // 默认不聚焦
    lightingPreset = 'default' // 默认光照预设
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
    const raycasterRef = useRef<any>(null);
    const modelBoxRef = useRef<any>(null);
    const hotspotsRef = useRef<THREE.Sprite[]>([]);

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

    // 创建并添加热点 (作为场景的子对象)
    const createHotspots = (scene, box) => {
        return false
        // 清理旧热点（如果存在）
        hotspotsRef.current.forEach(hp => scene.remove(hp));
        hotspotsRef.current = [];

        // TODO: 替换为发光纹理
        const hotspotMaterial = new THREE.SpriteMaterial({
            color: 0xffffff, // 白色
            // map: texture, // 加载的发光纹理
            blending: THREE.AdditiveBlending, // 混合模式，模拟发光
            transparent: true, // 开启透明
            opacity: 0.85, // 设置透明度
            depthTest: false, // 禁用深度测试，总是可见（可能需要调整）
            sizeAttenuation: true // 大小随距离衰减，保持视觉大小相对稳定
        });

        const modelHeight = box.max.y - box.min.y;
        const modelRadiusEstimate = (box.max.x - box.min.x) * 0.5; // 估算模型半径用于Z定位

        const hotspotScale = modelHeight * 0.03;

        // 定义热点位置（需要根据模型微调）
        const positions = [
            // 使用之前确定的低比例，基于世界坐标的 box.min.y
            new THREE.Vector3(0, box.min.y + modelHeight * 0.70, modelRadiusEstimate * 0.9), // 上部 (Y 比例提高到 0.70)
            new THREE.Vector3(0, box.min.y + modelHeight * 0.4, modelRadiusEstimate * 1.0), // 中部, 稍突出
            new THREE.Vector3(0, box.min.y + modelHeight * 0.05, modelRadiusEstimate * 0.9)  // 下部 (非常靠近底部)
        ];

        positions.forEach((pos, index) => {
            const hotspot = new THREE.Sprite(hotspotMaterial.clone());
            console.log(`Hotspot ${index + 1} - Calculated Y: ${pos.y.toFixed(2)}, Target Pos:`, pos);
            hotspot.position.copy(pos);
            hotspot.scale.set(hotspotScale, hotspotScale, hotspotScale); // 设置大小
            scene.add(hotspot);
            hotspotsRef.current.push(hotspot);
        });
    };

    // 处理点击事件
    const handleTap = (e: any) => {
        if (!modelRef.current || !cameraRef.current || !modelBoxRef.current) return;

        try {
            // 1. 获取点击坐标 (相对于Canvas)
            const touch = e.touches[0];
            const { clientX, clientY } = touch;

            // 注意：这里需要获取Canvas的实际屏幕位置来计算相对坐标
            // Taro.createSelectorQuery() 在事件处理函数中可能异步，需要更可靠的方式
            // 暂时假设点击坐标是相对于Canvas左上角的，需要根据实际情况调整
            // 更稳妥的方式是在组件加载时获取Canvas位置并存储

            // 获取Canvas的尺寸
            const canvasWidth = windowSize.width;
            const canvasHeight = windowSize.height;

            // 2. 转换为归一化设备坐标 (NDC)
            const mouse = new THREE.Vector2();
            // 注意：这里假设 canvas 左上角为 (0,0)。如果不是，需要减去 canvas 的 offsetLeft/offsetTop
            mouse.x = (clientX / canvasWidth) * 2 - 1;
            mouse.y = -(clientY / canvasHeight) * 2 + 1;

            // 3. 初始化并设置 Raycaster
            if (!raycasterRef.current) {
                raycasterRef.current = new THREE.Raycaster();
            }
            raycasterRef.current.setFromCamera(mouse, cameraRef.current);

            // 4. 检测交点
            const intersects = raycasterRef.current.intersectObject(modelRef.current, true);

            if (intersects.length > 0) {
                const intersectionPoint = intersects[0].point;
                console.log('Clicked Point:', intersectionPoint);

                // 5. 判断区域 (基于Y坐标和包围盒)
                const box = modelBoxRef.current;
                const modelHeight = box.max.y - box.min.y;
                const relativeY = intersectionPoint.y - box.min.y; // 相对于底部的Y坐标

                let targetPage = '';
                if (relativeY > modelHeight * 0.66) { // 上部 (顶部1/3)
                    console.log('Clicked Top Section');
                    targetPage = '/subPackages/towerDetail/top/index'; // 替换为实际页面路径
                } else if (relativeY > modelHeight * 0.33) { // 中部 (中间1/3)
                    console.log('Clicked Middle Section');
                    targetPage = '/subPackages/towerDetail/middle/index'; // 替换为实际页面路径
                } else { // 下部 (底部1/3)
                    console.log('Clicked Bottom Section');
                    targetPage = '/subPackages/towerDetail/bottom/index'; // 替换为实际页面路径
                }

                // 6. 页面跳转
                if (targetPage) {
                    Taro.navigateTo({ url: targetPage });
                }
            }
        } catch (error) {
            console.error('处理点击事件失败:', error);
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
            // 清理平台资源 - !!! 不应该在这里调用全局 dispose !!!
            // if (platformRef.current) {
            //     try {
            //         // PLATFORM.dispose(); // 全局 dispose 会影响其他实例
            //     } catch (e) {
            //         console.error('清理平台资源失败:', e);
            //     }
            // }
            // 新增：清理 OrbitControls
            if (controlsRef.current) {
                try {
                    // @ts-ignore 忽略可能的类型错误
                    controlsRef.current.dispose();
                } catch (e) {
                    console.error('清理OrbitControls失败:', e);
                }
            }
            // 清理渲染器
            if (rendererRef.current) {
                try {
                    rendererRef.current.dispose();
                } catch (e) {
                    console.error('清理渲染器失败:', e);
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
                renderer.toneMappingExposure = 1.1; // 再次调整曝光度 (原为 1.0)
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
                // camera.position.z = 10; // 初始距离将在模型加载后根据大小调整
                cameraRef.current = camera;

                // 移除所有之前的相机附加光源
                // 清理旧的相机光源，以防万一
                const oldLight = camera.getObjectByName('directFrontCameraLight');
                if (oldLight) camera.remove(oldLight);

                // 移除之前可能添加的相机方向光（以防万一）
                const oldSunLight = camera.getObjectByName('cameraSunLight');
                if (oldSunLight) camera.remove(oldSunLight);

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

                // 添加灯光 - 根据预设选择
                if (lightingPreset === 'detail') {
                    // --- 细节视图光照 --- (环境光 + 相机方向光)
                    // 根据 focusPart 动态调整强度
                    let ambientLightIntensity = 0.8; // 默认环境光强度
                    let cameraLightIntensity = 1.0; // 默认相机方向光强度

                    // 如果是顶部或中部细节，额外增加亮度
                    if (focusPart === 'top' || focusPart === 'middle') {
                        ambientLightIntensity = 1.5; // <<< 大幅增加顶部/中部视图的环境光强度
                        cameraLightIntensity = 1.5; // <<< 顶部/中部视图时也保持较高相机光强度
                        console.log(`Applying extra brightness for ${focusPart} detail view.`);
                    }

                    // 应用最终的光照强度
                    const ambientLightDetail = new THREE.AmbientLight(0xffffff, ambientLightIntensity);
                    scene.add(ambientLightDetail);

                    const cameraLightDetail = new THREE.DirectionalLight(0xffffff, cameraLightIntensity);
                    cameraLightDetail.position.set(1, 1, -2); // 相对于相机的位置 (来自右前上方一点)
                    cameraLightDetail.name = 'cameraSunLight'; // 方便查找移除
                    camera.add(cameraLightDetail); // 添加到相机

                    console.log('Using DETAIL lighting preset.');

                } else {
                    // --- 默认视图光照 (首页) --- (六向 + 环境光)
                    const ambientLightDefault = new THREE.AmbientLight(0xfff8e1, 0.35); // 基础环境光，暖色调
                    scene.add(ambientLightDefault);

                    const lightIntensityDefault = 0.45; // 每个方向光的强度

                    // 上方光
                    const lightTop = new THREE.DirectionalLight(0xffffff, lightIntensityDefault);
                    lightTop.position.set(0, 10, 0);
                    scene.add(lightTop);

                    // 下方光
                    const lightBottom = new THREE.DirectionalLight(0xffffff, lightIntensityDefault * 0.5);
                    lightBottom.position.set(0, -10, 0);
                    scene.add(lightBottom);

                    // 前方光 (Z+)
                    const lightFront = new THREE.DirectionalLight(0xffffff, lightIntensityDefault);
                    lightFront.position.set(0, 0, 10);
                    scene.add(lightFront);

                    // 后方光 (Z-)
                    const lightBack = new THREE.DirectionalLight(0xffffff, lightIntensityDefault);
                    lightBack.position.set(0, 0, -10);
                    scene.add(lightBack);

                    // 左方光 (X-)
                    const lightLeft = new THREE.DirectionalLight(0xffffff, lightIntensityDefault);
                    lightLeft.position.set(-10, 0, 0);
                    scene.add(lightLeft);

                    // 右方光 (X+)
                    const lightRight = new THREE.DirectionalLight(0xffffff, lightIntensityDefault);
                    lightRight.position.set(10, 0, 0);
                    scene.add(lightRight);

                    console.log('Using DEFAULT lighting preset.');
                }

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
                                            if (child.material.side !== undefined) {
                                                child.material.side = THREE.DoubleSide;
                                            }

                                            // 如果是MeshStandardMaterial，调整其属性
                                            if (child.material.isMeshStandardMaterial) {
                                                child.material.roughness = Math.min(child.material.roughness ?? 1.0, 0.85);
                                                child.material.metalness = Math.max(child.material.metalness ?? 0.0, 0.1);
                                                child.material.envMapIntensity = 0.75;
                                            }

                                            // 检查 color 属性是否存在且可用
                                            if (child.material.color && typeof child.material.color.set === 'function') {
                                                // 这里可以保留之前调整颜色的代码，或者留空
                                                // const baseColor = child.material.color.clone();
                                                // ... 颜色调整代码 ...
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

                                // 应用居中位移
                                model.position.x = -center.x;
                                model.position.y = -center.y;
                                model.position.z = -center.z;

                                // 更新世界矩阵并获取最终的世界包围盒
                                model.updateMatrixWorld(true);
                                const finalBox = new THREE.Box3().setFromObject(model);
                                modelBoxRef.current = finalBox; // 存储最终的包围盒信息

                                // 计算模型的最大维度，用于后续距离计算
                                const maxDim = Math.max(size.x, size.y, size.z);

                                // 根据 focusPart 调整相机焦点和位置
                                if (focusPart && controlsRef.current && cameraRef.current) {
                                    const box = modelBoxRef.current; // 使用最终的世界包围盒
                                    const center = box.getCenter(new THREE.Vector3());
                                    const modelHeight = box.getSize(new THREE.Vector3()).y;

                                    let targetY;
                                    let zoomFactor = 0.5; // 默认缩放系数，越小越近
                                    switch (focusPart) {
                                        case 'top':
                                            targetY = box.min.y + modelHeight * 0.65; // <<< 再次降低聚焦 Y 点位 (原为 0.75)
                                            zoomFactor = 0.7;
                                            break;
                                        case 'middle':
                                            targetY = box.min.y + modelHeight * 0.28; // <<< 再次降低聚焦 Y 点位 (原为 0.35)，使模型上移更多
                                            zoomFactor = 0.45; // <<< 减小 Zoom Factor 使其更近/放大 (原为 0.55)
                                            break;
                                        case 'bottom':
                                            targetY = box.min.y + modelHeight * 0.15; // 聚焦Y点位 (可调)
                                            zoomFactor = 0.4; // <<< 减小 Zoom Factor 放大细节 (原为 0.6)
                                            break;
                                        default:
                                            targetY = center.y;
                                    }

                                    const targetPoint = new THREE.Vector3(center.x, targetY, center.z);
                                    controlsRef.current.target.copy(targetPoint);

                                    // 调整相机位置以放大 (基于最大维度和缩放系数)
                                    const distance = maxDim * zoomFactor;
                                    // 将相机放置在目标点前方，Y 坐标根据平视/俯视调整
                                    cameraRef.current.position.set(
                                        targetPoint.x,
                                        focusPart === 'middle' ? targetPoint.y + distance * 0.05 : // 中部：接近平视 (Y略高一点点)
                                            focusPart === 'top' ? targetPoint.y + distance * 0.3 : // 顶部：保持俯视
                                                targetPoint.y - distance * 0.1, // 其他(底部或默认): 略微仰视或根据需要调整
                                        targetPoint.z + distance
                                    );

                                    // 强制更新控制器状态
                                    controlsRef.current.update();
                                    console.log(`Focused on: ${focusPart}, Target:`, targetPoint, `Cam Pos:`, cameraRef.current.position);
                                } else {
                                    // 默认视图：看向模型中心，距离由 maxDim 决定
                                    cameraRef.current.position.z = maxDim * 1.8 || 8; // 默认距离调整近一点
                                    cameraRef.current.position.x = 0; // 确保默认在正前方
                                    cameraRef.current.position.y = modelBoxRef.current ? modelBoxRef.current.getCenter(new THREE.Vector3()).y : 0; // 默认看向中心高度
                                    if (controlsRef.current && modelBoxRef.current) {
                                        controlsRef.current.target.copy(modelBoxRef.current.getCenter(new THREE.Vector3()));
                                        controlsRef.current.update();
                                    }
                                }

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
    }, [canvasId, modelUrl, windowSize.width, windowSize.height, autoRotate, modelColor, showErrorModel, enableControls, showAxesHelper, focusPart, lightingPreset]);

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
                onTap={handleTap}
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