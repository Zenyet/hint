/**
 * 各网站提示词配置
 * 根据不同的AI平台提供对应的提示词
 */

export interface SitePrompt {
  id: string;
  name: string;
  icon: string;
  description: string;
  prompt: string;
}

export interface SiteConfig {
  id: string;
  name: string;
  prompts: SitePrompt[];
}

// 网站配置
export const siteConfigs: SiteConfig[] = [
  {
    id: 'nanobanana',
    name: 'NanoBanana',
    prompts: []
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    prompts: []
  },
  {
    id: 'claude',
    name: 'Claude',
    prompts: []
  },
  {
    id: 'gemini',
    name: 'Gemini',
    prompts: []
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    prompts: []
  },
  {
    id: 'yuanbao',
    name: '腾讯元宝',
    prompts: []
  },
  {
    id: 'grok',
    name: 'Grok',
    prompts: []
  }
];

// 根据网站ID获取配置
export function getSiteConfig(siteId: string): SiteConfig | undefined {
  return siteConfigs.find(site => site.id === siteId);
}

// 根据网站ID获取提示词列表
export function getSitePrompts(siteId: string): SitePrompt[] {
  const config = getSiteConfig(siteId);
  return config?.prompts || [];
}

// 根据当前URL自动检测网站
export function detectSiteFromUrl(url: string): string {
  const hostname = new URL(url).hostname.toLowerCase();

  if (hostname.includes('chatgpt.com') || hostname.includes('openai.com')) {
    return 'chatgpt';
  }
  if (hostname.includes('claude.ai')) {
    return 'claude';
  }
  if (hostname.includes('gemini.google.com')) {
    return 'gemini';
  }
  if (hostname.includes('deepseek.com')) {
    return 'deepseek';
  }
  if (hostname.includes('yuanbao.tencent.com')) {
    return 'yuanbao';
  }
  if (hostname.includes('grok.com')) {
    return 'grok';
  }

  // 默认返回 NanoBanana
  return 'nanobanana';
}
