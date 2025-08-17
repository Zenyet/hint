import { StorageService } from "../services/StorageService";

export class Settings {
  private container: HTMLDivElement;
  private apiKeyInput: HTMLInputElement;
  private modelUrlInput: HTMLInputElement;
  private modelNameInput: HTMLInputElement;
  private customPromptInput: HTMLTextAreaElement;
  private saveButton: HTMLButtonElement;

  private passwordToggleIcon: HTMLDivElement;

  constructor() {
    this.container = document.querySelector('.settings-panel') as HTMLDivElement;
    this.apiKeyInput = document.querySelector('.api-key-input') as HTMLInputElement;
    this.modelUrlInput = document.querySelector('.api-url-input') as HTMLInputElement;
    this.modelNameInput = document.querySelector('.model-name-input') as HTMLInputElement;
    this.customPromptInput = document.querySelector('.custom-prompt-input') as HTMLTextAreaElement;
    this.saveButton = document.querySelector('.save-button') as HTMLButtonElement;
    this.passwordToggleIcon = document.querySelector('.password-toggle-icon') as HTMLDivElement;

    if (!this.container || !this.apiKeyInput || !this.modelUrlInput || !this.modelNameInput || !this.customPromptInput || !this.saveButton) {
      throw new Error('无法找到必要的设置面板元素');
    }

    this.initializeEventListeners();
    this.initializePasswordToggle();
    this.loadSavedApiKey();
  }

  private async loadSavedApiKey() {
    const [apiKey, modelBaseUrl, modelName, customPrompt] = await Promise.all([
      StorageService.getApiKey(),
      StorageService.getModelBaseURL(),
      StorageService.getModelName(),
      StorageService.getCustomPrompt()
    ]);
    
    if (apiKey) {
      this.apiKeyInput.value = apiKey;
    }
    if (modelBaseUrl !== null && modelBaseUrl !== undefined) {
      this.modelUrlInput.value = modelBaseUrl;
    }
    if (modelName !== null && modelName !== undefined) {
      this.modelNameInput.value = modelName;
    }
    if (customPrompt !== null && customPrompt !== undefined) {
      this.customPromptInput.value = customPrompt;
    }
  }

  private initializePasswordToggle() {
    if (!this.passwordToggleIcon) return;

    this.passwordToggleIcon.addEventListener('click', () => {
      const type = this.apiKeyInput.type === 'password' ? 'text' : 'password';
      this.apiKeyInput.type = type;
    });
  }

  private initializeEventListeners() {
    this.saveButton.addEventListener('click', async () => {
      const apiKey = this.apiKeyInput.value.trim();
      const modelUrl = this.modelUrlInput.value.trim();
      const modelName = this.modelNameInput.value.trim();
      const customPrompt = this.customPromptInput.value;

      if (!apiKey) {
        alert('请输入有效的 API Key');
        return;
      }

      try {
        await Promise.all([
          StorageService.setApiKey(apiKey),
          StorageService.setModelBaseURL(modelUrl),
          StorageService.setModelName(modelName),
          StorageService.setCustomPrompt(customPrompt)
        ]);
        // 使用更友好的成功提示
        const notification = document.createElement('div');
        notification.className = 'settings-notification settings-notification-success';
        notification.textContent = '设置已保存';
        this.container.appendChild(notification);
        setTimeout(() => this.container.removeChild(notification), 3000);
      } catch (error) {
        console.error('保存 API Key 失败:', error);
        // 显示更具体的错误信息
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        const notification = document.createElement('div');
        notification.className = 'settings-notification settings-notification-error';
        notification.textContent = `保存失败：${errorMessage}`;
        this.container.appendChild(notification);
        setTimeout(() => this.container.removeChild(notification), 3000);
      }
    });
  }

  public getElement(): HTMLDivElement {
    return this.container;
  }
}