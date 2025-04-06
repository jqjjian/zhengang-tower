import { defineConfig, type UserConfigExport } from '@tarojs/cli'

export default defineConfig<'vite'>(async () => {
  const config: UserConfigExport<'vite'> = {
    mini: {},
    h5: {}
  }
  
  return config
})
