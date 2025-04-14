import { View, Image, Text } from '@tarojs/components'
import React, { useEffect, useState, useRef } from 'react'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
// 直接从根模块导入而不是按需加载
import { Star, Location, Service } from '@nutui/icons-react-taro'
// 不再使用navigate辅助函数，直接使用Taro.navigateTo
// import { navigate } from '@/utils/navigation'
// 按需导入duxui组件
// 导入样式
import './index.scss'
import { RESOURCE_URL } from '@/config'
import { wxLogin, checkLogin } from '@/services/auth'
import NavBtns from '@/components/NavBtns'

// 调试图标组件
console.log('Star组件:', Star)
console.log('Location组件:', Location)
console.log('Service组件:', Service)

export default function Index() {
    // 登录状态
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isModelReady, setIsModelReady] = useState(false)
    const [ThreeModel, setThreeModel] = useState<any>(null)
    const modelUrl = `${RESOURCE_URL}/models/Tower.glb`
    const modelContainerRef = useRef<any>(null)

    // 异步加载分包中的ThreeModel组件
    useEffect(() => {
        // 使用动态导入加载ThreeModel组件
        setIsModelReady(false);

        try {
            // 尝试动态导入组件
            import('../../subPackages/3d-model/components/ThreeModel')
                .then(module => {
                    console.log('3D模型组件加载成功');
                    setThreeModel(() => module.default);
                    setIsModelReady(true);
                })
                .catch(err => {
                    console.error('加载3D组件失败:', err);
                    setIsModelReady(true); // 即使失败也设置为准备好，显示占位符
                });
        } catch (error) {
            console.error('导入路径错误:', error);
            setIsModelReady(true);
        }
    }, [])

    // 页面加载时检查登录状态
    useEffect(() => {
        const isLoggedIn = checkLoginStatus()
        if (!isLoggedIn) {
            // 如果未登录，直接弹窗询问是否授权
            Taro.showModal({
                title: '授权登录',
                content: '欢迎使用镇岗塔小程序，请授权微信登录以使用全部功能',
                confirmText: '确认登录',
                cancelText: '暂不登录',
                success: (res) => {
                    if (res.confirm) {
                        handleLogin()
                    }
                }
            })
        }
    }, [])

    // 检查登录状态
    const checkLoginStatus = () => {
        const loginStatus = checkLogin()
        setIsLoggedIn(loginStatus)
        return loginStatus
    }

    // 处理微信登录
    const handleLogin = async () => {
        if (isLoading) return

        setIsLoading(true)

        try {
            // 调用微信登录
            await wxLogin()

            // 更新登录状态
            setIsLoggedIn(true)

            Taro.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 2000
            })
        } catch (error) {
            console.error('登录失败:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // 跳转到许愿页面
    const goToWishTower = () => {
        // 检查是否已登录
        if (!checkLoginStatus()) {
            // 如果未登录，直接弹窗询问是否授权
            Taro.showModal({
                title: '需要登录',
                content: '许愿功能需要先登录，是否现在登录？',
                confirmText: '确认登录',
                cancelText: '取消',
                success: (res) => {
                    if (res.confirm) {
                        handleLogin().then(() => {
                            // 登录成功后直接跳转
                            Taro.navigateTo({ url: '/subPackages/wish/pages/wishTower/index' })
                        })
                    }
                }
            })
            return
        }

        // 已登录，直接跳转
        Taro.navigateTo({ url: '/subPackages/wish/pages/wishTower/index' })
    }

    // Taro 特有的生命周期 Hooks
    useDidShow(() => {
        console.log('页面显示')
    })

    useDidHide(() => {
        console.log('页面隐藏')
    })

    // 各功能按钮点击处理
    const handleInteract = () => {
        console.log('点击互动')
        // 这里可以添加与塔互动的逻辑
    }

    const handleDecorate = () => {
        console.log('装饰宝塔')
        Taro.navigateTo({ url: '/subPackages/decoration/pages/decorateTower/index' })
    }

    const handleLight = () => {
        console.log('点亮宝塔')
        // 暂时未创建点亮宝塔分包
        Taro.showToast({
            title: '功能开发中',
            icon: 'none'
        })
    }

    const handleCulture = () => {
        console.log('文化知识')
        Taro.navigateTo({ url: '/subPackages/culture/pages/culturalKnowledge/index' })
    }

    const handleViewModel = () => {
        console.log('查看3D模型');
        // 跳转到分包中的模型查看器页面
        Taro.navigateTo({
            url: `/subPackages/3d-model/pages/model-viewer/index?modelUrl=${encodeURIComponent(`${RESOURCE_URL}/models/Tower.glb`)}`
        });
    }

    return (
        <View className='index'>
            {/* <View className='header'>
                <Text className='title'>镇岗塔</Text>
                <Text className='subtitle'>宇台·云岗</Text>
            </View> */}
            <View className='tower-title'>
                {/* <Image
                    className='tower-image'
                    src='/static/images/title.webp'
                    mode='aspectFit'
                /> */}
            </View>
            <View>

            </View>
            {/* 塔的3D模型展示区域 */}
            <View className='tower-container'>
                {/* 使用透明背景，放在图片前方 */}

                <View className="model-container" ref={modelContainerRef}>
                    {!isModelReady ? (
                        <View className="model-loading">
                            <View className="model-loading-spinner"></View>
                            <View className="model-loading-text">3D模型加载中...</View>
                        </View>
                    ) : ThreeModel ? (
                        <>
                            {React.createElement(ThreeModel, {
                                modelUrl,
                                fullscreen: true,
                                backgroundColor: "transparent",
                                autoRotate: true
                            })}
                        </>
                    ) : (
                        <View className="model-placeholder" onClick={handleViewModel}>
                            <View className="model-placeholder-text">点击查看3D模型</View>
                        </View>
                    )}
                </View>

                {/* 直接使用样式中的塔图片作为背景 */}
                {/* <Image
                    className='tower-image'
                    src={`${RESOURCE_URL}/images/tower.webp`}
                /> */}

                {/* 交互按钮 */}
                {/* <View className='interact-button' onClick={handleInteract}>
                    <Text className='interact-text'>点击互动</Text>
                </View> */}
            </View>
            <View className='tower-menus'>
                <View className='tower-menu-item' onClick={goToWishTower}>
                    <Image
                        className='tower-menu-image'
                        src={`${RESOURCE_URL}/images/wish-icon.webp`}
                        mode='aspectFit'
                    />
                    <Text className='tower-menu-text'>向塔许愿</Text>
                </View>
                <View className='tower-menu-item' onClick={handleDecorate}>
                    <Image
                        className='tower-menu-image'
                        src={`${RESOURCE_URL}/images/decorate-icon.webp`}
                        mode='aspectFit'
                    />
                    <Text className='tower-menu-text'>装饰宝塔</Text>
                </View>
                <View className='tower-menu-item' onClick={handleLight}>
                    <Image
                        className='tower-menu-image'
                        src={`${RESOURCE_URL}/images/light-icon.webp`}
                        mode='aspectFit'
                    />
                    <Text className='tower-menu-text'>点亮宝塔</Text>
                </View>
                <View className='tower-menu-item' onClick={handleCulture}>
                    <Image
                        className='tower-menu-image'
                        src={`${RESOURCE_URL}/images/culture-icon.webp`}
                        mode='aspectFit'
                    />
                    <Text className='tower-menu-text'>文化知识</Text>
                </View>
            </View>
            {/* 功能按钮区域 - 按照效果图排列 */}
            {/* <View className='function-container'>
                <View className='function-row'>
                    <View className='function-button' onClick={handleWish}>
                        <Image
                            className='function-image'
                            src='/static/images/wish-icon.png'
                            mode='aspectFit'
                        />
                        <Text className='function-text'>向塔许愿</Text>
                    </View>

                    <View className='function-button' onClick={handleDecorate}>
                        <Image
                            className='function-image'
                            src='/static/images/decorate-icon.png'
                            mode='aspectFit'
                        />
                        <Text className='function-text'>装饰宝塔</Text>
                    </View>
                </View>

                <View className='function-row'>
                    <View className='function-button' onClick={handleLight}>
                        <Image
                            className='function-image'
                            src='/static/images/light-icon.png'
                            mode='aspectFit'
                        />
                        <Text className='function-text'>点亮宝塔</Text>
                    </View>

                    <View className='function-button' onClick={handleCulture}>
                        <Image
                            className='function-image'
                            src='/static/images/culture-icon.png'
                            mode='aspectFit'
                        />
                        <Text className='function-text'>文化知识</Text>
                    </View>
                </View>
            </View> */}

            {/* 登录按钮 - 未登录时显示 */}
            {/* 已移除登录按钮，直接在页面加载时提示登录 */}

            {/* 底部导航 */}
            <NavBtns showBack={false} showHome={false} />
        </View>
    )
}
