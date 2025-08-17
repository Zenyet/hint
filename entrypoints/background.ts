import OpenAI from "openai";
import prompt from "@/prompt";
import { StorageService } from "./services/StorageService";

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
        // 发送每个 chunk 到前端
        sendResponse({ type: "chunk", content });
      }

      // 发送完成信号
      sendResponse({ type: "done", content: result });
    } catch (error: any) {
      console.error("Error optimizing text:", error);
      sendResponse({ error: error.message });
    } finally {
      this.abortController = null;
    }
  }
}

export default defineBackground({
  main() {
    const backgroundService = new BackgroundService();
    let port: chrome.runtime.Port | null = null;

    chrome.runtime.onConnect.addListener((p) => {
      port = p;
      port.onMessage.addListener(async (request) => {
        if (request.type === "OPTIMIZE_TEXT") {
          try {
            await backgroundService.optimizeText(request, (response) => {
              port?.postMessage(response);
            });
          } catch (error) {
            port?.postMessage({ error: error.message });
          }
        } else if (request.type === "ABORT_OPTIMIZATION") {
          backgroundService.abort();
          port?.postMessage({ success: true });
        }
      });

      port.onDisconnect.addListener(() => {
        port = null;
      });
    });
  }
});
