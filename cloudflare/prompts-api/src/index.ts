import type { Env, PromptsData, Prompt, CreatePromptRequest, UpdatePromptRequest } from './types';

// CORS 头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// 默认分类
const DEFAULT_CATEGORIES = ['开发', '写作', '翻译', 'AI对话', '分析', '创意', '其他'];

// 允许的图片类型
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// 初始化默认数据
function getDefaultData(): PromptsData {
  return {
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    prompts: [],
    categories: DEFAULT_CATEGORIES,
  };
}

// 生成 UUID
function generateId(): string {
  return crypto.randomUUID();
}

// 增加版本号
function incrementVersion(version: string): string {
  const parts = version.split('.').map(Number);
  parts[2] = (parts[2] || 0) + 1;
  return parts.join('.');
}

// 获取提示词数据
async function getPromptsData(kv: KVNamespace): Promise<PromptsData> {
  const data = await kv.get('prompts', 'json') as PromptsData | null;
  return data || getDefaultData();
}

// 保存提示词数据
async function savePromptsData(kv: KVNamespace, data: PromptsData): Promise<void> {
  data.updatedAt = new Date().toISOString();
  data.version = incrementVersion(data.version);
  await kv.put('prompts', JSON.stringify(data));
}

// JSON 响应
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// 错误响应
function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

// 获取图片的公开 URL
function getImageUrl(request: Request, imageKey: string): string {
  const url = new URL(request.url);
  return `${url.origin}/api/images/${imageKey}`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 处理 CORS 预检请求
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // ==================== 图片相关接口 ====================

      // POST /api/images - 上传图片
      if (path === '/api/images' && method === 'POST') {
        const contentType = request.headers.get('Content-Type') || '';

        // 处理 multipart/form-data
        if (contentType.includes('multipart/form-data')) {
          const formData = await request.formData();
          const file = formData.get('file') as File | null;

          if (!file) {
            return errorResponse('No file provided');
          }

          if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return errorResponse('Invalid file type. Allowed: JPEG, PNG, GIF, WebP');
          }

          if (file.size > MAX_IMAGE_SIZE) {
            return errorResponse('File too large. Max size: 5MB');
          }

          // 生成唯一文件名
          const ext = file.name.split('.').pop() || 'png';
          const imageKey = `${generateId()}.${ext}`;

          // 上传到 R2
          await env.IMAGES_BUCKET.put(imageKey, file.stream(), {
            httpMetadata: {
              contentType: file.type,
            },
          });

          const imageUrl = getImageUrl(request, imageKey);
          return jsonResponse({ success: true, imageKey, imageUrl }, 201);
        }

        return errorResponse('Content-Type must be multipart/form-data');
      }

      // GET /api/images/:key - 获取图片
      const imageMatch = path.match(/^\/api\/images\/([a-f0-9-]+\.[a-z]+)$/);
      if (imageMatch && method === 'GET') {
        const imageKey = imageMatch[1];
        const object = await env.IMAGES_BUCKET.get(imageKey);

        if (!object) {
          return errorResponse('Image not found', 404);
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('Cache-Control', 'public, max-age=31536000'); // 缓存 1 年
        headers.set('Access-Control-Allow-Origin', '*');

        return new Response(object.body, { headers });
      }

      // DELETE /api/images/:key - 删除图片
      const imageDeleteMatch = path.match(/^\/api\/images\/([a-f0-9-]+\.[a-z]+)$/);
      if (imageDeleteMatch && method === 'DELETE') {
        const imageKey = imageDeleteMatch[1];
        await env.IMAGES_BUCKET.delete(imageKey);
        return jsonResponse({ success: true, message: 'Image deleted' });
      }

      // ==================== 提示词相关接口 ====================
      // GET /api/prompts - 获取所有提示词
      if (path === '/api/prompts' && method === 'GET') {
        const data = await getPromptsData(env.PROMPTS_KV);

        // 支持按站点筛选
        const site = url.searchParams.get('site');
        if (site) {
          data.prompts = data.prompts.filter(p =>
            p.sites.includes('*') || p.sites.includes(site)
          );
        }

        // 支持按分类筛选
        const category = url.searchParams.get('category');
        if (category) {
          data.prompts = data.prompts.filter(p => p.category === category);
        }

        return jsonResponse(data);
      }

      // GET /api/prompts/version - 获取版本号（用于检查更新）
      if (path === '/api/prompts/version' && method === 'GET') {
        const data = await getPromptsData(env.PROMPTS_KV);
        return jsonResponse({
          version: data.version,
          updatedAt: data.updatedAt,
          count: data.prompts.length
        });
      }

      // GET /api/prompts/:id - 获取单个提示词
      const singlePromptMatch = path.match(/^\/api\/prompts\/([a-f0-9-]+)$/);
      if (singlePromptMatch && method === 'GET') {
        const id = singlePromptMatch[1];
        const data = await getPromptsData(env.PROMPTS_KV);
        const prompt = data.prompts.find(p => p.id === id);

        if (!prompt) {
          return errorResponse('Prompt not found', 404);
        }
        return jsonResponse(prompt);
      }

      // POST /api/prompts - 新增提示词
      if (path === '/api/prompts' && method === 'POST') {
        const body = await request.json() as CreatePromptRequest;

        // 验证必填字段
        if (!body.title?.trim() || !body.content?.trim()) {
          return errorResponse('Title and content are required');
        }

        const data = await getPromptsData(env.PROMPTS_KV);

        const newPrompt: Prompt = {
          id: generateId(),
          title: body.title.trim(),
          content: body.content.trim(),
          category: body.category || '其他',
          sites: body.sites || ['*'],
          author: body.author || 'anonymous',
          imageUrl: body.imageUrl,
          createdAt: new Date().toISOString(),
        };

        // 如果分类不存在，添加到分类列表
        if (!data.categories.includes(newPrompt.category)) {
          data.categories.push(newPrompt.category);
        }

        data.prompts.push(newPrompt);
        await savePromptsData(env.PROMPTS_KV, data);

        return jsonResponse(newPrompt, 201);
      }

      // PUT /api/prompts/:id - 更新提示词
      const updateMatch = path.match(/^\/api\/prompts\/([a-f0-9-]+)$/);
      if (updateMatch && method === 'PUT') {
        const id = updateMatch[1];
        const body = await request.json() as UpdatePromptRequest;

        const data = await getPromptsData(env.PROMPTS_KV);
        const index = data.prompts.findIndex(p => p.id === id);

        if (index === -1) {
          return errorResponse('Prompt not found', 404);
        }

        const prompt = data.prompts[index];

        // 更新字段
        if (body.title?.trim()) prompt.title = body.title.trim();
        if (body.content?.trim()) prompt.content = body.content.trim();
        if (body.category) prompt.category = body.category;
        if (body.sites) prompt.sites = body.sites;
        if (body.imageUrl !== undefined) prompt.imageUrl = body.imageUrl;
        prompt.updatedAt = new Date().toISOString();

        // 如果分类不存在，添加到分类列表
        if (!data.categories.includes(prompt.category)) {
          data.categories.push(prompt.category);
        }

        data.prompts[index] = prompt;
        await savePromptsData(env.PROMPTS_KV, data);

        return jsonResponse(prompt);
      }

      // DELETE /api/prompts/:id - 删除提示词
      const deleteMatch = path.match(/^\/api\/prompts\/([a-f0-9-]+)$/);
      if (deleteMatch && method === 'DELETE') {
        const id = deleteMatch[1];

        const data = await getPromptsData(env.PROMPTS_KV);
        const index = data.prompts.findIndex(p => p.id === id);

        if (index === -1) {
          return errorResponse('Prompt not found', 404);
        }

        data.prompts.splice(index, 1);
        await savePromptsData(env.PROMPTS_KV, data);

        return jsonResponse({ success: true, message: 'Prompt deleted' });
      }

      // GET /api/categories - 获取所有分类
      if (path === '/api/categories' && method === 'GET') {
        const data = await getPromptsData(env.PROMPTS_KV);
        return jsonResponse({ categories: data.categories });
      }

      // 默认响应
      return jsonResponse({
        message: 'Hint Prompts API',
        endpoints: [
          'GET /api/prompts - 获取所有提示词',
          'GET /api/prompts?site=claude.ai - 按站点筛选',
          'GET /api/prompts?category=开发 - 按分类筛选',
          'GET /api/prompts/version - 获取版本信息',
          'GET /api/prompts/:id - 获取单个提示词',
          'POST /api/prompts - 新增提示词',
          'PUT /api/prompts/:id - 更新提示词',
          'DELETE /api/prompts/:id - 删除提示词',
          'GET /api/categories - 获取所有分类',
          'POST /api/images - 上传图片 (multipart/form-data)',
          'GET /api/images/:key - 获取图片',
          'DELETE /api/images/:key - 删除图片',
        ]
      });

    } catch (error) {
      console.error('Error:', error);
      return errorResponse('Internal server error', 500);
    }
  },
};
