# @zhengangtower/shared

这个包包含镇罡塔项目中共享的类型定义、常量、工具函数等内容。可以被前端小程序和服务端共同使用。

## 主要内容

### 类型定义
- `/types/index.ts` - 基础类型定义
- `/types/api.ts` - API相关类型定义
- `/types/3d-models.ts` - 3D模型相关类型定义
- `/types/theme.ts` - 主题相关类型定义
- `/types/mock-data.ts` - 模拟数据

### 工具函数
- `/utils/formatters.ts` - 格式化工具函数
- `/utils/validators.ts` - 验证工具函数
- `/utils/constants.ts` - 常量定义

## 安装

在项目根目录运行以下命令安装依赖：

```bash
pnpm install
```

## 构建

构建共享包：

```bash
pnpm --filter @zhengangtower/shared build
```

## 开发

开发模式下监听文件变化并自动重新构建：

```bash
pnpm --filter @zhengangtower/shared dev
```

## 在其他包中使用

在其他包的 `package.json` 中添加依赖：

```json
{
  "dependencies": {
    "@zhengangtower/shared": "workspace:*"
  }
}
```

然后在代码中导入：

```typescript
// 导入类型
import { TowerInfo, CultureKnowledge } from '@zhengangtower/shared';

// 导入工具函数
import { formatDateTime, isValidEmail } from '@zhengangtower/shared';

// 导入常量
import { API_PATHS, STORAGE_KEYS } from '@zhengangtower/shared';
``` 