import OpenAI from "openai";
import prompt from "../../prompt";
import { checkForUpdates, fetchRemotePrompts } from "../shared/remotePrompts";

// 远程提示词更新检查间隔（毫秒）
const UPDATE_CHECK_INTERVAL = 30 * 60 * 1000; // 30 分钟

// Storage Service
class StorageService {
  static async getApiKey(): Promise<string | null> {
    const result = await chrome.storage.sync.get('api_key');
    return result.api_key || null;
  }

  static async getModelBaseURL(): Promise<string | null> {
    const result = await chrome.storage.sync.get('model_base_url');
    return result.model_base_url || null;
  }

  static async getModelName(): Promise<string | null> {
    const result = await chrome.storage.sync.get('model_name');
    return result.model_name || null;
  }

  static async getCustomPrompt(): Promise<string | null> {
    const result = await chrome.storage.sync.get('custom_prompt');
    return result.custom_prompt || null;
  }
}

// Background Service
class BackgroundService {
  private openai: OpenAI | null = null;
  private abortController: AbortController | null = null;

  private async initializeOpenAI(baseURLOverride?: string) {
    const apiKey = await StorageService.getApiKey();
    const storedBaseURL = await StorageService.getModelBaseURL();

    if (!apiKey) {
      throw new Error("请先配置 API Key");
    }

    const baseURL = baseURLOverride ?? storedBaseURL ?? "https://api.deepseek.com";

    this.openai = new OpenAI({
      baseURL,
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  public abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  public async optimizeText(request: { text: string; modelName?: string; modelBaseUrl?: string; systemPrompt?: string }, sendResponse: (response: any) => void): Promise<void> {
    try {
      await this.initializeOpenAI(request.modelBaseUrl);
      if (!this.openai) throw new Error("OpenAI 客户端未初始化");

      this.abortController = new AbortController();
      const modelName = request.modelName ?? (await StorageService.getModelName()) ?? "deepseek-chat";
      const storedPrompt = await StorageService.getCustomPrompt();
      const systemPrompt = request.systemPrompt ?? (storedPrompt && storedPrompt.trim().length > 0 ? storedPrompt : prompt);

      const stream = await this.openai.chat.completions.create(
        {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: request.text },
          ],
          model: modelName,
          stream: true,
        },
        { signal: this.abortController.signal }
      );

      let result = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        result += content;
        sendResponse({ type: "chunk", content });
      }

      sendResponse({ type: "done", content: result });
    } catch (error: any) {
      console.error("Error optimizing text:", error);
      sendResponse({ error: error.message });
    } finally {
      this.abortController = null;
    }
  }
}

const backgroundService = new BackgroundService();

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (request) => {
    if (request.type === "OPTIMIZE_TEXT") {
      try {
        await backgroundService.optimizeText(request, (response) => {
          port.postMessage(response);
        });
      } catch (error: any) {
        port.postMessage({ error: error.message });
      }
    } else if (request.type === "ABORT_OPTIMIZATION") {
      backgroundService.abort();
      port.postMessage({ success: true });
    } else if (request.type === "GET_REMOTE_PROMPTS") {
      // 获取远程提示词
      try {
        const data = await fetchRemotePrompts(request.site);
        port.postMessage({ type: "prompts", data });
      } catch (error: any) {
        port.postMessage({ error: error.message });
      }
    } else if (request.type === "CHECK_PROMPTS_UPDATE") {
      // 检查提示词更新
      try {
        const result = await checkForUpdates();
        port.postMessage({ type: "update_check", ...result });
      } catch (error: any) {
        port.postMessage({ error: error.message });
      }
    }
  });
});

// 定期检查远程提示词更新
async function schedulePromptsUpdate() {
  try {
    const { hasUpdate, version } = await checkForUpdates();
    if (hasUpdate) {
      console.log(`[RemotePrompts] New version available: ${version}, fetching...`);
      await fetchRemotePrompts();
      console.log('[RemotePrompts] Cache updated');
    }
  } catch (error) {
    console.error('[RemotePrompts] Update check failed:', error);
  }
}

// 扩展安装/更新时预加载提示词
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[RemotePrompts] Extension installed/updated, fetching prompts...');
  await fetchRemotePrompts();
});

// 定期检查更新
setInterval(schedulePromptsUpdate, UPDATE_CHECK_INTERVAL);

// 开发模式下的自动重载功能
if (import.meta.env.DEV) {
  const WS_URL = 'ws://localhost:8765';
  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  function connectReloadServer() {
    try {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('[🔄 HMR] Connected to reload server');
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'reload') {
            console.log('[🔄 HMR] Reloading extension due to:', message.file);
            chrome.runtime.reload();
          }
        } catch (error) {
          console.error('[🔄 HMR] Error parsing message:', error);
        }
      };

      ws.onerror = () => {
        console.log('[🔄 HMR] WebSocket error, will retry...');
      };

      ws.onclose = () => {
        console.log('[🔄 HMR] Disconnected from reload server, reconnecting...');
        ws = null;
        // 5 秒后重连
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(connectReloadServer, 5000);
        }
      };
    } catch (error) {
      console.error('[🔄 HMR] Failed to connect:', error);
      // 5 秒后重试
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(connectReloadServer, 5000);
      }
    }
  }

  // 启动连接
  connectReloadServer();

  console.log('[🔄 HMR] Auto-reload enabled');
}
