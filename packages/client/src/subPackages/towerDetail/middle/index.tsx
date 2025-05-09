import { View, Text } from '@tarojs/components'
import { useState } from 'react';
import ThreeModel from '@/subPackages/3d-model/components/ThreeModel' // 确保路径正确
import { RESOURCE_URL } from '@/config'; // 引入资源URL配置
// import './index.scss'; // 可以创建一个空的 scss 文件

export default function TowerMiddleDetail() {
    const [isModelLoading, setIsModelLoading] = useState(true);

    // !!! 使用主塔模型 URL !!!
    const mainTowerModelUrl = `${RESOURCE_URL}/models/Tower.glb`; // 使用主塔模型

    const handleModelLoad = () => {
        console.log('中部细节模型加载完成');
        setIsModelLoading(false);
    }

    return (
        <View className="tower-bg">
            {/* <View className="detail-header">
                <Text>塔身中部详情</Text>
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
                    // !!! 使用上面定义的 URL !!!
                    modelUrl={mainTowerModelUrl}
                    // 根据需要调整显示参数
                    fullscreen={true}    // 示例高度
                    backgroundColor="transparent" // 或其他背景色
                    autoRotate={false}     // 细节视图通常不需要自动旋转
                    enableControls={true}   // 允许用户交互
                    // focusPart="middle"     // <<< 指定聚焦到中部
                    lightingPreset="default" // <<< 指定使用细节光照
                    onLoad={handleModelLoad}
                />
            </View>

            {/* 在这里添加中部详情的其他文本、图片等内容 */}
            {/* <View className="detail-content">
                <Text>这里是关于塔身中部结构、历史或文化意义的详细描述...</Text>
            </View> */}
        </View>
    )
} 