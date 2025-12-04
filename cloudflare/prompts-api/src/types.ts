// 提示词数据类型
export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  sites: string[];  // ["*"] 表示所有站点，["claude.ai", "chatgpt.com"] 表示特定站点
  author: string;
  createdAt: string;
  updatedAt?: string;
}

// 完整的提示词数据结构
export interface PromptsData {
  version: string;
  updatedAt: string;
  prompts: Prompt[];
  categories: string[];
}

// 新增提示词的请求体
export interface CreatePromptRequest {
  title: string;
  content: string;
  category: string;
  sites?: string[];
  author?: string;
}

// 更新提示词的请求体
export interface UpdatePromptRequest {
  title?: string;
  content?: string;
  category?: string;
  sites?: string[];
}

// Cloudflare Worker 环境变量类型
export interface Env {
  PROMPTS_KV: KVNamespace;
  ENVIRONMENT: string;
}
