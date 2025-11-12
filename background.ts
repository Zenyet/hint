import OpenAI from "openai";
import type { PlasmoMessaging } from "@plasmohq/messaging";

// 导入 prompt 配置
const prompt = `
    # 角色设定（Role Definition）
    你是一名提示词编写专家（用于提问大模型网站），你能理解用户的需求，编写出合适的提示词，高效并准确，尽量防止大模型出现幻觉；返回格式为纯文本，禁止直接回答问题，只需要返回纯文本格式；
    不要出现"以下是优化后的:... xxx: xxxx: "冒号后的，只需要优化后的提示词!
    # 严格遵守
    1. 如果出现无意义的输入（纯空格、无意义的符号、完全无意义的文段等，自行判断），直接忽略，不返回任何内容
    2. 禁止直接回答问题，只需要返回纯文本格式
    3. 只返回优化后的提示词 如： input: 优化前的提示词 output: 优化后的提示词, 切不需要对优化后的提示词进行任何解释
`;

// Storage Service
class StorageService {
  private static readonly API_KEY_STORAGE_KEY = 'api_key';
  private static readonly MODEL_BASE_URL_KEY = 'model_base_url';
  private static readonly MODEL_NAME_KEY = 'model_name';
  private static readonly CUSTOM_PROMPT_KEY = 'custom_prompt';

  public static async getApiKey(): Promise<string | null> {
    const result = await chrome.storage.sync.get(this.API_KEY_STORAGE_KEY);
    return result[this.API_KEY_STORAGE_KEY] || null;
  }

  public static async getModelBaseURL(): Promise<string | null> {
    const result = await chrome.storage.sync.get(this.MODEL_BASE_URL_KEY);
    return result[this.MODEL_BASE_URL_KEY] || null;
  }

  public static async getModelName(): Promise<string | null> {
    const result = await chrome.storage.sync.get(this.MODEL_NAME_KEY);
    return result[this.MODEL_NAME_KEY] || null;
  }

  public static async getCustomPrompt(): Promise<string | null> {
    const result = await chrome.storage.sync.get(this.CUSTOM_PROMPT_KEY);
    return result[this.CUSTOM_PROMPT_KEY] || null;
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
      throw new Error("请先在设置页面配置 API Key");
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
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: request.text,
            },
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

// 监听长连接
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
    }
  });

  port.onDisconnect.addListener(() => {
    // 清理资源
  });
});
