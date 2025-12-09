/**
 * 本地提示词服务
 * 管理用户自定义的本地提示词
 */

// 存储 key
const LOCAL_PROMPTS_KEY = 'local_prompts';

// 本地提示词接口
export interface LocalPrompt {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;      // 图片 URL（本地 base64 或远程 URL）
  imageData?: string;     // 本地图片 base64 数据
  remoteId?: string;      // 已上传到远程的 ID
  createdAt: string;
  updatedAt?: string;
}

// 扩展的 SitePrompt 格式（用于 dropdown 显示）
export interface LocalSitePrompt {
  id: string;
  name: string;
  icon: string;
  description: string;
  prompt: string;
  imageUrl?: string;
  isLocal: true;
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 获取所有本地提示词
 */
export async function getLocalPrompts(): Promise<LocalPrompt[]> {
  try {
    const result = await chrome.storage.local.get(LOCAL_PROMPTS_KEY);
    return result[LOCAL_PROMPTS_KEY] || [];
  } catch (error) {
    console.error('[LocalPrompts] Failed to get prompts:', error);
    return [];
  }
}

/**
 * 保存本地提示词（新增或更新）
 */
export async function saveLocalPrompt(prompt: Partial<LocalPrompt>): Promise<LocalPrompt> {
  const prompts = await getLocalPrompts();
  const now = new Date().toISOString();

  let savedPrompt: LocalPrompt;

  if (prompt.id) {
    // 更新现有提示词
    const index = prompts.findIndex(p => p.id === prompt.id);
    if (index === -1) {
      throw new Error('Prompt not found');
    }
    savedPrompt = {
      ...prompts[index],
      title: prompt.title || prompts[index].title,
      content: prompt.content || prompts[index].content,
      imageUrl: prompt.imageUrl !== undefined ? prompt.imageUrl : prompts[index].imageUrl,
      imageData: prompt.imageData !== undefined ? prompt.imageData : prompts[index].imageData,
      remoteId: prompt.remoteId !== undefined ? prompt.remoteId : prompts[index].remoteId,
      updatedAt: now
    };
    prompts[index] = savedPrompt;
  } else {
    // 新增提示词
    savedPrompt = {
      id: generateId(),
      title: prompt.title || '',
      content: prompt.content || '',
      imageUrl: prompt.imageUrl,
      imageData: prompt.imageData,
      remoteId: prompt.remoteId,
      createdAt: now
    };
    prompts.push(savedPrompt);
  }

  await chrome.storage.local.set({ [LOCAL_PROMPTS_KEY]: prompts });
  return savedPrompt;
}

/**
 * 删除本地提示词
 */
export async function deleteLocalPrompt(id: string): Promise<void> {
  const prompts = await getLocalPrompts();
  const filtered = prompts.filter(p => p.id !== id);
  await chrome.storage.local.set({ [LOCAL_PROMPTS_KEY]: filtered });
}

/**
 * 将本地提示词转换为 SitePrompt 格式（用于 dropdown 显示）
 */
export function convertToSitePrompt(prompt: LocalPrompt): LocalSitePrompt {
  return {
    id: prompt.id,
    name: prompt.title,
    icon: prompt.title.substring(0, 2).toUpperCase(),
    description: prompt.content.length > 50
      ? prompt.content.substring(0, 50) + '...'
      : prompt.content,
    prompt: prompt.content,
    imageUrl: prompt.imageUrl || prompt.imageData,
    isLocal: true
  };
}

/**
 * 清除所有本地提示词
 */
export async function clearLocalPrompts(): Promise<void> {
  await chrome.storage.local.remove(LOCAL_PROMPTS_KEY);
}
