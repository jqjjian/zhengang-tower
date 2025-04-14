import Taro from '@tarojs/taro'
import { API_BASE_URL } from '@/config'

interface RequestOptions {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: any
    header?: Record<string, string>
    noToken?: boolean // 是否不需要token
    loading?: boolean // 是否显示加载提示
}

/**
 * 封装的HTTP请求方法
 */
export const request = async (options: RequestOptions) => {
    const { url, method = 'GET', data, noToken = false, loading = false } = options

    // 构建完整URL
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`

    // 合并默认header
    const header: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.header
    }

    // 自动添加token - 仅在需要token的请求中添加
    if (!noToken) {
        const token = Taro.getStorageSync('token')
        if (token) {
            header['Authorization'] = `Bearer ${token}`
        }
    }

    // 打印请求信息，便于调试
    console.log('发送请求:', {
        url: fullUrl,
        method,
        header,
        data,
        noToken
    })

    // 显示加载提示
    if (loading) {
        Taro.showLoading({ title: '加载中...' })
    }

    try {
        const response = await Taro.request({
            url: fullUrl,
            method,
            data,
            header
        })

        // 打印响应信息
        console.log('请求响应:', {
            statusCode: response.statusCode,
            data: response.data
        })

        // 请求成功
        if (response.statusCode >= 200 && response.statusCode < 300) {
            return response.data
        }

        // 未授权（token无效或过期）
        if (response.statusCode === 401) {
            // 如果是登录请求返回401，不处理token清除和登录提示
            if (url.includes('/api/auth/login')) {
                console.error('登录接口返回未授权状态', response.data)
                return Promise.reject(response.data || '登录失败')
            }

            // 其他接口返回401，清除token并提示重新登录
            console.log('接口返回未授权状态，清除token')
            Taro.removeStorageSync('token')

            // 显示登录确认对话框
            Taro.showModal({
                title: '登录已过期',
                content: '您的登录已过期，是否重新登录？',
                confirmText: '确认登录',
                cancelText: '取消',
                success: (res) => {
                    if (res.confirm) {
                        // 导入登录方法
                        const { wxLogin } = require('@/services/auth')
                        wxLogin()
                    }
                }
            })

            return Promise.reject(new Error('未授权，请重新登录'))
        }

        // 其他错误
        Taro.showToast({
            title: response.data?.error || '请求失败',
            icon: 'none',
            duration: 2000
        })

        return Promise.reject(response.data)
    } catch (error) {
        console.error('请求异常:', error)
        Taro.showToast({
            title: '网络请求异常',
            icon: 'none',
            duration: 2000
        })
        return Promise.reject(error)
    } finally {
        if (loading) {
            Taro.hideLoading()
        }
    }
}

// 导出便捷的请求方法
export const get = (url: string, data?: any, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>) => {
    return request({ url, method: 'GET', data, ...options })
}

export const post = (url: string, data?: any, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>) => {
    return request({ url, method: 'POST', data, ...options })
}

export default {
    request,
    get,
    post
} 