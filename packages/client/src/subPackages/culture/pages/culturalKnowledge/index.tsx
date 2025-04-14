import { View, Text, Image } from '@tarojs/components'
import { useEffect } from 'react'
import { useDidShow, useDidHide } from '@tarojs/taro'
import './index.scss'

export default function CulturalKnowledge() {
    // 组件挂载时执行
    useEffect(() => {
        console.log('文化知识页面加载')

        return () => {
            console.log('文化知识页面卸载')
        }
    }, [])

    // Taro 特有的生命周期 Hooks
    useDidShow(() => {
        console.log('文化知识页面显示')
    })

    useDidHide(() => {
        console.log('文化知识页面隐藏')
    })

    // 文化知识列表
    const knowledgeList = [
        {
            id: 1,
            title: '镇岗塔的历史',
            image: '/static/images/history.png',
            intro: '镇岗塔始建于北魏时期，是云冈石窟的重要标志之一。塔高约十余米，砖木结构，具有典型的北方塔式风格...'
        },
        {
            id: 2,
            title: '建筑特色',
            image: '/static/images/architecture.png',
            intro: '镇岗塔采用了传统的密檐式结构，塔身呈八角形，每层收分明显，形成稳定而优美的轮廓线...'
        },
        {
            id: 3,
            title: '佛教文化',
            image: '/static/images/buddhism.png',
            intro: '镇岗塔承载着丰富的佛教文化，塔内供奉有释迦牟尼佛像，是佛教七宝之一的象征...'
        },
        {
            id: 4,
            title: '保护与修复',
            image: '/static/images/protection.png',
            intro: '经过千百年风雨，镇岗塔曾多次修缮。近年来，专家学者对其进行了全面的保护和修复工作...'
        }
    ]

    return (
        <View className='cultural-knowledge'>
            <View className='header'>
                <Text className='title'>文化知识</Text>
            </View>

            <View className='knowledge-intro'>
                <Text className='intro-title'>镇岗塔简介</Text>
                <Text className='intro-content'>
                    镇岗塔，又称云冈舍利塔，是云冈石窟的重要建筑之一，具有重要的历史、艺术和科学价值。
                    塔内供奉着佛陀舍利，是佛教信徒朝拜的圣地，也是研究古代建筑和佛教文化的珍贵实物资料。
                </Text>
            </View>

            <View className='knowledge-list'>
                {knowledgeList.map(item => (
                    <View key={item.id} className='knowledge-item'>
                        <Image
                            className='item-image'
                            src={item.image}
                            mode='aspectFill'
                        />
                        <View className='item-content'>
                            <Text className='item-title'>{item.title}</Text>
                            <Text className='item-intro'>{item.intro}</Text>
                            <View className='read-more'>
                                <Text className='read-more-text'>了解更多</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            <View className='footnote'>
                <Text className='footnote-text'>更多文化内容持续更新中...</Text>
            </View>
        </View>
    )
} 