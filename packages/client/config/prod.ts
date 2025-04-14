import { defineConfig, type UserConfigExport } from '@tarojs/cli'

export default defineConfig<'vite'>(async () => {
    const config: UserConfigExport<'vite'> = {
        env: {
            NODE_ENV: '"production"'
        },
        defineConstants: {
        },
        mini: {
            optimizeMainPackage: {
                enable: true
            }
        },
        h5: {
            /**
             * 如果需要分析打包体积，请安装 webpack-bundle-analyzer
             * npm install -D webpack-bundle-analyzer
             * 然后取消下面注释
             */
            /* 
            webpackChain(chain) {
                chain.plugin('analyzer')
                    .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [
                        {
                            analyzerMode: 'static',
                            openAnalyzer: false,
                            reportFilename: 'bundle-report.html'
                        }
                    ])
                chain.merge({
                    optimization: {
                        splitChunks: {
                            cacheGroups: {
                                commons: {
                                    name: 'commons',
                                    chunks: 'initial',
                                    minChunks: 2,
                                    maxInitialRequests: 5,
                                    minSize: 0
                                },
                                vendor: {
                                    test: /[\\/]node_modules[\\/]/,
                                    name: 'vendor',
                                    chunks: 'initial',
                                    priority: 10,
                                    enforce: true
                                }
                            }
                        }
                    }
                })
            }
            */
        }
    }

    return config
})
