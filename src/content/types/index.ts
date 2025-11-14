export interface Position {
  left: number;
  top: number;
}

export type ButtonState = 'idle' | 'optimize' | 'replace' | 'error';

export interface OptimizationMessage {
  type: 'OPTIMIZE_TEXT';
  text: string;
}

export interface AbortMessage {
  type: 'ABORT_OPTIMIZATION';
}

export interface OptimizationResponse {
  type?: 'chunk' | 'done';
  content?: string;
  error?: string;
}
