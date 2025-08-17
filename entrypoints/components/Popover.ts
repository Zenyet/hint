import { debounce } from "@/utils/index.js";
import { AIService } from "../services/AIService";

export class Popover {
  private element: HTMLElement;
  private popoverElement: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private buttonState: "idle" | "optimize" | "replace" | "error" = "idle";
  private optimizedText: string = "";
  private isLoading: boolean = false;
  private actionButton: HTMLButtonElement | null = null;
  private closeButton: HTMLButtonElement | null = null;
  private optimizedTextElement: HTMLElement | null = null;
  private aiService: AIService | null = null;

  constructor(element: HTMLElement, private shadowRoot: ShadowRoot) {
    this.element = element;
    this.init();
  }

  private init() {
    this.createPopover();
    this.setupPositioning();
    this.setupDarkModeListener();
  }

  private createPopover() {
    const isDarkMode = window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches;

    this.popoverElement = document.createElement("div");
    this.popoverElement.className = `text-popover ${
      isDarkMode ? "dark-mode" : ""
    }`;
    this.popoverElement.style.position = "fixed";
    this.popoverElement.style.transform = "translateY(-100%)";

    const popoverContent = this.createPopoverContent();
    this.popoverElement.appendChild(popoverContent);
    this.shadowRoot.appendChild(this.popoverElement);
  }

  private createPopoverContent() {
    const popoverContent = document.createElement("div");
    popoverContent.className = "popover-content";

    this.actionButton = this.createActionButton();
    this.closeButton = this.createCloseButton();

    if (this.buttonState === 'idle') this.closeButton?.classList.add('none');

    popoverContent.appendChild(this.actionButton);
    popoverContent.appendChild(this.closeButton);

    return popoverContent;
  }

  private createActionButton() {
    const actionButton = document.createElement("button");
    actionButton.className = "replace-button";
    actionButton.innerHTML = this.getActionButtonIcon();
    actionButton.addEventListener("click", () =>
      this.handleActionButtonClick()
    );
    return actionButton;
  }

  private createCloseButton() {
    const closeButton = document.createElement("button");
    closeButton.className = "close-button";
    closeButton.setAttribute("aria-label", "Close");
    closeButton.innerHTML = this.getCloseButtonIcon();
    closeButton.addEventListener("click", () => this.handleCloseButtonClick());
    return closeButton;
  }

  private getActionButtonIcon() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap-icon lucide-zap"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
    `;
  }

  private getLoadingSpinnerIcon() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="loading-spinner"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
    `;
  }

  private getCloseButtonIcon() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    `;
  }

  private getReplaceButtonIcon() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
      `;
  }

  updatePosition(element: HTMLElement = this.element) {
    this.element = element;
    if (!this.popoverElement) return;
    const rect = (element.parentElement || element).getBoundingClientRect();
    this.popoverElement.style.left = `${rect.left + window.scrollX}px`;
    this.popoverElement.style.top = `${rect.top + window.scrollY - 15}px`;
  }

  idleHide() {
    this.popoverElement?.classList.add("none");
  }

  show() {
    this.popoverElement?.classList.remove("none");
  }

  private setupPositioning() {
    this.resizeObserver = new ResizeObserver(() => this.updatePosition());
    this.resizeObserver.observe(this.element);

    window.addEventListener(
      "resize",
      debounce(() => this.updatePosition(), 100)
    );
    this.updatePosition();
  }

  private setupDarkModeListener() {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    darkModeMediaQuery.addEventListener("change", (e) => {
      if (!this.popoverElement) return;
      this.popoverElement.classList.toggle("dark-mode", e.matches);
    });
  }

  private async handleActionButtonClick() {
    if (this.buttonState === "idle") {
      this.buttonState = "optimize";
      this.closeButton?.classList.remove('none');
      await this.handleOptimize();
    } else {
      this.handleReplace();
    }
  }

  private handleCloseButtonClick() {
    if (this.buttonState === "error") {
      this.buttonState = "idle";
      this.actionButton?.classList.remove("none");
      if (this.actionButton) 
        this.actionButton.innerHTML = this.getActionButtonIcon();
      this.closeButton?.classList.add('none');
      this.optimizedTextElement?.remove();
    }else if (this.buttonState === "optimize") {
      // 优化中中断请求
      this.buttonState = 'idle';
      this.aiService?.abort();
    } else {
      this.handleReplace(true);
    }
  }

  private async handleOptimize() {
    if (this.isLoading) return;

    const actionButton = this.actionButton;
    if (!actionButton) return;

    this.isLoading = true;
    actionButton.disabled = true;
    actionButton.innerHTML = this.getLoadingSpinnerIcon();

    try {
      const originalText = this.element.textContent || "";

      // 创建优化文本元素
      const popoverContent =
        this.popoverElement?.querySelector(".popover-content");
      if (!popoverContent) return;

      const optimizedTextElement = document.createElement("div");
      this.optimizedTextElement = optimizedTextElement;
      optimizedTextElement.className = "optimized-wrapper";
      optimizedTextElement.innerHTML = "<p class='optimized-text'></p>";
      popoverContent.insertBefore(optimizedTextElement, actionButton);

      // 获取段落元素用于更新文本
      const textParagraph = optimizedTextElement.querySelector("p");
      if (!textParagraph) return;

      // 使用流式传输获取优化文本
      this.optimizedText = await this.getOptimizedText(
        originalText,
        (chunk: string) => {
          textParagraph.textContent += chunk;
        }
      );

      this.buttonState = "replace";
      actionButton.innerHTML = this.getReplaceButtonIcon();
    } catch (error: any) {
      console.error("Error optimizing text:", error);
      this.isLoading = false;
      this.buttonState = "error";
      if (this.actionButton)
        this.actionButton.classList.add("none");
      if (this.optimizedTextElement) {
        const textParagraph = this.optimizedTextElement.querySelector("p");
        if (textParagraph) textParagraph.textContent = error.message ;
      }
    } finally {
      this.isLoading = false;
      actionButton.disabled = false;
    }
  }

  private handleReplace(setEmpty?: boolean) {
    this.closeButton?.classList.add("none");
    if (this.actionButton)
      this.actionButton.innerHTML = this.getActionButtonIcon();
    this.buttonState = "idle";
    if (this.optimizedTextElement) {
      this.optimizedTextElement.remove();
      this.optimizedTextElement = null;
    }
    
    if (this.optimizedText && !setEmpty) {
      if (this.element.value) {
        this.element.value = this.optimizedText;
      } else {
        this.element.textContent = this.optimizedText;
      }
    }
  }

  private async getOptimizedText(
    originalText: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    // 调用 AIService 的流式 API
    this.aiService = new AIService();
    return this.aiService.optimizeText(originalText, onChunk);
  }

  public close() {
    if (this.popoverElement && this.shadowRoot.contains(this.popoverElement)) {
      this.resizeObserver?.disconnect();
      this.cleanup();
    }
  }

  private cleanup() {
    this.popoverElement = null;
    this.buttonState = "optimize";
    this.optimizedText = "";
    this.isLoading = false;
  }
}
