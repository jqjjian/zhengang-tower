import { Canvas, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import './index.scss';
// import btnTexturePath from '@/subPackages/towerDetail/static/images/btn-1.webp';

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
    lightingPreset?: 'default' | 'detail'; // 新增：光照预设
    lockVerticalRotation?: boolean; // 新增：是否锁定垂直旋转
    onCanvasTap?: (event: any) => void; // New prop for tap events
}

// Define handles structure for useImperativeHandle
export interface ThreeModelHandles {
    getScene: () => THREE.Scene | null;
    getCamera: () => THREE.PerspectiveCamera | null;
    getModelBox: () => THREE.Box3 | null;
    getWindowSize: () => { width: number; height: number };
    registerAnimationCallback: (callback: () => void) => void;
    unregisterAnimationCallback: (callback: () => void) => void;
    setCameraLookAt: (target: THREE.Vector3, position?: THREE.Vector3) => void;
}

/**
 * 3D模型显示组件 - Refactored to only render the model and provide API
 */
const ThreeModel = forwardRef<ThreeModelHandles, ThreeModelProps>(({
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
    lightingPreset = 'default',
    lockVerticalRotation = false,
    onCanvasTap
}, ref) => {
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
    const modelBoxRef = useRef<any>(null);
    const animationCallbacksRef = useRef<Set<() => void>>(new Set());

    // Expose API via useImperativeHandle
    useImperativeHandle(ref, () => ({
        getScene: () => sceneRef.current,
        getCamera: () => cameraRef.current,
        getModelBox: () => modelBoxRef.current,
        getWindowSize: () => windowSize,
        registerAnimationCallback: (callback) => {
            animationCallbacksRef.current.add(callback);
            console.log('Animation callback registered. Count:', animationCallbacksRef.current.size);
        },
        unregisterAnimationCallback: (callback) => {
            animationCallbacksRef.current.delete(callback);
            console.log('Animation callback unregistered. Count:', animationCallbacksRef.current.size);
        },
        setCameraLookAt: (target, position) => {
            if (cameraRef.current && controlsRef.current) {
                console.log('Setting camera lookAt:', target, 'Position:', position);
                controlsRef.current.target.copy(target);
                if (position) {
                    cameraRef.current.position.copy(position);
                }
                controlsRef.current.update();
            } else {
                console.warn('Camera or Controls not ready for setCameraLookAt');
            }
        }
    }));

    // 获取窗口尺寸
    useEffect(() => {
        if (fullscreen) {
            try {
                const systemInfo = Taro.getSystemInfoSync();
                setWindowSize({ width: systemInfo.windowWidth, height: systemInfo.windowHeight });
            } catch (e) { console.error('获取窗口尺寸失败:', e); }
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
            if (animationRef.current !== null) { try { THREE.$cancelAnimationFrame(animationRef.current); } catch (e) { console.error('清理动画循环失败:', e); } }
            if (sceneRef.current && modelRef.current) { try { sceneRef.current.remove(modelRef.current); } catch (e) { console.error('清理场景资源失败:', e); } }
            if (controlsRef.current) { try { controlsRef.current.dispose(); } catch (e) { console.error('清理OrbitControls失败:', e); } }
            if (rendererRef.current) { try { rendererRef.current.dispose(); } catch (e) { console.error('清理渲染器失败:', e); } }
            animationCallbacksRef.current.clear();
        };
    }, []);

    // 组件挂载后初始化3D场景
    useEffect(() => {
        let shouldCleanup = true;
        const initScene = async () => {
            try {
                setIsLoading(true);
                setLoadError(null);
                let canvas;
                try {
                    // Using Taro.createSelectorQuery and suppressing potential linter error
                    // @ts-ignore - Suppress error as this is the standard Taro API usage
                    const query = Taro.createSelectorQuery();
                    canvas = await new Promise<any>((resolve, reject) => {
                        query.select(`#${canvasId}`)
                            .fields({ node: true, size: true })
                            .exec((res) => {
                                if (res && res[0] && res[0].node) resolve(res[0].node);
                                else reject(new Error('获取Canvas节点失败'));
                            });
                    });
                    if (!canvas || typeof canvas.getContext !== 'function') throw new Error('Canvas对象不可用');
                    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false, preserveDrawingBuffer: false });
                    if (!gl) throw new Error('WebGL不支持');
                    const originalGetContext = canvas.getContext;
                    canvas.getContext = function (contextType, ...args) {
                        if (contextType === '2d') return createEmptyContext();
                        if (contextType === 'webgl2') contextType = 'webgl';
                        return originalGetContext.call(this, contextType, ...args);
                    };
                } catch (err) { throw new Error(`Canvas失败: ${err.message}`); }
                if (!shouldCleanup) return;
                const platform = new WechatPlatform(canvas);
                platformRef.current = platform; PLATFORM.set(platform);
                const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'default', precision: 'highp', context: canvas.getContext('webgl', { alpha: true, antialias: true, depth: true, premultipliedAlpha: true, preserveDrawingBuffer: false, stencil: true }) });
                renderer.setSize(windowSize.width, windowSize.height);
                renderer.setClearColor(0x000000, 0);
                renderer.outputEncoding = THREE.sRGBEncoding;
                renderer.toneMapping = THREE.ACESFilmicToneMapping;
                renderer.toneMappingExposure = 1.1;
                renderer.shadowMap.enabled = false;
                rendererRef.current = renderer;
                try { const pixelRatio = Taro.getSystemInfoSync().pixelRatio; renderer.setPixelRatio(pixelRatio); } catch (e) { renderer.setPixelRatio(2); }
                const scene = new THREE.Scene(); scene.background = null; sceneRef.current = scene;
                const camera = new THREE.PerspectiveCamera(60, windowSize.width / windowSize.height, 0.1, 1000); cameraRef.current = camera;
                const oldLight = camera.getObjectByName('directFrontCameraLight'); if (oldLight) camera.remove(oldLight);
                const oldSunLight = camera.getObjectByName('cameraSunLight'); if (oldSunLight) camera.remove(oldSunLight);
                if (enableControls) {
                    const controls = new OrbitControls(camera, canvas);
                    controls.enableDamping = false; controls.enableZoom = true; controls.zoomSpeed = 1.2; controls.minDistance = 1; controls.maxDistance = 30;
                    if (lockVerticalRotation) {
                        const verticalRotationLimit = 0.1;
                        controls.minPolarAngle = Math.PI / 2 - verticalRotationLimit;
                        controls.maxPolarAngle = Math.PI / 2 + verticalRotationLimit;
                    }
                    controlsRef.current = controls;
                }
                if (lightingPreset === 'detail') {
                    let ambientLightIntensity = 0.8;
                    let cameraLightIntensity = 1.0;
                    const ambientLightDetail = new THREE.AmbientLight(0xffffff, ambientLightIntensity);
                    scene.add(ambientLightDetail);
                    const cameraLightDetail = new THREE.DirectionalLight(0xffffff, cameraLightIntensity);
                    cameraLightDetail.position.set(1, 1, -2); cameraLightDetail.name = 'cameraSunLight'; camera.add(cameraLightDetail);
                } else {
                    const ambientLightDefault = new THREE.AmbientLight(0xfff8e1, 0.35); scene.add(ambientLightDefault);
                    const lightIntensityDefault = 0.45;
                    const lightTop = new THREE.DirectionalLight(0xffffff, lightIntensityDefault); lightTop.position.set(0, 10, 0); scene.add(lightTop);
                    const lightBottom = new THREE.DirectionalLight(0xffffff, lightIntensityDefault * 0.5); lightBottom.position.set(0, -10, 0); scene.add(lightBottom);
                    const lightFront = new THREE.DirectionalLight(0xffffff, lightIntensityDefault); lightFront.position.set(0, 0, 10); scene.add(lightFront);
                    const lightBack = new THREE.DirectionalLight(0xffffff, lightIntensityDefault); lightBack.position.set(0, 0, -10); scene.add(lightBack);
                    const lightLeft = new THREE.DirectionalLight(0xffffff, lightIntensityDefault); lightLeft.position.set(-10, 0, 0); scene.add(lightLeft);
                    const lightRight = new THREE.DirectionalLight(0xffffff, lightIntensityDefault); lightRight.position.set(10, 0, 0); scene.add(lightRight);
                }
                if (showAxesHelper) { const axesHelper = new THREE.AxesHelper(5); scene.add(axesHelper); }

                // 设置动画循环函数
                const createAnimationLoop = (model) => {
                    return () => { // animate function
                        if (!shouldCleanup) return;
                        try {
                            animationCallbacksRef.current.forEach(callback => callback());

                            renderer.clear();
                            renderer.render(scene, camera);
                            animationRef.current = THREE.$requestAnimationFrame(animate);
                        } catch (e) {
                            console.error('动画渲染错误:', e);
                        }
                    };
                };

                let animate;

                // 加载3D模型
                try {
                    console.log('正在准备加载模型:', modelUrl);
                    if (!modelUrl || modelUrl === '') { setLoadError('未提供模型URL'); setIsLoading(false); return; }
                    const processedUrl = modelUrl.includes('@/') ? modelUrl.replace('@/', '') : modelUrl;
                    THREE.ImageBitmapLoader.prototype.load = function (url, onLoad) { const bm = { width: 1, height: 1, close: () => { } } as ImageBitmap; if (onLoad) setTimeout(() => onLoad(bm), 0); return bm; };
                    const loader = new GLTFLoader();

                    loader.load(
                        processedUrl,
                        (gltf) => {
                            try {
                                if (!shouldCleanup) return;
                                const model = gltf.scene;
                                modelRef.current = model;
                                model.traverse((child: any) => {
                                    if (child.isMesh) {
                                        child.castShadow = false; child.receiveShadow = false;
                                        if (child.material) {
                                            if (child.material.side !== undefined) child.material.side = THREE.DoubleSide;
                                            if (child.material.isMeshStandardMaterial) { child.material.roughness = Math.min(child.material.roughness ?? 1.0, 0.85); child.material.metalness = Math.max(child.material.metalness ?? 0.0, 0.1); child.material.envMapIntensity = 0.75; }
                                            child.material.needsUpdate = true;
                                        }
                                    }
                                });
                                scene.add(model);

                                // 调整模型位置和大小 (Default centering)
                                const box = new THREE.Box3().setFromObject(model);
                                const size = box.getSize(new THREE.Vector3());
                                const center = box.getCenter(new THREE.Vector3());
                                model.position.sub(center); // Center the model at origin
                                model.updateMatrixWorld(true);
                                const finalBox = new THREE.Box3().setFromObject(model); // Recalculate box after moving
                                modelBoxRef.current = finalBox;
                                const maxDim = Math.max(size.x, size.y, size.z);

                                // Default Camera Position (Always center initially)
                                cameraRef.current.position.z = maxDim * 1.8 || 8;
                                const lookAtCenter = new THREE.Vector3(0, 0, 0); // Look at origin now model is centered
                                cameraRef.current.position.x = lookAtCenter.x;
                                cameraRef.current.position.y = lookAtCenter.y;
                                cameraRef.current.lookAt(lookAtCenter);
                                if (controlsRef.current) {
                                    controlsRef.current.target.copy(lookAtCenter);
                                    controlsRef.current.update();
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
                        (progress) => { console.log(`模型加载进度: ${(progress.loaded / progress.total * 100 || 0).toFixed(0)}%`); },
                        (error) => { console.error('模型加载失败:', error); setLoadError(`模型加载失败: ${error.message}`); setIsLoading(false); }
                    );
                } catch (loaderError) {
                    console.error('创建或使用GLTFLoader时发生错误:', loaderError);
                    setLoadError(`加载器初始化失败: ${(loaderError as Error).message}`);
                    setIsLoading(false);
                }

            } catch (error) {
                if (shouldCleanup) {
                    console.error('初始化3D场景失败:', error);
                    setLoadError(`初始化3D场景失败: ${(error as Error).message}`);
                    setIsLoading(false);
                }
            }
        };

        initScene().catch(error => {
            console.error('initScene Promise错误:', error);
            if (shouldCleanup) { setLoadError(`初始化3D场景失败: ${(error as Error).message}`); setIsLoading(false); }
        });

        return () => {
            shouldCleanup = false;
            if (animationRef.current !== null) { try { THREE.$cancelAnimationFrame(animationRef.current); } catch (e) { console.error('卸载时清理动画循环失败:', e); } }
            animationCallbacksRef.current.clear();
        };
    }, [canvasId, modelUrl, windowSize.width, windowSize.height, autoRotate, modelColor, showErrorModel, enableControls, showAxesHelper, lightingPreset, lockVerticalRotation]);

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
                onTap={onCanvasTap}
            />
            {/* --- 添加覆盖按钮 --- */}
            {/* <Image
                src={btnTexturePath} // <<< 替换成正确的图片路径!
                style={{
                    position: 'absolute',
                    width: '50px', // 按钮宽度 (px)
                    height: '50px', // 按钮高度 (px)
                    right: '20px',  // 距离右边距离 (px)
                    bottom: '30px', // 距离底部距离 (px)
                    zIndex: 10      // 确保在Canvas之上
                }}
                mode="aspectFit" // 根据需要调整图片缩放模式
                onTap={() => {
                    // 在这里处理按钮点击逻辑
                    console.log('Overlay Button Clicked!');
                    // 例如：Taro.navigateTo({ url: '/pages/somepage/index' });
                }}
            /> */}
            {/* ------------------- */}
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
});

export default ThreeModel; 