import './runtime-init'

export default {
    pages: [
        'pages/index/index' // 只保留主页面
    ],
    window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: '镇岗塔',
        navigationBarTextStyle: 'black'
    },
    subPackages: [
        {
            root: 'subPackages/3d-model',
            name: '3d-model',
            pages: [
                'pages/model-viewer/index' // 3D模型查看器
            ],
            independent: true // 独立分包，可单独下载
        },
        {
            root: 'subPackages/wish',
            name: 'wish-package',
            pages: [
                'pages/wishTower/index' // 许愿功能
            ],
            independent: false // 非独立分包
        },
        {
            root: 'subPackages/culture',
            name: 'culture-package',
            pages: [
                'pages/culturalKnowledge/index' // 文化知识
            ],
            independent: false // 非独立分包
        },
        {
            root: 'subPackages/decoration',
            name: 'decoration-package',
            pages: [
                'pages/decorateTower/index' // 装饰宝塔
            ],
            independent: false // 非独立分包
        },
        {
            root: 'subPackages/towerDetail',
            name: 'tower-detail-package',
            pages: [
                'top/index',
                'middle/index',
                'bottom/index',
                'componentDetail/index'
            ],
            independent: false // 非独立分包
        }
    ],
    // 预加载所有分包
    preloadRule: {
        'pages/index/index': {
            network: 'all',
            packages: ['subPackages/3d-model', 'subPackages/wish', 'subPackages/culture', 'subPackages/decoration', 'subPackages/towerDetail']
        }
    },
    // 添加WebGL支持
    requiredBackgroundModes: ['webgl'],
    enableCSS3D: true,
    // 开启相机权限（如果需要AR功能）
    permission: {
        'scope.camera': {
            desc: '用于展示3D模型增强现实效果'
        }
    },
    // 添加WebView权限（如果需要在WebView中使用WebGL）
    webViewStyles: {
        webgl: true
    }
}
