import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    plugins: [
        // 打印编译文件路径
        {
            name: 'debug-path',
            transform(code, id) {
                console.log('Processing:', id)
                return code
            }
        }
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    }
    // optimizeDeps: {
    //     include: ['@nutui/icons-react-taro']
    // }
})
