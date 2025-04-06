export default function ApiHome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-6">振钢大厦 API 服务</h1>
      <p className="text-xl mb-8">这是一个纯 API 服务，请使用适当的端点进行访问</p>
      
      <div className="max-w-2xl w-full bg-gray-100 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">API 端点示例:</h2>
        <ul className="space-y-2">
          <li><code className="bg-gray-200 px-2 py-1 rounded">/api</code> - 获取 API 服务信息</li>
          <li><code className="bg-gray-200 px-2 py-1 rounded">/api/hello</code> - 测试 API 端点</li>
        </ul>
      </div>
    </main>
  )
} 