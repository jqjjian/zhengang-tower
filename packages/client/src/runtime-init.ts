import * as React from 'react'

// 确保React在小程序环境中正确注册
if (typeof React !== 'undefined') {
    // @ts-ignore
    global.React = React
}

// 添加兼容性检查和错误处理
try {
    // 检查全局React是否可用
    if (typeof global.React === 'undefined') {
        console.error('全局React未定义，手动设置...')
        // @ts-ignore
        global.React = React
    }

    // 确保JSX转换可以使用React
    if (process.env.TARO_ENV === 'weapp' || process.env.TARO_ENV === 'alipay') {
        // @ts-ignore
        if (!global.__React) global.__React = React
    }
} catch (error) {
    console.error('初始化React时出错:', error)
}

export default {
    React
}
