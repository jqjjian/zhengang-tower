// import { PropsWithChildren } from 'react'


// import '@tarojs/components/dist/taro-components/taro-components.css'
import './app.scss'

export default function App(props) {
  // 这些生命周期方法在函数组件中需要使用useEffect替代
  // componentDidMount()
  // componentDidShow()
  // componentDidHide()

  return props.children
}

