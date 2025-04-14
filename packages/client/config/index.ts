import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import devConfig from './dev'
import prodConfig from './prod'
import * as path from 'path'

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig(async (merge) => {
    const baseConfig: UserConfigExport = {
        projectName: 'zhengang-tower',
        date: '2025-4-6',
        designWidth: 750, // 固定设计稿宽度为750
        deviceRatio: {
            640: 2.34 / 2,
            750: 1,
            375: 2 / 1,
            828: 1.81 / 2
        },
        sourceRoot: 'src',
        outputRoot: 'dist',
        plugins: ['@tarojs/plugin-framework-react', '@tarojs/plugin-html'],
        defineConstants: {},
        copy: {
            patterns: [],
            options: {}
        },
        framework: 'react',
        // experiments: {
        //     prebundle: {
        //         enable: false // 核心开关
        //     }
        // },
        compiler: {
            type: 'webpack5',
            prebundle: {
                enable: false
            }
        },
        alias: {
            '@/components': path.resolve(__dirname, '..', 'src/components'),
            '@/utils': path.resolve(__dirname, '..', 'src/utils'),
            '@/assets': path.resolve(__dirname, '..', 'src/assets'),
            '@/pages': path.resolve(__dirname, '..', 'src/pages'),
            '@': path.resolve(__dirname, '..', 'src')
        },
        // vite: {
        //     // css: {
        //     //     preprocessorOptions: {
        //     //         less: {
        //     //             // duxui的less变量覆盖
        //     //             modifyVars: {
        //     //                 'primary-color': '#1DA57A',
        //     //                 'border-radius-base': '4px'
        //     //             },
        //     //             javascriptEnabled: true
        //     //         // }
        //     //     }
        //     // },
        //     prebundle: {
        //         exclude: ['@nutui/nutui-react-taro', '@nutui/icons-react-taro'],
        //         enable: true
        //     }
        // },
        mini: {
            webpackChain(chain) {
                chain.resolve.alias.set('react', 'react')
                chain.resolve.alias.set('react-dom', 'react-dom')
                chain.resolve.alias.set(
                    '@',
                    path.resolve(__dirname, '..', 'src')
                )
                // chain.resolve.alias.set(
                //     '@nutui/icons-react-taro',
                //     path.resolve(
                //         __dirname,
                //         'node_modules/@nutui/icons-react-taro'
                //     )
                // )

                // 处理 JSX/TSX 文件（避免图标组件语法未编译）
                // chain.module
                //     .rule('script')
                //     .test(/\.(jsx|tsx)$/)
                //     .use('babel-loader')
                //     .loader('babel-loader')
                //     .options({ presets: ['@babel/preset-react'] })
                // 解决taro-ui加载问题
                chain.merge({
                    module: {
                        rule: [
                            {
                                test: /\\.(png|jpe?g|gif|webp|svg)$/,
                                type: 'asset/inline' // 全量转为 Base64
                            }
                        ]

                        // taroUi: {
                        //     test: /taro-ui\/dist\/style/,
                        //     use: [
                        //         {
                        //             loader: 'style-loader'
                        //         },
                        //         {
                        //             loader: 'css-loader'
                        //         },
                        //         {
                        //             loader: 'sass-loader',
                        //             options: {
                        //                 implementation: require('sass')
                        //             }
                        //         }
                        //     ]
                        // }
                        // 处理duxui的less文件
                        // duxuiStyle: {
                        //     test: /\.less$/,
                        //     use: [
                        //         {
                        //             loader: 'style-loader'
                        //         },
                        //         {
                        //             loader: 'css-loader'
                        //         },
                        //         {
                        //             loader: 'less-loader',
                        //             options: {
                        //                 lessOptions: {
                        //                     modifyVars: {
                        //                         'primary-color': '#1DA57A',
                        //                         'border-radius-base': '4px'
                        //                     },
                        //                     javascriptEnabled: true
                        //                 }
                        //             }
                        //         }
                        //     ]
                        // }
                    }
                })
            },

            // miniCssExtractPluginOption: {
            //     ignoreOrder: true // 忽略 CSS 顺序警告‌:ml-citation{ref="4,6" data="citationList"}
            // },
            postcss: {
                pxtransform: {
                    enable: true,
                    config: {
                        selectorBlackList: ['nut-']
                    }
                },
                url: {
                    enable: true,
                    config: {
                        // 去掉limit选项，使用默认配置
                    }
                },
                cssModules: {
                    enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
                    config: {
                        namingPattern: 'module', // 转换模式，取值为 global/module
                        generateScopedName: '[name]__[local]___[hash:base64:5]'
                    }
                }
            },
            optimizeMainPackage: {
                enable: true // 开启主包优化
                // exclude: ['moduleA'], // （可选）排除不需要优化的模块
                // include: ['moduleB'] // （可选）强制指定需要优化的模块
            }
        },
        h5: {
            publicPath: '/',
            staticDirectory: 'static',

            miniCssExtractPluginOption: {
                ignoreOrder: true,
                filename: 'css/[name].[hash].css',
                chunkFilename: 'css/[name].[chunkhash].css'
            },
            postcss: {
                autoprefixer: {
                    enable: true,
                    config: {}
                },
                url: {
                    enable: true,
                    config: {
                        // 去掉limit选项，使用默认配置
                    }
                },
                cssModules: {
                    enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
                    config: {
                        namingPattern: 'module', // 转换模式，取值为 global/module
                        generateScopedName: '[name]__[local]___[hash:base64:5]'
                    }
                }
            }
        },
        rn: {
            appName: 'taroDemo',
            postcss: {
                cssModules: {
                    enable: false // 默认为 false，如需使用 css modules 功能，则设为 true
                }
            }
        }
    }
    if (process.env.NODE_ENV === 'development') {
        // 本地开发构建配置（不混淆压缩）
        return merge({}, baseConfig, devConfig)
    }
    // 生产构建配置（默认开启压缩混淆等）
    return merge({}, baseConfig, prodConfig)
})
