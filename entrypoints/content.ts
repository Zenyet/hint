import { DOMManager } from "./utils/DOMManager";

export default defineContentScript({
  matches: [
    "*://*.openai.com/*",
    "*://*.chatgpt.com/*",
    "*://*.claude.ai/*",
    "*://*.yuanbao.tencent.com/*",
    "*://*.gemini.google.com/*",
    "*://*.chat.deepseek.com/*",
    "*://*.grok.com/*"
  ],
  main() {
    let domManager: DOMManager | null = null;

    // 当页面加载完成后执行
    if (document.readyState === "complete") {
      domManager = new DOMManager();
      return () => domManager?.cleanup();
    } else {
      const loadHandler = () => {
        window.removeEventListener("load", loadHandler);
        domManager = new DOMManager();
        return () => domManager?.cleanup();
      };
      window.addEventListener("load", loadHandler);
      return () => {
        window.removeEventListener("load", loadHandler);
        domManager?.cleanup();
      };
    }
  },
});
