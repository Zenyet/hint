/**
 * 远程提示词服务
 * 负责从 Cloudflare Workers API 获取和缓存提示词
 */

// 远程 API 地址（部署后替换为实际地址）
const REMOTE_API_URL = 'https://hint-prompts-api.yex.workers.dev';

// 缓存 keys
const CACHE_KEY = 'remote_prompts_cache';
const VERSION_KEY = 'remote_prompts_version';
const LAST_FETCH_KEY = 'remote_prompts_last_fetch';

// 缓存过期时间（毫秒）
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟

// 远程提示词类型（与 API 返回结构一致）
export interface RemotePrompt {
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

export interface RemotePromptsData {
  version: string;
  updatedAt: string;
  prompts: RemotePrompt[];
  categories: string[];
}

export interface VersionInfo {
  version: string;
  updatedAt: string;
  count: number;
}

/**
 * 获取远程提示词（带缓存）
 */
export async function fetchRemotePrompts(site?: string): Promise<RemotePromptsData> {
  try {
    // 检查缓存是否有效
    const cached = await getCachedPrompts();
    const expired = await isCacheExpired();
    if (cached && !expired) {
      // 如果需要按站点筛选，在本地过滤（返回副本避免修改缓存）
      if (site && cached.prompts) {
        return {
          ...cached,
          prompts: cached.prompts.filter(p =>
            p.sites.includes('*') || p.sites.includes(site)
          )
        };
      }
      return cached;
    }

    // 从远程获取
    const url = site
      ? `${REMOTE_API_URL}/api/prompts?site=${encodeURIComponent(site)}`
      : `${REMOTE_API_URL}/api/prompts`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: RemotePromptsData = await response.json();

    // 缓存数据
    await cachePrompts(data);

    return data;
  } catch (error) {
    console.error('[RemotePrompts] Fetch failed:', error);

    // 离线时返回缓存（即使过期）
    const cached = await getCachedPrompts();
    if (cached) {
      return cached;
    }

    // 完全没有数据时返回空结构
    return {
      version: '0.0.0',
      updatedAt: '',
      prompts: [],
      categories: []
    };
  }
}

/**
 * 检查是否有新版本
 */
export async function checkForUpdates(): Promise<{ hasUpdate: boolean; version?: string }> {
  try {
    const response = await fetch(`${REMOTE_API_URL}/api/prompts/version`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const info: VersionInfo = await response.json();
    const localVersion = await getLocalVersion();

    if (localVersion !== info.version) {
      return { hasUpdate: true, version: info.version };
    }
    return { hasUpdate: false };
  } catch (error) {
    console.error('[RemotePrompts] Version check failed:', error);
    return { hasUpdate: false };
  }
}

/**
 * 强制刷新缓存
 */
export async function refreshCache(): Promise<RemotePromptsData> {
  // 清除缓存时间，强制重新获取
  await chrome.storage.local.remove(LAST_FETCH_KEY);
  return fetchRemotePrompts();
}

/**
 * 获取缓存的提示词
 */
async function getCachedPrompts(): Promise<RemotePromptsData | null> {
  const result = await chrome.storage.local.get(CACHE_KEY);
  return result[CACHE_KEY] || null;
}

/**
 * 缓存提示词数据
 */
async function cachePrompts(data: RemotePromptsData): Promise<void> {
  await chrome.storage.local.set({
    [CACHE_KEY]: data,
    [VERSION_KEY]: data.version,
    [LAST_FETCH_KEY]: Date.now()
  });
}

/**
 * 获取本地版本号
 */
async function getLocalVersion(): Promise<string | null> {
  const result = await chrome.storage.local.get(VERSION_KEY);
  return result[VERSION_KEY] || null;
}

/**
 * 检查缓存是否过期
 */
async function isCacheExpired(): Promise<boolean> {
  const result = await chrome.storage.local.get(LAST_FETCH_KEY);
  const lastFetch = result[LAST_FETCH_KEY];

  if (!lastFetch) return true;
  return Date.now() - lastFetch > CACHE_TTL;
}

/**
 * 清除所有缓存
 */
export async function clearCache(): Promise<void> {
  await chrome.storage.local.remove([CACHE_KEY, VERSION_KEY, LAST_FETCH_KEY]);
}

/**
 * 上传图片到远程服务器
 */
export async function uploadImage(file: File): Promise<{ imageKey: string; imageUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${REMOTE_API_URL}/api/images`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const result = await response.json();
  return { imageKey: result.imageKey, imageUrl: result.imageUrl };
}

/**
 * 上传 base64 图片到远程服务器
 */
export async function uploadBase64Image(base64Data: string, filename: string = 'image.png'): Promise<{ imageKey: string; imageUrl: string }> {
  // 将 base64 转换为 Blob
  const byteString = atob(base64Data.split(',')[1]);
  const mimeType = base64Data.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeType });
  const file = new File([blob], filename, { type: mimeType });

  return uploadImage(file);
}

/**
 * 上传提示词到远程服务器
 */
export interface UploadPromptRequest {
  title: string;
  content: string;
  category?: string;
  sites?: string[];
  author?: string;
  imageUrl?: string;
}

export async function uploadPrompt(prompt: UploadPromptRequest): Promise<RemotePrompt> {
  const response = await fetch(`${REMOTE_API_URL}/api/prompts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: prompt.title,
      content: prompt.content,
      category: prompt.category || '其他',
      sites: prompt.sites || ['*'],
      author: prompt.author || 'anonymous',
      imageUrl: prompt.imageUrl
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const result: RemotePrompt = await response.json();

  // 上传成功后刷新缓存
  await refreshCache();

  return result;
}

/**
 * 获取 API URL（供管理页面使用）
 */
export function getApiUrl(): string {
  return REMOTE_API_URL;
}

/**
 * 设置 API URL（允许自定义服务器）
 */
export async function setApiUrl(url: string): Promise<void> {
  await chrome.storage.sync.set({ remote_api_url: url });
}

/**
 * 将远程提示词转换为扩展内部使用的格式
 */
export function convertToTemplateFormat(prompt: RemotePrompt) {
  return {
    id: prompt.id,
    name: prompt.title,
    icon: prompt.title.substring(0, 2).toUpperCase(),
    description: prompt.content.substring(0, 50) + '...',
    prompt: prompt.content,
    category: 'text' as const,
    isBuiltin: false,
    sites: prompt.sites,
    author: prompt.author,
    imageUrl: prompt.imageUrl
  };
}
