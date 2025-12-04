# Hint Prompts API

基于 Cloudflare Workers + KV 的提示词管理 API。

## 部署步骤

### 1. 安装依赖

```bash
cd cloudflare/prompts-api
pnpm install
```

### 2. 登录 Cloudflare

```bash
npx wrangler login
```

### 3. 创建 KV 命名空间

```bash
# 创建生产环境 KV
npx wrangler kv:namespace create "PROMPTS_KV"

# 输出类似：
# { binding = "PROMPTS_KV", id = "xxxx" }
```

### 4. 配置 wrangler.toml

将上一步返回的 `id` 填入 `wrangler.toml`：

```toml
[[kv_namespaces]]
binding = "PROMPTS_KV"
id = "你的-kv-namespace-id"
```

### 5. 本地开发

```bash
pnpm dev
```

访问 http://localhost:8787

### 6. 部署

```bash
pnpm deploy
```

部署成功后会得到一个 URL，例如：
`https://hint-prompts-api.your-subdomain.workers.dev`

## API 接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/prompts` | GET | 获取所有提示词 |
| `/api/prompts?site=claude.ai` | GET | 按站点筛选 |
| `/api/prompts?category=开发` | GET | 按分类筛选 |
| `/api/prompts/version` | GET | 获取版本信息 |
| `/api/prompts/:id` | GET | 获取单个提示词 |
| `/api/prompts` | POST | 新增提示词 |
| `/api/prompts/:id` | PUT | 更新提示词 |
| `/api/prompts/:id` | DELETE | 删除提示词 |
| `/api/categories` | GET | 获取所有分类 |

### 新增提示词示例

```bash
curl -X POST https://your-api.workers.dev/api/prompts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "代码审查助手",
    "content": "请帮我审查以下代码，重点关注：\n1. 代码规范\n2. 潜在 bug\n3. 性能问题",
    "category": "开发",
    "sites": ["*"],
    "author": "user123"
  }'
```

### 数据结构

```typescript
interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  sites: string[];      // ["*"] 表示所有站点
  author: string;
  createdAt: string;
  updatedAt?: string;
}
```

## 自定义域名（可选）

1. 在 Cloudflare Dashboard 添加域名
2. 修改 `wrangler.toml`：

```toml
[routes]
pattern = "prompts-api.yourdomain.com/*"
zone_name = "yourdomain.com"
```

3. 重新部署：`pnpm deploy`
