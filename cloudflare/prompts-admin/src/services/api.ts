import type { Prompt, PromptsData, CreatePromptRequest, UpdatePromptRequest } from '../types';

// API 配置
const API_URL = 'https://hint-prompts-api.yex.workers.dev';

// 获取所有提示词
export async function fetchPrompts(site?: string, category?: string): Promise<PromptsData> {
  const params = new URLSearchParams();
  if (site) params.append('site', site);
  if (category) params.append('category', category);

  const url = params.toString()
    ? `${API_URL}/api/prompts?${params}`
    : `${API_URL}/api/prompts`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch prompts: ${response.status}`);
  }
  return response.json();
}

// 获取单个提示词
export async function fetchPrompt(id: string): Promise<Prompt> {
  const response = await fetch(`${API_URL}/api/prompts/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch prompt: ${response.status}`);
  }
  return response.json();
}

// 创建提示词
export async function createPrompt(data: CreatePromptRequest): Promise<Prompt> {
  const response = await fetch(`${API_URL}/api/prompts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to create prompt: ${response.status}`);
  }
  return response.json();
}

// 更新提示词
export async function updatePrompt(id: string, data: UpdatePromptRequest): Promise<Prompt> {
  const response = await fetch(`${API_URL}/api/prompts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to update prompt: ${response.status}`);
  }
  return response.json();
}

// 删除提示词
export async function deletePrompt(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/prompts/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete prompt: ${response.status}`);
  }
}

// 上传图片
export async function uploadImage(file: File): Promise<{ imageUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/images`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload image');
  }

  return response.json();
}

// 删除图片
export async function deleteImage(imageKey: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/images/${imageKey}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete image: ${response.status}`);
  }
}
