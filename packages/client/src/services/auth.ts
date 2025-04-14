import Taro from '@tarojs/taro'
import { post } from '@/utils/request'

/**
 * 微信登录
 * 获取微信code并请求服务端换取token
 */
export const wxLogin = (): Promise<{ token: string, userId: string }> => {
    return new Promise((resolve, reject) => {
        // 显示加载提示
        Taro.showLoading({ title: '登录中...' })

        // 调用微信登录获取code
        Taro.login({
            success: async (res) => {
                if (res.code) {
                    try {
                        console.log('获取到微信code:', res.code)

                        // 发送code到后端换取token
                        const loginRes = await post('/api/auth/login', { code: res.code }, {
                            noToken: true,  // 确保设置noToken为true
                            header: {       // 明确设置Content-Type
                                'Content-Type': 'application/json'
                            }
                        })

                        console.log('登录响应:', loginRes)

                        // 存储token到本地
                        Taro.setStorageSync('token', loginRes.token)
                        Taro.setStorageSync('userId', loginRes.userId)

                        Taro.hideLoading()
                        resolve(loginRes)
                    } catch (error) {
                        console.error('登录请求失败:', error)
                        Taro.hideLoading()
                        Taro.showToast({
                            title: '登录失败',
                            icon: 'none',
                            duration: 2000
                        })
                        reject(error)
                    }
                } else {
                    console.error('获取微信code失败')
                    Taro.hideLoading()
                    Taro.showToast({
                        title: '获取微信授权失败',
                        icon: 'none',
                        duration: 2000
                    })
                    reject(new Error('获取微信授权失败'))
                }
            },
            fail: (err) => {
                console.error('微信登录API调用失败:', err)
                Taro.hideLoading()
                Taro.showToast({
                    title: '微信登录失败',
                    icon: 'none',
                    duration: 2000
                })
                reject(err)
            }
        })
    })
}

/**
 * 检查登录状态
 * 检查本地是否有token
 */
export const checkLogin = (): boolean => {
    return !!Taro.getStorageSync('token')
}

/**
 * 退出登录
 */
export const logout = (): void => {
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('userId')
    Taro.showToast({
        title: '已退出登录',
        icon: 'success',
        duration: 2000
    })
}

export default {
    wxLogin,
    checkLogin,
    logout
} 