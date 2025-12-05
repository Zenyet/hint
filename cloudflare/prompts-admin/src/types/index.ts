// 提示词数据类型
export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  sites: string[];
  author: string;
  imageUrl?: string;
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
  imageUrl?: string;
}

// 更新提示词的请求体
export interface UpdatePromptRequest {
  title?: string;
  content?: string;
  category?: string;
  sites?: string[];
  imageUrl?: string;
}

// 过滤条件
export interface FilterState {
  category: string | null;
  site: string | null;
}

// 支持的站点列表
export const SUPPORTED_SITES = [
  { value: '*', label: '全部站点', icon: '🌐' },
  { value: 'claude.ai', label: 'Claude', icon: '🤖' },
  { value: 'chatgpt.com', label: 'ChatGPT', icon: '💬' },
  { value: 'gemini.google.com', label: 'Gemini', icon: '✨' },
  { value: 'chat.deepseek.com', label: 'DeepSeek', icon: '🔮' },
];

// 默认分类
export const DEFAULT_CATEGORIES = ['开发', '写作', '翻译', 'AI对话', '分析', '创意', '其他'];
