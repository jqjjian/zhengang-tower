import { View, Text, Textarea, Button, Input, Image } from '@tarojs/components'
import { useEffect, useState, useRef } from 'react'
import { useDidShow, useDidHide, showToast } from '@tarojs/taro'
// import { Service } from '@nutui/icons-react-taro'
import { RESOURCE_URL } from '@/config'
import NavBtns from '@/components/NavBtns'
import { get } from '@/utils/request'
import './index.scss'

// 愿望类型映射表
const WISH_TYPE_MAPPING = {
    0: 'health',   // 健康
    1: 'career',   // 事业
    2: 'love',     // 良缘
    3: 'wealth',   // 财富
    4: 'family',   // 学业
}

export default function WishTower() {
    // 状态管理
    const [wishText, setWishText] = useState('')
    const [userName, setUserName] = useState('')
    const [wishBtnText, setWishBtnText] = useState([
        '求健康',
        '求事业',
        '求良缘',
        '求财富',
        '求学业'
    ])

    // 添加本地备用的祝福语数据
    const defaultWishTitles = [
        '身体健康',
        '事业有成',
        '良缘天成',
        '财源广进',
        '学业有成'
    ]

    const defaultWishContents = [
        ['百病不扰', '身强体健'],
        ['步步高升', '前程似锦'],
        ['情深缘定', '佳偶天成'],
        ['聚财聚福', '富贵吉祥'],
        ['金榜题名', '学识渊博']
    ]

    // 使用状态存储从后端获取的祝福语
    const [currentWishTitle, setCurrentWishTitle] = useState<string>('')
    const [currentWishContents, setCurrentWishContents] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // 结果牌显示状态
    const [isWishRes, setIsWishRes] = useState<boolean>(false)

    // 抖动状态
    const [isShaking, setIsShaking] = useState<boolean>(false)
    const resultCardRef = useRef<any>(null)
    const shakeTimerRef = useRef<any>(null)

    const [wishList, setWishList] = useState([
        { id: 1, content: '希望家人健康平安', author: '张三' },
        { id: 2, content: '祈祷考试顺利通过', author: '李四' },
        { id: 3, content: '愿世界和平', author: '王五' }
    ])
    const [isSelectWish, setIsSelectWish] = useState<boolean>(false)
    const [selectIndex, setSelectIndex] = useState<number | null>(null)

    // 组件挂载时执行
    useEffect(() => {
        console.log('许愿页面加载')

        return () => {
            console.log('许愿页面卸载')
            // 清除所有定时器
            if (shakeTimerRef.current) {
                clearInterval(shakeTimerRef.current)
            }
        }
    }, [])

    // 抖动效果处理函数
    const handleShake = () => {
        if (isShaking) return;

        console.log('开始抖动');
        // 设置抖动状态
        setIsShaking(true);

        // 短暂应用抖动类，之后恢复原有动画
        setTimeout(() => {
            console.log('抖动结束');
            setIsShaking(false);
        }, 600);
    };

    // 定时抖动效果
    useEffect(() => {
        // 只有结果牌显示后才设置定时抖动
        if (isWishRes) {
            console.log('设置定时抖动');

            // 等待入场动画完成后开始定时抖动
            const initialDelay = setTimeout(() => {
                // 设置周期性抖动
                shakeTimerRef.current = setInterval(() => {
                    handleShake();
                }, 8000); // 每8秒抖动一次，给动画留足空间
            }, 2000);

            return () => {
                clearTimeout(initialDelay);
                if (shakeTimerRef.current) {
                    clearInterval(shakeTimerRef.current);
                }
            };
        }
    }, [isWishRes]);

    // Taro 特有的生命周期 Hooks
    useDidShow(() => {
        console.log('许愿页面显示')
    })

    useDidHide(() => {
        console.log('许愿页面隐藏')
        // 页面隐藏时清除定时器
        if (shakeTimerRef.current) {
            clearInterval(shakeTimerRef.current)
        }
    })

    // 处理输入变化
    const handleWishTextChange = (e) => {
        setWishText(e.detail.value)
    }

    const handleUserNameChange = (e) => {
        setUserName(e.detail.value)
    }

    // 提交许愿
    const handleSubmitWish = () => {
        if (!wishText.trim()) {
            // 可以添加提示逻辑
            console.log('请输入愿望内容')
            return
        }

        console.log('提交许愿', { wishText, userName })

        // 模拟添加新愿望
        const newWish = {
            id: Date.now(),
            content: wishText,
            author: userName.trim() || '匿名'
        }

        setWishList([newWish, ...wishList])
        setWishText('')
        setUserName('')

        // 这里可以添加提交许愿到服务器的逻辑
    }

    // 移除字符串中的逗号
    const removeCommas = (str: string) => {
        return str.replace(/，/g, '');
    }

    // 从后端获取祝福语
    const fetchWishFromServer = async (wishType: number) => {
        try {
            setIsLoading(true)

            // 获取对应的类型名称
            const typeKey = WISH_TYPE_MAPPING[wishType] || 'health'

            // 使用封装的请求工具调用后端API获取祝福语
            const response = await get('/api/wishes', { type: typeKey }, { loading: true })

            // 检查响应数据
            if (response && response.blessing && response.parts) {
                // 去除祝福语中的逗号
                // const cleanBlessing = removeCommas(response.blessing);
                const cleanParts = response.parts.map(removeCommas);

                // 使用第一部分作为标题
                setCurrentWishTitle(cleanParts[Math.floor(cleanParts.length / 2)]);
                // 使用完整祝福语和第二部分作为内容
                setCurrentWishContents(cleanParts);
                return true
            } else {
                throw new Error('祝福语数据格式不正确')
            }
        } catch (error) {
            console.error('获取祝福语出错:', error)

            // 使用本地备用数据
            if (selectIndex !== null) {
                setCurrentWishTitle(defaultWishTitles[selectIndex])
                setCurrentWishContents(defaultWishContents[selectIndex])
            }

            showToast({
                title: '获取祝福语失败，使用默认祝福',
                icon: 'none'
            })

            return false
        } finally {
            setIsLoading(false)
        }
    }

    // 处理抽取许愿签事件
    const handleDrawWish = async () => {
        // 检查是否已选择愿望类型
        if (selectIndex === null) {
            showToast({
                title: '请选择一个愿望类型',
                icon: 'none'
            })
            return
        }

        // 调用后端API获取祝福语
        await fetchWishFromServer(selectIndex)

        // 显示结果
        setIsWishRes(true)
    }

    // 重新许愿
    const handleResetWish = () => {
        // 清除定时器
        if (shakeTimerRef.current) {
            clearInterval(shakeTimerRef.current)
            shakeTimerRef.current = null
        }

        // 重置状态
        setIsShaking(false)
        setIsSelectWish(false)
        setIsWishRes(false)
        setSelectIndex(null)
        setCurrentWishTitle('')
        setCurrentWishContents([])
    }

    return (
        <View className='wish-tower-bg'>
            {/* 页面内容 */}
            {/* <View className='header'> */}
            {/* <Text className='title'>向塔许愿</Text> */}
            {/* <Image
                    className='page-banner'
                    src={require('../../static/images/wish-icon.webp')}
                    mode='aspectFit'
                /> */}
            {/* </View> */}
            {isSelectWish && <View className='header'></View>}
            <View className={`wish-tower ${isSelectWish ? 'active' : ''}`}>
                <View className='img-wrapper'>
                    <Image src={`${RESOURCE_URL}/images/wish-tower.webp`} mode='widthFix' />
                </View>
            </View>
            {isSelectWish && <View className='select-wish'>
                {wishBtnText.map((item, index) => (
                    <View className={`select-wish-item ${selectIndex === index ? 'active' : ''}`} key={item} onClick={() => setSelectIndex(index)}>{item}</View>
                ))}
            </View>}
            {!isSelectWish && !isWishRes && <View className='wish-tower-btn' onClick={() => setIsSelectWish(true)}>
                许愿
            </View>}
            {isSelectWish && !isWishRes && (
                <View className={`wish-tower-btn ${isLoading ? 'disabled' : ''}`} onClick={!isLoading ? handleDrawWish : undefined}>
                    {isLoading ? '获取中...' : '抽取许愿签'}
                </View>
            )}

            {/* 使用ref获取DOM引用，使用样式确保始终可见 */}
            {isWishRes && (
                <View
                    ref={resultCardRef}
                    className={`wish-res-wrapper ${isShaking ? 'shake' : ''}`}
                    onClick={handleShake}
                    style={{ display: 'block', visibility: 'visible' }}
                >
                    <View className='wish-res-title'>
                        {currentWishTitle && currentWishTitle.split('').map((char, index) => (
                            <Text key={index}>{char}</Text>
                        ))}
                    </View>
                    <View className='wish-res-content'>
                        {currentWishContents.map((item, index) => (
                            <View key={index} className='wish-res-content-item'>{item}</View>
                        ))}
                    </View>
                </View>
            )}

            {isWishRes && <View className='wish-tower-btn' onClick={handleResetWish}>
                重新许愿
            </View>}
            {/* 许愿表单 */}
            {/* <View className='wish-form'>
                <View className='form-item'>
                    <Text className='label'>许愿人:</Text>
                    <Input
                        className='input name-input'
                        value={userName}
                        onInput={handleUserNameChange}
                        placeholder='输入您的名字（选填）'
                        maxlength={20}
                    />
                </View>

                <View className='form-item'>
                    <Text className='label'>愿望内容:</Text>
                    <Textarea
                        className='input'
                        value={wishText}
                        onInput={handleWishTextChange}
                        placeholder='在此写下您的愿望...'
                        maxlength={100}
                        autoHeight
                    />
                </View>

                <Button className='submit-button' onClick={handleSubmitWish}>
                    <Service size='16' />
                    <Text>提交愿望</Text>
                </Button>
            </View> */}

            {/* 历史愿望列表 */}
            {/* <View className='wish-list'>
                <Text className='list-title'>历史愿望</Text>

                {wishList.map((wish) => (
                    <View key={wish.id} className='wish-item'>
                        <Text className='wish-content'>{wish.content}</Text>
                        <Text className='wish-author'>—— {wish.author}</Text>
                    </View>
                ))}
            </View> */}

            {/* 导航按钮 - 放在页面底部，已在CSS中使用fixed定位 */}
            <NavBtns
                // title="向塔许愿"
                showBack={true}
                showHome={true}
            />
        </View>
    )
} 