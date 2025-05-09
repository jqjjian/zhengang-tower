import { View, Text, CoverView } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react';
import ThreeModel, { ThreeModelHandles } from '@/subPackages/3d-model/components/ThreeModel' // 确保路径正确
import { RESOURCE_URL } from '@/config'; // 引入资源URL配置
import NavBtns from '@/components/NavBtns';
import './index.scss'; // 可以创建一个空的 scss 文件
// import Taro from '@tarojs/taro';
import * as THREE from 'three-platformize'; // Import THREE

export default function TowerTopDetail() {
    const [isModelLoading, setIsModelLoading] = useState(true);
    const modelUrl = `${RESOURCE_URL}/models/Tower.glb`; // Or get from route params if needed
    const threeModelRef = useRef<ThreeModelHandles>(null);

    const handleModelLoad = () => {
        console.log('上部细节模型加载完成');
        setIsModelLoading(false);
        focusOnTop();
    }

    // Function to handle camera focusing after model loads
    const focusOnTop = () => {
        if (!threeModelRef.current) {
            console.error("ThreeModel ref is not available.");
            return;
        }

        const modelBox = threeModelRef.current.getModelBox();
        const camera = threeModelRef.current.getCamera(); // Needed for distance calc? (maxDim)

        if (!modelBox || !camera) {
            console.error("ModelBox or Camera not available from ThreeModel.");
            return;
        }

        console.log("Focusing on top part...");

        // --- Logic restored from old ThreeModel --- 
        const size = modelBox.getSize(new THREE.Vector3());
        const center = modelBox.getCenter(new THREE.Vector3());
        const modelHeight = size.y;
        const maxDim = Math.max(size.x, size.y, size.z); // Needed for distance

        const targetY = modelBox.min.y + modelHeight * 0.65; // Y position for top focus
        const zoomFactor = 0.7; // Zoom factor for top focus - Reduced from 0.85 to magnify
        const targetPoint = new THREE.Vector3(center.x, targetY, center.z);

        const distance = maxDim * zoomFactor;
        const cameraPosition = new THREE.Vector3(
            targetPoint.x,
            targetPoint.y + distance * 0.3, // Camera slightly above target for top view
            targetPoint.z + distance        // Camera in front of target
        );
        // --- End of restored logic ---

        // Use the exposed method to set the camera
        threeModelRef.current.setCameraLookAt(targetPoint, cameraPosition);
    };

    return (
        <View className="tower-bg">
            <NavBtns showComponent={true} />
            {/* <View className="detail-header">
                <Text>塔身上部详情</Text>
            </View> */}

            {/* 3D 模型展示区域 */}
            <View className="model-display-container">
                {isModelLoading && (
                    <View className="model-loading-overlay">
                        <View className="model-loading-spinner"></View>
                        <Text className="model-loading-text">模型加载中...</Text>
                    </View>
                )}
                <ThreeModel
                    ref={threeModelRef}
                    modelUrl={modelUrl}
                    fullscreen={true}
                    backgroundColor="transparent"
                    autoRotate={false}     // 细节视图通常不需要自动旋转
                    enableControls={true}   // 允许用户交互
                    lockVerticalRotation={true} // Changed back to true to limit vertical rotation
                    lightingPreset="default" // Use detail lighting
                    onLoad={handleModelLoad}
                />
            </View>
            {/* <CoverView style={{
                position: 'fixed',
                bottom: '50px',
                left: '50px',
                width: '100px',
                height: '50px',
                backgroundColor: 'red',
                zIndex: 9999 // zIndex 意义不大，但可以加上试试
            }}>
                Test Cover
            </CoverView> */}
            {/* 在这里添加上部详情的其他文本、图片等内容 */}
            {/* <View className="detail-content">
                <Text>这里是关于塔身上部结构、历史或文化意义的详细描述...</Text>
            </View> */}
        </View>
    )
} 