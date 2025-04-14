import Taro from '@tarojs/taro'

// 页面路径映射，便于维护
const PAGE_PATHS = {
    wishTower: '/pages/wishTower/index',
    decorateTower: '/packageA/pages/decorateTower/index',
    lightTower: '/packageA/pages/lightTower/index',
    culturalKnowledge: '/pages/culturalKnowledge/index'
}

// 封装导航函数，限制类型断言在一个地方
export function navigate(pageName: string): void {
    const url = PAGE_PATHS[pageName] || pageName
    // 类型断言仅在此处使用
    ;(Taro as any).navigateTo({ url })
}
