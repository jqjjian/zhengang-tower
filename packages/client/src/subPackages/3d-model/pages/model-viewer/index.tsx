import { View } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import ThreeModel from '../../components/ThreeModel'
import './index.scss'

const ModelViewer = () => {
    const router = useRouter()
    const { modelUrl } = router.params

    return (
        <View className='model-viewer-container'>
            <ThreeModel
                modelUrl={modelUrl || ''}
                fullscreen={true}
                backgroundColor="transparent"
                enableControls={true}
                autoRotate={true}
            />
        </View>
    )
}

export default ModelViewer
