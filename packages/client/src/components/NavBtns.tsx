import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
// import { ArrowLeft, Home } from '@nutui/icons-react-taro'
import './NavBtns.scss'

interface NavBtnsProps {
    title?: string
    showBack?: boolean
    showHome?: boolean
    showBill?: boolean
    showComponent?: boolean
    backText?: string
    homeText?: string
    onBack?: () => void
    onHome?: () => void
    customStyle?: React.CSSProperties
}

/**
 * 子页面导航按钮组件
 * 提供返回上一页和回到首页的功能
 */
export default function NavBtns({
    title = '',
    showBack = true,
    showHome = true,
    showBill = false,
    showComponent = false,
    backText = '返回',
    homeText = '首页',
    onBack,
    onHome,
    customStyle = {}
}: NavBtnsProps) {
    // 返回上一页
    const handleBack = () => {
        if (onBack) {
            onBack()
        } else {
            // 使用try-catch避免TypeScript的类型错误
            try {
                Taro.navigateBack({ delta: 1 })
            } catch (e) {
                handleHome()
            }
        }
    }

    // 返回首页
    const handleHome = () => {
        if (onHome) {
            onHome()
        } else {
            try {
                Taro.redirectTo({ url: '/pages/index/index' })
            } catch (error) {
                console.error('导航到首页失败', error)
            }
        }
    }
    // 重置风铃
    const handleBill = () => {
        console.log('重置风铃')
    }
    // 构件
    const handleComponent = () => {
        Taro.navigateTo({ url: '/subPackages/towerDetail/componentDetail/index' })
        console.log('组件')
    }
    return (
        <View className='nav-btns' style={customStyle}>
            {/* {title && <View className='nav-title'>{title}</View>} */}

            {showBack && (
                <View className='nav-btn back-btn' onClick={handleBack}>
                    <Text>{backText}</Text>
                </View>
            )}
            {showComponent && (
                <View className='nav-btn component-btn' onClick={handleComponent}>
                    <Text>{'查看构件'}</Text>
                </View>
            )}
            {showBill && (
                <View className='nav-btn bill-btn' onClick={handleBill}>
                    <Text>{'重置风铃'}</Text>
                </View>
            )}
            {showHome && (
                <View className='nav-btn home-btn' onClick={handleHome}>
                    <Text>{homeText}</Text>
                </View>
            )}
        </View>
    )
}
