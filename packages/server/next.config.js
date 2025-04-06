/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@zhengang-tower/shared'],
    // 禁用页面渲染相关的特性，因为我们只提供 API 服务
    output: 'standalone',
    experimental: {
        // Next.js 15 的实验性特性
        serverComponentsExternalPackages: [],
        esmExternals: true,
    },
    // 配置 CORS 和其他 API 服务相关的头信息
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
                    { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
                ],
            },
        ];
    },
}

module.exports = nextConfig 