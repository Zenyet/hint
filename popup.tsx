import { useState, useEffect } from "react"
import "./style.css"

function IndexPopup() {
  const [apiKey, setApiKey] = useState("")
  const [modelUrl, setModelUrl] = useState("")
  const [modelName, setModelName] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [notification, setNotification] = useState<{
    message: string
    type: "success" | "error"
  } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const result = await chrome.storage.sync.get([
      "api_key",
      "model_base_url",
      "model_name",
      "custom_prompt"
    ])

    if (result.api_key) setApiKey(result.api_key)
    if (result.model_base_url) setModelUrl(result.model_base_url)
    if (result.model_name) setModelName(result.model_name)
    if (result.custom_prompt) setCustomPrompt(result.custom_prompt)
  }

  const saveSettings = async () => {
    const trimmedApiKey = apiKey.trim()
    const trimmedModelUrl = modelUrl.trim()
    const trimmedModelName = modelName.trim()

    if (!trimmedApiKey) {
      showNotification("请输入有效的 API Key", "error")
      return
    }

    try {
      await chrome.storage.sync.set({
        api_key: trimmedApiKey,
        model_base_url: trimmedModelUrl,
        model_name: trimmedModelName,
        custom_prompt: customPrompt
      })
      showNotification("设置已保存", "success")
    } catch (error: any) {
      showNotification(`保存失败：${error.message}`, "error")
    }
  }

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  return (
    <div className="w-[400px] p-6 bg-white dark:bg-gray-900">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Hint 设置
        </h1>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="请输入 API Key"
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              {showPassword ? (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            模型接口地址
          </label>
          <input
            type="text"
            value={modelUrl}
            onChange={(e) => setModelUrl(e.target.value)}
            placeholder="可选, 默认 deepseek"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            模型名称
          </label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="可选, 默认 deepseek-chat"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            自定义提示词
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="可选, 留空使用默认提示词"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          />
        </div>

        <button
          onClick={saveSettings}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          保存
        </button>

        {notification && (
          <div
            className={`mt-4 p-3 rounded-md text-sm ${
              notification.type === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}>
            {notification.message}
          </div>
        )}
      </div>
    </div>
  )
}

export default IndexPopup
