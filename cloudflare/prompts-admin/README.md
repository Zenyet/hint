# Hint 提示词管理网页

简单的单页面管理界面，用于管理远程提示词库。

## 部署到 Cloudflare Pages

### 方式一：直接上传

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages**
3. 点击 **Create a project** → **Direct Upload**
4. 上传 `index.html` 文件
5. 完成部署

### 方式二：连接 Git 仓库

1. 将代码推送到 GitHub/GitLab
2. 在 Cloudflare Pages 连接仓库
3. 设置：
   - Build command: (留空)
   - Build output directory: `cloudflare/prompts-admin`
4. 部署

## 配置

部署前，修改 `index.html` 中的 API 地址：

```javascript
const API_URL = 'https://your-worker.workers.dev';
```

替换为你的 Cloudflare Worker API 地址。

## 功能

- ✅ 查看所有提示词
- ✅ 添加新提示词
- ✅ 编辑提示词
- ✅ 删除提示词
- ✅ 按分类筛选
- ✅ 按站点筛选
- ✅ 实时统计

## 自定义域名

在 Cloudflare Pages 设置中添加自定义域名，例如：
- `prompts.yourdomain.com`
