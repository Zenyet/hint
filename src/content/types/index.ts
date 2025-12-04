export interface Position {
  left: number;
  top: number;
}

export type ButtonState = 'idle' | 'optimize' | 'replace' | 'error';

export interface OptimizationMessage {
  type: 'OPTIMIZE_TEXT';
  text: string;
  templateId?: string;
  systemPrompt?: string;
}

export interface AbortMessage {
  type: 'ABORT_OPTIMIZATION';
}

export interface OptimizationResponse {
  type?: 'chunk' | 'done';
  content?: string;
  error?: string;
}

// 模板选择相关
export interface TemplateOption {
  id: string;
  name: string;
  icon: string;
  category: 'text' | 'image';
}
