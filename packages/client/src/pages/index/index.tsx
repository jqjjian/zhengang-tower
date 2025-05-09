import { View, Image, Text } from '@tarojs/components'
import { useEffect, useState, useRef, useCallback } from 'react'
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
// import NavBtns from '@/components/NavBtns'
// 直接导入ThreeModel组件
import ThreeModel, { ThreeModelHandles } from '../../subPackages/3d-model/components/ThreeModel'
import * as THREE from 'three-platformize'
import handImage from '@/static/images/hand.webp'
// @ts-ignore
const wx = typeof window !== 'undefined' ? window.wx : global.wx;
// 调试图标组件
console.log('Star组件:', Star)
console.log('Location组件:', Location)
console.log('Service组件:', Service)

export default function Index() {
    // 登录状态
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isModelLoading, setIsModelLoading] = useState(true)
    const modelUrl = `${RESOURCE_URL}/models/Tower.glb`
    const modelContainerRef = useRef<any>(null)
    const [isLight, setIsLight] = useState(false)

    // Ref for ThreeModel handles
    const threeModelRef = useRef<ThreeModelHandles>(null)

    // Refs for scene elements managed by Index page
    const hotspotsRef = useRef<THREE.Mesh[]>([])
    const transparentHotspotsRef = useRef<THREE.Mesh[]>([])
    const glowRingsRef = useRef<THREE.Mesh[][]>([])
    const uiElementRef = useRef<THREE.Mesh | null>(null)
    const uiTextRef = useRef<THREE.Sprite | null>(null)
    const raycasterRef = useRef<THREE.Raycaster | null>(null)

    // Vector refs for position updates (optimization)
    const topHotspotNDC = useRef(new THREE.Vector3())
    const middleHotspotNDC = useRef(new THREE.Vector3())
    const bottomHotspotNDC = useRef(new THREE.Vector3())
    const topTransparentNDC = useRef(new THREE.Vector3())
    const middleTransparentNDC = useRef(new THREE.Vector3())
    const bottomTransparentNDC = useRef(new THREE.Vector3())
    const topGlowNDC = useRef(new THREE.Vector3())
    const middleGlowNDC = useRef(new THREE.Vector3())
    const bottomGlowNDC = useRef(new THREE.Vector3())
    const uiTargetNDC = useRef(new THREE.Vector3())
    const textPositionVec = useRef(new THREE.Vector3())

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

    // 3D模型加载处理
    const handleModelLoad = () => {
        console.log('3D模型加载完成 (from Index)')
        setIsModelLoading(false)
        // Create scene elements after model is loaded and ref is available
        createSceneElements()
        // Register the update callback
        threeModelRef.current?.registerAnimationCallback(updateSceneElements)
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
        setIsLight(!isLight)
        // 暂时未创建点亮宝塔分包
        // Taro.showToast({
        //     title: '功能开发中',
        //     icon: 'none'
        // })
    }

    const handleCulture = () => {
        console.log('文化知识')
        Taro.navigateTo({ url: '/subPackages/culture/pages/culturalKnowledge/index' })
    }

    const handleViewModel = () => {
        console.log('查看3D模型')
        // 跳转到分包中的模型查看器页面
        Taro.navigateTo({
            url: `/subPackages/3d-model/pages/model-viewer/index?modelUrl=${encodeURIComponent(`${RESOURCE_URL}/models/Tower.glb`)}`
        })
    }

    // --- Moved Creation Logic from ThreeModel --- 
    const createSceneElements = () => {
        if (!threeModelRef.current) return
        const scene = threeModelRef.current.getScene()
        const camera = threeModelRef.current.getCamera()

        if (!scene || !camera) {
            console.error("Scene or Camera not available from ThreeModel ref")
            return
        }

        // Clear old elements first (important if re-creating)
        hotspotsRef.current.forEach(hp => scene.remove(hp))
        hotspotsRef.current = []
        transparentHotspotsRef.current.forEach(hp => scene.remove(hp))
        transparentHotspotsRef.current = []
        glowRingsRef.current.forEach(rings => rings.forEach(ring => scene.remove(ring)))
        glowRingsRef.current = []
        if (uiElementRef.current) scene.remove(uiElementRef.current)
        uiElementRef.current = null
        if (uiTextRef.current) scene.remove(uiTextRef.current)
        uiTextRef.current = null

        console.log("Creating scene elements in Index page...")

        // 1. Visible Hotspots
        const smallHotspotGeometry = new THREE.CircleGeometry(0.025, 32)
        const visibleHotspotMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthTest: false })
        const topVisible = new THREE.Mesh(smallHotspotGeometry, visibleHotspotMaterial.clone())
        const middleVisible = new THREE.Mesh(smallHotspotGeometry, visibleHotspotMaterial.clone())
        const bottomVisible = new THREE.Mesh(smallHotspotGeometry, visibleHotspotMaterial.clone())
        scene.add(topVisible, middleVisible, bottomVisible)
        hotspotsRef.current = [topVisible, middleVisible, bottomVisible]

        // 2. Glow Rings
        const glowLayers = [{ radius: 0.04, opacity: 0.45 }, { radius: 0.075, opacity: 0.2 }]
        const topGlowRings: THREE.Mesh[] = []
        const middleGlowRings: THREE.Mesh[] = []
        const bottomGlowRings: THREE.Mesh[] = []
        glowLayers.forEach(layer => {
            const glowGeo = new THREE.CircleGeometry(layer.radius, 32)
            const topMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: layer.opacity, depthTest: false })
            const midMat = topMat.clone()
            const botMat = topMat.clone()
            const topRing = new THREE.Mesh(glowGeo, topMat)
            const midRing = new THREE.Mesh(glowGeo, midMat)
            const botRing = new THREE.Mesh(glowGeo, botMat)
            topGlowRings.push(topRing)
            middleGlowRings.push(midRing)
            bottomGlowRings.push(botRing)
            scene.add(topRing, midRing, botRing) // Add glow rings first
        })
        glowRingsRef.current = [topGlowRings, middleGlowRings, bottomGlowRings]

        // Re-add visible hotspots on top of glow
        scene.add(topVisible, middleVisible, bottomVisible)

        // 3. Transparent Hotspots (Interaction)
        const largeHotspotGeometry = new THREE.CircleGeometry(0.1, 32)
        const transparentMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthTest: false })
        const topTransparent = new THREE.Mesh(largeHotspotGeometry, transparentMaterial.clone())
        const middleTransparent = new THREE.Mesh(largeHotspotGeometry, transparentMaterial.clone())
        const bottomTransparent = new THREE.Mesh(largeHotspotGeometry, transparentMaterial.clone())
        // @ts-ignore
        topTransparent.userData = { section: 'top' }
        // @ts-ignore
        middleTransparent.userData = { section: 'middle' }
        // @ts-ignore
        bottomTransparent.userData = { section: 'bottom' }
        scene.add(topTransparent, middleTransparent, bottomTransparent)
        transparentHotspotsRef.current = [topTransparent, middleTransparent, bottomTransparent]

        // 4. UI Hand Icon
        const textureLoader = new THREE.TextureLoader()
        const texture = textureLoader.load(handImage)
        const geometry = new THREE.PlaneGeometry(0.1, 0.1) // Size
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthTest: false })
        const uiElement = new THREE.Mesh(geometry, material)
        uiElementRef.current = uiElement
        scene.add(uiElement)

        // 5. UI Text Sprite ("点击互动")
        try {
            // Canvas creation might differ slightly outside WechatPlatform context if document isn't readily available
            // Let's assume a basic canvas approach works for now, may need adjustment
            const canvas = wx.createOffscreenCanvas({
                type: '2d',
                width: 300,
                height: 150
            });
            const context = canvas.getContext('2d')
            canvas.width = 128
            canvas.height = 32
            if (context) {
                context.fillStyle = 'rgba(0,0,0,0)'
                context.fillRect(0, 0, 128, 32)
                context.font = '14px Arial'
                context.fillStyle = 'white'
                context.textAlign = 'center'
                context.textBaseline = 'middle'
                context.fillText("点击互动", 64, 16)
                const textTexture = new THREE.CanvasTexture(canvas)
                const spriteMaterial = new THREE.SpriteMaterial({ map: textTexture, transparent: true, depthTest: false })
                const textSprite = new THREE.Sprite(spriteMaterial)
                textSprite.scale.set(0.3, 0.075, 1)
                uiTextRef.current = textSprite
                scene.add(textSprite)
            } else {
                console.warn("Could not get 2D context for text sprite")
            }
        } catch (error) {
            console.error("创建文本精灵失败:", error)
        }

        console.log("Scene elements created.")
    }

    // --- Moved Update Logic from ThreeModel's animate --- 
    const updateSceneElements = useCallback(() => {
        if (!threeModelRef.current) return
        const camera = threeModelRef.current.getCamera()
        const windowSize = threeModelRef.current.getWindowSize()

        if (!camera || hotspotsRef.current.length !== 3 || transparentHotspotsRef.current.length !== 3 || glowRingsRef.current.length !== 3 || !windowSize) {
            // Don't update if camera or elements aren't ready
            return
        }

        // Destructure refs for elements
        const [topVisible, middleVisible, bottomVisible] = hotspotsRef.current
        const [topTransparent, middleTransparent, bottomTransparent] = transparentHotspotsRef.current
        const [topGlowRings, middleGlowRings, bottomGlowRings] = glowRingsRef.current
        const currentUiElement = uiElementRef.current
        const textElement = uiTextRef.current

        // Define screen positions (NDC coordinates)
        const topPixelOffsetY = 150
        const topNdcOffsetY = (topPixelOffsetY * 2) / windowSize.height
        const topY = 0.6 - topNdcOffsetY

        const pixelOffsetY = 120
        const ndcOffsetY = (pixelOffsetY * 2) / windowSize.height
        const middleY = 0.0 - ndcOffsetY

        const bottomY = -0.6

        const middlePixelOffsetX = 30
        const middleNdcOffsetX = (middlePixelOffsetX * 2) / windowSize.width
        const middleX = 0.0 - middleNdcOffsetX
        const centerX = 0.0

        const depthZ = 0.9

        // Update elements
        camera.updateMatrixWorld() // Ensure camera matrix is up-to-date

        // Top Group
        topHotspotNDC.current.set(centerX, topY, depthZ).unproject(camera)
        topVisible.position.copy(topHotspotNDC.current)
        topVisible.quaternion.copy(camera.quaternion)
        topTransparentNDC.current.set(centerX, topY, depthZ).unproject(camera)
        topTransparent.position.copy(topTransparentNDC.current)
        topTransparent.quaternion.copy(camera.quaternion)
        topGlowNDC.current.copy(topHotspotNDC.current) // Use calculated position
        topGlowRings.forEach(ring => {
            ring.position.copy(topGlowNDC.current)
            ring.quaternion.copy(camera.quaternion)
        })

        // Middle Group
        middleHotspotNDC.current.set(middleX, middleY, depthZ).unproject(camera)
        middleVisible.position.copy(middleHotspotNDC.current)
        middleVisible.quaternion.copy(camera.quaternion)
        middleTransparentNDC.current.set(middleX, middleY, depthZ).unproject(camera)
        middleTransparent.position.copy(middleTransparentNDC.current)
        middleTransparent.quaternion.copy(camera.quaternion)
        middleGlowNDC.current.copy(middleHotspotNDC.current)
        middleGlowRings.forEach(ring => {
            ring.position.copy(middleGlowNDC.current)
            ring.quaternion.copy(camera.quaternion)
        })

        // Bottom Group
        bottomHotspotNDC.current.set(centerX, bottomY, depthZ).unproject(camera)
        bottomVisible.position.copy(bottomHotspotNDC.current)
        bottomVisible.quaternion.copy(camera.quaternion)
        bottomTransparentNDC.current.set(centerX, bottomY, depthZ).unproject(camera)
        bottomTransparent.position.copy(bottomTransparentNDC.current)
        bottomTransparent.quaternion.copy(camera.quaternion)
        bottomGlowNDC.current.copy(bottomHotspotNDC.current)
        bottomGlowRings.forEach(ring => {
            ring.position.copy(bottomGlowNDC.current)
            ring.quaternion.copy(camera.quaternion)
        })

        // UI Element (Hand)
        if (currentUiElement) {
            const uiExtraOffsetY = 0.03
            uiTargetNDC.current.set(centerX, topY - uiExtraOffsetY, depthZ).unproject(camera)
            currentUiElement.position.copy(uiTargetNDC.current)
            currentUiElement.quaternion.copy(camera.quaternion)

            // UI Text (Below Hand)
            if (textElement) {
                const textOffsetY = 0.05
                textPositionVec.current.set(centerX, topY - uiExtraOffsetY - textOffsetY, depthZ).unproject(camera)
                textElement.position.copy(textPositionVec.current)
                // Text sprite rotation is usually handled automatically to face camera
            }
        }
    }, [])

    // --- Moved Tap Handling from ThreeModel ---
    const handleCanvasTap = (e: any) => {
        if (!threeModelRef.current) return
        const camera = threeModelRef.current.getCamera()
        const windowSize = threeModelRef.current.getWindowSize()

        if (!camera || transparentHotspotsRef.current.length === 0 || !windowSize) return

        try {
            const touch = e.touches[0]
            const { clientX, clientY } = touch
            const { width: canvasWidth, height: canvasHeight } = windowSize

            const mouse = new THREE.Vector2()
            mouse.x = (clientX / canvasWidth) * 2 - 1
            mouse.y = -(clientY / canvasHeight) * 2 + 1

            if (!raycasterRef.current) {
                raycasterRef.current = new THREE.Raycaster()
            }
            raycasterRef.current.setFromCamera(mouse, camera)

            const intersects = raycasterRef.current.intersectObjects(transparentHotspotsRef.current)

            if (intersects.length > 0) {
                const clickedHotspot = intersects[0].object
                // @ts-ignore
                const section = clickedHotspot.userData.section
                let targetPage = ''
                if (section === 'top') {
                    console.log('Clicked Top Hotspot (from Index)')
                    targetPage = '/subPackages/towerDetail/top/index'
                } else if (section === 'middle') {
                    console.log('Clicked Middle Hotspot (from Index)')
                    targetPage = '/subPackages/towerDetail/middle/index'
                } else if (section === 'bottom') {
                    console.log('Clicked Bottom Hotspot (from Index)')
                    targetPage = '/subPackages/towerDetail/bottom/index'
                }
                if (targetPage) {
                    Taro.navigateTo({ url: targetPage })
                }
            }
        } catch (error) {
            console.error('处理点击事件失败 (from Index):', error)
        }
    }

    // --- Add useEffect for Cleanup ---
    useEffect(() => {
        // Return cleanup function
        return () => {
            console.log("Index page cleanup: Unregistering animation callback.")
            // Unregister the animation callback when Index unmounts
            if (threeModelRef.current) { // Check if ref exists
                threeModelRef.current.unregisterAnimationCallback(updateSceneElements)
            }
            // Note: Three.js objects added to the scene are usually disposed 
            // when the renderer/scene itself is disposed by ThreeModel's cleanup.
            // Explicit removal here might be needed if ThreeModel's cleanup changes.
        }
    }, [updateSceneElements]) // Depend on the callback function instance

    return (
        <View className={`index ${isLight ? 'light' : ''}`}>
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
                    {isModelLoading && (
                        <View className="model-loading">
                            <View className="model-loading-spinner"></View>
                            <View className="model-loading-text">3D模型加载中...</View>
                        </View>
                    )}
                    <ThreeModel
                        ref={threeModelRef}
                        modelUrl={modelUrl}
                        fullscreen={true}
                        backgroundColor="transparent"
                        autoRotate={false}
                        onLoad={handleModelLoad}
                        lockVerticalRotation={true}
                        onCanvasTap={handleCanvasTap}
                    />
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
                        src={`${RESOURCE_URL}${isLight ? '/images/wish-light-icon.webp' : '/images/wish-icon.png'}`}
                        mode='aspectFit'
                    />
                    <Text className='tower-menu-text'>向塔许愿</Text>
                </View>
                <View className='tower-menu-item' onClick={handleDecorate}>
                    <Image
                        className='tower-menu-image'
                        src={`${RESOURCE_URL}${isLight ? '/images/decorate-light-icon.webp' : '/images/decorate-icon.webp'}`}
                        mode='aspectFit'
                    />
                    <Text className='tower-menu-text'>装饰宝塔</Text>
                </View>
                <View className='tower-menu-item' onClick={handleLight}>
                    <Image
                        className='tower-menu-image'
                        src={`${RESOURCE_URL}${isLight ? '/images/light-light-icon.webp' : '/images/light-icon.webp'}`}
                        mode='aspectFit'
                    />
                    <Text className='tower-menu-text'>点亮宝塔</Text>
                </View>
                <View className='tower-menu-item' onClick={handleCulture}>
                    <Image
                        className='tower-menu-image'
                        src={`${RESOURCE_URL}${isLight ? '/images/culture-light-icon.webp' : '/images/culture-icon.webp'}`}
                        mode='aspectFit'
                    />
                    <Text className='tower-menu-text'>文化知识</Text>
                </View>
            </View>

            {/* 登录按钮 - 未登录时显示 */}
            {/* 已移除登录按钮，直接在页面加载时提示登录 */}

            {/* 底部导航 */}
            {/* <NavBtns showBack={false} showHome={false} /> */}
        </View>
    )
}
