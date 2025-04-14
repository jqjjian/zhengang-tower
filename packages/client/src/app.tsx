// import { PropsWithChildren } from 'react'
import { useEffect } from 'react'

// @ts-ignore - 忽略类型错误
import * as threePlatformize from 'three-platformize'
// import '@tarojs/components/dist/taro-components/taro-components.css'
import './app.scss'

export default function App(props) {
  // 这些生命周期方法在函数组件中需要使用useEffect替代
  // componentDidMount()
  // componentDidShow()
  // componentDidHide()

  // 初始化three-platformize
  useEffect(() => {
    console.log('初始化three-platformize全局配置')

    try {
      // @ts-ignore - 忽略类型错误
      if (threePlatformize.injectTaroApi) {
        // @ts-ignore - 忽略类型错误
        threePlatformize.injectTaroApi()
        console.log('three-platformize Taro API注入成功')
      }
    } catch (error) {
      console.error('初始化three-platformize失败:', error)
    }
  }, [])

  return props.children
}

