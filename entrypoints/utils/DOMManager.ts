import { Popover } from "../components/Popover";
import style from "../styles/popover";

export class DOMManager {
  private containerElement: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private currentPopover: Popover | null = null;
  private observer: MutationObserver | null = null;

  constructor() {
    this.init();
  }

  private init() {
    this.createShadowContainer();
    this.setupMutationObserver();
    this.setupRouteChangeListener();
    this.findEditableElements();
  }

  private createShadowContainer() {
    this.containerElement = document.createElement("div");
    this.containerElement.id = "text-popover-extension-container";
    Object.assign(this.containerElement.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "0",
      height: "0",
      overflow: "visible",
      zIndex: "99",
    });

    document.body.appendChild(this.containerElement);
    this.shadowRoot = this.containerElement.attachShadow({ mode: "closed" });

    // 加载样式
    const styleElement = document.createElement("style");
    styleElement.textContent = style;
    this.shadowRoot.appendChild(styleElement);
  }

  private setupMutationObserver() {
    this.observer = new MutationObserver(() => {
      console.log("MutationObserver triggered");
      this.findEditableElements();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["contenteditable"],
    });
  }

  private setupRouteChangeListener() {
    console.log("setupRouteChangeListener called");
    // 监听 popstate 事件（浏览器前进/后退按钮触发）
    window.addEventListener("popstate", () => {
      console.log("popstate event triggered");
      this.handleRouteChange();
    });

    // 监听 pushState/replaceState 调用
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      console.log("pushState called");
      originalPushState.apply(this, args);
      window.dispatchEvent(new CustomEvent("wxt:locationchange"));
    };

    history.replaceState = function (...args) {
      console.log("replaceState called");
      originalReplaceState.apply(this, args);
      window.dispatchEvent(new CustomEvent("wxt:locationchange"));
    };

    // 监听自定义的 locationchange 事件
    window.addEventListener("wxt:locationchange", () => {
      console.log("wxt:locationchange event triggered");
      this.handleRouteChange();
    });
  }

  private handleRouteChange() {
    // console.log("handleRouteChange called");
    // // 清理当前的 Popover
    // if (this.currentPopover) {
    //   this.currentPopover.close();
    //   this.currentPopover = null;
    // }
    // // 重新查找可编辑元素
    // this.findEditableElements();
  }

  private findEditableElements() {
    const targetElement = (document.querySelector(
      '[contenteditable="true"]'
    ) || document.body.querySelector('textarea')) as HTMLElement;
    if (!targetElement) {
      this.currentPopover?.idleHide();
      return;
    }
    this.currentPopover?.show();
    if (this.currentPopover) {
      this.currentPopover.updatePosition(targetElement);
      return;
    }
    if (targetElement && this.shadowRoot) {
      this.currentPopover = new Popover(targetElement, this.shadowRoot);
    }
  }

  public cleanup() {
    this.observer?.disconnect();
    if (
      this.containerElement &&
      document.body.contains(this.containerElement)
    ) {
      document.body.removeChild(this.containerElement);
    }
    this.currentPopover = null;
    this.containerElement = null;
    this.shadowRoot = null;
  }
}
