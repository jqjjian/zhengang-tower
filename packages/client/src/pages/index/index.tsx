import { useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { useDidShow, useDidHide } from '@tarojs/taro'
import { Cell, Button } from '@nutui/nutui-react-taro'
// 直接从根模块导入而不是按需加载
import { Star, Plus } from '@nutui/icons-react-taro'
// import { harmony } from '@/utils/platform-taro'
// 按需导入duxui组件

// 导入样式
import './index.scss'

// 调试图标组件
console.log('Star组件:', Star)
console.log('Plus组件:', Plus)

export default function Index() {
    // 组件挂载时执行
    useEffect(() => {
        console.log('页面加载')

        return () => {
            console.log('页面卸载')
        }
    }, [])

    // Taro 特有的生命周期 Hooks
    useDidShow(() => {
        console.log('页面显示')
    })

    useDidHide(() => {
        console.log('页面隐藏')
    })

    // 获取手机号回调
    // const handleGetPhoneNumber = (e) => {
    //     console.log('获取手机号', e)
    // }
    const marginStyle = {
        width: 'auto',
        margin: 8,
        height: 40,
    }
    return (
        <View className='index'>
            <Text>Hello world!</Text>
            <Text>镇岗塔小程序</Text>
            <Button type='primary' icon={<Star size={20} />}>带图标的按钮</Button>
            <Cell title='标题' description='内容' />
            <View style={{ margin: '20px 0' }}>
                <Text style={{ marginRight: '10px' }}>独立图标:</Text>
                <Star size={20} className="demo-icon" />
                <Plus size={20} color="#f00" className="demo-icon" style={{ marginLeft: '10px' }} />
            </View>
        </View>
    )
}
