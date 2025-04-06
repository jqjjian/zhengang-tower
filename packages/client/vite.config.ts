export default {
    plugins: [
        // 打印编译文件路径
        {
            name: 'debug-path',
            transform(code, id) {
                console.log('Processing:', id)
                return code
            }
        }
    ]
    // optimizeDeps: {
    //     include: ['@nutui/icons-react-taro']
    // }
}
