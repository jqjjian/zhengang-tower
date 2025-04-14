import { View } from '@tarojs/components'
import { useState } from 'react'
import { useRouter } from '@tarojs/taro'
import ThreeModel from '../../components/ThreeModel'
import './index.scss'

const ModelViewer = () => {
    const router = useRouter()
    const { modelUrl } = router.params
    const [isLoading, setIsLoading] = useState(true)

    const handleModelLoad = () => {
        console.log('模型加载完成');
        setIsLoading(false);
    }

    return (
        <View className='model-viewer-container'>
            {isLoading && (
                <View className="model-loading">
                    <View className="model-loading-spinner"></View>
                    <View className="model-loading-text">3D模型加载中...</View>
                </View>
            )}
            <ThreeModel
                modelUrl={modelUrl || ''}
                fullscreen={true}
                backgroundColor="transparent"
                enableControls={true}
                autoRotate={true}
                onLoad={handleModelLoad}
            />
        </View>
    )
}

export default ModelViewer
