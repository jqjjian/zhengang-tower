import '@tarojs/taro'

declare module '@tarojs/taro' {
    export = Taro
    export as namespace Taro

    namespace Taro {
        // 网络请求
        function request(options: any): Promise<any>

        // 本地存储
        function setStorage(options: any): Promise<any>
        function setStorageSync(key: string, data: any): void
        function getStorage(options: any): Promise<any>
        function getStorageSync(key: string): any
        function removeStorage(options: any): Promise<any>
        function removeStorageSync(key: string): void

        // 路由导航
        function navigateTo(options: any): Promise<any>
        function navigateBack(options?: any): void
        function redirectTo(options: any): Promise<any>
        function switchTab(options: any): Promise<any>

        // 界面交互
        function showToast(options: any): Promise<any>
        function hideToast(): void
        function showLoading(options: any): Promise<any>
        function hideLoading(): void
        function showModal(options: any): Promise<any>

        // 登录授权
        function login(options: any): void
        function checkSession(options: any): void
        function getUserInfo(options: any): void
        function getUserProfile(options: any): void

        // 系统信息
        function getSystemInfo(options: any): Promise<any>
        function getSystemInfoSync(): any
    }
} 