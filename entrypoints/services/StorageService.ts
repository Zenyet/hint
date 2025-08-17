export class StorageService {
  private static readonly API_KEY_STORAGE_KEY = 'api_key';
  private static readonly MODEL_BASE_URL_KEY = 'model_base_url';
  private static readonly MODEL_NAME_KEY = 'model_name';
  private static readonly CUSTOM_PROMPT_KEY = 'custom_prompt';

  public static async getApiKey(): Promise<string | null> {
    const result = await chrome.storage.sync.get(this.API_KEY_STORAGE_KEY);
    return result[this.API_KEY_STORAGE_KEY] || null;
  }

  public static async setApiKey(apiKey: string): Promise<void> {
    await chrome.storage.sync.set({ [this.API_KEY_STORAGE_KEY]: apiKey });
  }

  public static async removeApiKey(): Promise<void> {
    await chrome.storage.sync.remove(this.API_KEY_STORAGE_KEY);
  }

  public static async getModelBaseURL(): Promise<string | null> {
    const result = await chrome.storage.sync.get(this.MODEL_BASE_URL_KEY);
    return result[this.MODEL_BASE_URL_KEY] || null;
  }

  public static async setModelBaseURL(url: string): Promise<void> {
    await chrome.storage.sync.set({ [this.MODEL_BASE_URL_KEY]: url });
  }

  public static async getModelName(): Promise<string | null> {
    const result = await chrome.storage.sync.get(this.MODEL_NAME_KEY);
    return result[this.MODEL_NAME_KEY] || null;
  }

  public static async setModelName(name: string): Promise<void> {
    await chrome.storage.sync.set({ [this.MODEL_NAME_KEY]: name });
  }

  public static async getCustomPrompt(): Promise<string | null> {
    const result = await chrome.storage.sync.get(this.CUSTOM_PROMPT_KEY);
    return result[this.CUSTOM_PROMPT_KEY] || null;
  }

  public static async setCustomPrompt(p: string): Promise<void> {
    await chrome.storage.sync.set({ [this.CUSTOM_PROMPT_KEY]: p });
  }
}