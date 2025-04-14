import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useEffect } from 'react'
import { useDidShow, useDidHide } from '@tarojs/taro'
import { Star } from '@nutui/icons-react-taro'
import './index.scss'

export default function DecorateTower() {
    // 组件挂载时执行
    useEffect(() => {
        console.log('装饰宝塔页面加载')

        return () => {
            console.log('装饰宝塔页面卸载')
        }
    }, [])

    // Taro 特有的生命周期 Hooks
    useDidShow(() => {
        console.log('装饰宝塔页面显示')
    })

    useDidHide(() => {
        console.log('装饰宝塔页面隐藏')
    })

    // 装饰项列表
    const decorations = [
        { id: 1, name: '金色宝顶', image: '/static/images/decor1.png', unlocked: true },
        { id: 2, name: '彩灯', image: '/static/images/decor2.png', unlocked: true },
        { id: 3, name: '龙纹饰', image: '/static/images/decor3.png', unlocked: false },
        { id: 4, name: '经幡', image: '/static/images/decor4.png', unlocked: false },
        { id: 5, name: '香炉', image: '/static/images/decor5.png', unlocked: false },
    ]

    // 选择装饰物
    const handleSelectDecoration = (id) => {
        console.log('选择装饰', id)
        // 这里可以添加选择装饰的逻辑
    }

    return (
        <View className='decorate-tower'>
            <View className='header'>
                <Text className='title'>装饰宝塔</Text>
            </View>

            <View className='tower-preview'>
                <Image
                    className='tower-image'
                    src='/static/images/tower-placeholder.png'
                    mode='aspectFit'
                />
                <Text className='preview-text'>宝塔预览</Text>
            </View>

            <View className='decoration-list-container'>
                <Text className='list-title'>选择装饰</Text>
                <ScrollView
                    className='decoration-list'
                    scrollX
                >
                    {decorations.map(item => (
                        <View
                            key={item.id}
                            className={`decoration-item ${item.unlocked ? '' : 'locked'}`}
                            onClick={() => item.unlocked && handleSelectDecoration(item.id)}
                        >
                            <Image
                                className='decoration-image'
                                src={item.image}
                                mode='aspectFit'
                            />
                            <View className='decoration-info'>
                                <Text className='decoration-name'>{item.name}</Text>
                                {!item.unlocked && (
                                    <View className='lock-info'>
                                        <Text className='lock-text'>未解锁</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <View className='current-decoration'>
                <Text className='current-title'>当前装饰</Text>
                <View className='current-items'>
                    <View className='current-item'>
                        <Star size={16} className='item-icon' />
                        <Text className='item-name'>金色宝顶</Text>
                    </View>
                </View>
            </View>
        </View>
    )
} 