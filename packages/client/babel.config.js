// babel-preset-taro 更多选项和默认值：
// https://github.com/NervJS/taro/blob/next/packages/babel-preset-taro/README.md
module.exports = {
  presets: [
    ['taro', {
      framework: 'react',
      ts: true,
      compiler: 'webpack5',
      hot: false,
      inlineLogical: false,
      injectToDefineConfig: false
    }],
    ['@babel/preset-env', { targets: { node: 'current' } }],
    [
      "@babel/preset-react",
      {
        "runtime": "automatic"  // 关键配置，自动注入 React 无需手动导入
      }
    ]
  ],
  plugins: [
    ["@babel/plugin-transform-runtime", {
      "regenerator": true
    }],
    [
      'import',
      {
        libraryName: '@nutui/nutui-react-taro',
        style: 'css',
        camel2DashComponentName: false,
        customName: (name, file) => {
          return `@nutui/nutui-react-taro/dist/es/packages/${name.toLowerCase()}`
        },
      },
      '@nutui/nutui-react-taro',
    ],
    [
      'import',
      {
        libraryName: '@nutui/icons-react-taro',
        libraryDirectory: 'dist/es/icons',
        camel2DashComponentName: false,
      },
      '@nutui/icons-react-taro',
    ],
  ]
}
