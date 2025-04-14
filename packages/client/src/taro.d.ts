import '@tarojs/taro'

declare module '@tarojs/taro' {
    export interface TaroStatic {
        navigateTo(options: { url: string }): Promise<any>
        // 添加其他缺失的方法...
    }
}
