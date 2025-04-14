import { defineConfig, type UserConfigExport } from '@tarojs/cli'

export default defineConfig<'webpack5'>(async () => {
    const config: UserConfigExport<'webpack5'> = {
        env: {
            NODE_ENV: '"development"'
        },
        defineConstants: {},
        mini: {},
        h5: {}
    }

    return config
})
