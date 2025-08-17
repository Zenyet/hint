import OpenAI from "openai";
import prompt from "@/prompt";
import { StorageService } from "./StorageService";

export class AIService {
  public abort() {
    chrome.runtime.sendMessage({ type: "ABORT_OPTIMIZATION" });
  }

  private port: chrome.runtime.Port | null = null;

  private initializePort() {
    if (!this.port) {
      this.port = chrome.runtime.connect();
    }
    return this.port;
  }

  public async optimizeText(
    originalText: string,
    onChunk?: (chunk: string) => void,
    options?: { modelName?: string; modelBaseUrl?: string; systemPrompt?: string }
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let result = "";
      const port = this.initializePort();

      const messageHandler = (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }

        if (response.type === "chunk") {
          if (onChunk) {
            onChunk(response.content);
          }
          result += response.content;
        } else if (response.type === "done") {
          resolve(result);
          port.onMessage.removeListener(messageHandler);
        }
      };

      port.onMessage.addListener(messageHandler);
      port.postMessage({
        type: "OPTIMIZE_TEXT",
        text: originalText,
        ...(options || {})
      });
    });
  }
}
