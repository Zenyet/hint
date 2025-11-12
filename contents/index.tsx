import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetShadowHostId } from "plasmo"
import { useEffect, useRef, useState } from "react"
import "./index.css"

export const config: PlasmoCSConfig = {
  matches: [
    "*://*.openai.com/*",
    "*://*.chatgpt.com/*",
    "*://*.claude.ai/*",
    "*://*.yuanbao.tencent.com/*",
    "*://*.gemini.google.com/*",
    "*://*.chat.deepseek.com/*",
    "*://*.grok.com/*"
  ]
}

// 使用 Shadow DOM 隔离样式
export const getShadowHostId = () => "hint-popover-shadow-host"

// 将 UI 注入到 body，使用固定定位
export const getInlineAnchor: PlasmoGetInlineAnchor = async () => ({
  element: document.body,
  insertPosition: "afterbegin"
})

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// AI Service
class AIService {
  private port: chrome.runtime.Port | null = null

  private initializePort() {
    if (!this.port) {
      this.port = chrome.runtime.connect()
    }
    return this.port
  }

  public abort() {
    if (this.port) {
      this.port.postMessage({ type: "ABORT_OPTIMIZATION" })
    }
  }

  public async optimizeText(
    originalText: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let result = ""
      const port = this.initializePort()

      const messageHandler = (response: any) => {
        if (response.error) {
          reject(new Error(response.error))
          return
        }

        if (response.type === "chunk") {
          if (onChunk) {
            onChunk(response.content)
          }
          result += response.content
        } else if (response.type === "done") {
          resolve(result)
          port.onMessage.removeListener(messageHandler)
        }
      }

      port.onMessage.addListener(messageHandler)
      port.postMessage({
        type: "OPTIMIZE_TEXT",
        text: originalText
      })
    })
  }
}

// Popover Component
const Popover = ({
  targetElement,
  visible
}: {
  targetElement: HTMLElement | null
  visible: boolean
}) => {
  const [position, setPosition] = useState({ left: 0, top: 0 })
  const [buttonState, setButtonState] = useState<
    "idle" | "optimize" | "replace" | "error"
  >("idle")
  const [optimizedText, setOptimizedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const aiServiceRef = useRef<AIService | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  useEffect(() => {
    if (!targetElement) return

    const updatePosition = () => {
      const rect = (targetElement.parentElement || targetElement).getBoundingClientRect()
      setPosition({
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY - 15
      })
    }

    updatePosition()

    // Setup resize observer
    resizeObserverRef.current = new ResizeObserver(updatePosition)
    resizeObserverRef.current.observe(targetElement)

    // Setup window resize listener
    const debouncedUpdatePosition = debounce(updatePosition, 100)
    window.addEventListener("resize", debouncedUpdatePosition)

    return () => {
      resizeObserverRef.current?.disconnect()
      window.removeEventListener("resize", debouncedUpdatePosition)
    }
  }, [targetElement])

  const handleActionButtonClick = async () => {
    if (buttonState === "idle") {
      setButtonState("optimize")
      await handleOptimize()
    } else if (buttonState === "replace") {
      handleReplace()
    }
  }

  const handleCloseButtonClick = () => {
    if (buttonState === "error") {
      setButtonState("idle")
      setErrorMessage("")
      setOptimizedText("")
    } else if (buttonState === "optimize") {
      // 中断请求
      setButtonState("idle")
      aiServiceRef.current?.abort()
      setOptimizedText("")
    } else {
      // 取消替换
      handleReplace(true)
    }
  }

  const handleOptimize = async () => {
    if (isLoading || !targetElement) return

    setIsLoading(true)
    setOptimizedText("")

    try {
      const originalText = targetElement.textContent || ""
      aiServiceRef.current = new AIService()

      let tempText = ""
      await aiServiceRef.current.optimizeText(originalText, (chunk: string) => {
        tempText += chunk
        setOptimizedText(tempText)
      })

      setButtonState("replace")
    } catch (error: any) {
      console.error("Error optimizing text:", error)
      setButtonState("error")
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReplace = (cancel?: boolean) => {
    if (!targetElement) return

    if (optimizedText && !cancel) {
      if ("value" in targetElement) {
        ;(targetElement as HTMLInputElement | HTMLTextAreaElement).value =
          optimizedText
      } else {
        targetElement.textContent = optimizedText
      }
    }

    setButtonState("idle")
    setOptimizedText("")
    setErrorMessage("")
  }

  if (!visible || !targetElement) return null

  return (
    <div
      className="fixed z-[9999] transform -translate-y-full"
      style={{ left: `${position.left}px`, top: `${position.top}px` }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
        <div className="flex items-center gap-2">
          {buttonState === "optimize" && optimizedText && (
            <div className="max-w-md max-h-32 overflow-y-auto px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded text-sm text-gray-700 dark:text-gray-300">
              {optimizedText}
            </div>
          )}

          {buttonState === "error" && errorMessage && (
            <div className="max-w-md px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          {buttonState !== "error" && (
            <button
              onClick={handleActionButtonClick}
              disabled={isLoading}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              title={
                buttonState === "idle"
                  ? "优化文本"
                  : buttonState === "replace"
                    ? "替换文本"
                    : "优化中..."
              }>
              {isLoading ? (
                <svg
                  className="w-4 h-4 animate-spin text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
              ) : buttonState === "replace" ? (
                <svg
                  className="w-4 h-4 text-green-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                </svg>
              )}
            </button>
          )}

          {buttonState !== "idle" && (
            <button
              onClick={handleCloseButtonClick}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="关闭">
              <svg
                className="w-4 h-4 text-gray-600 dark:text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Content Script Component
const ContentScript = () => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [popoverVisible, setPopoverVisible] = useState(false)

  useEffect(() => {
    const findEditableElements = () => {
      const element =
        (document.querySelector('[contenteditable="true"]') as HTMLElement) ||
        (document.body.querySelector("textarea") as HTMLElement)

      if (!element) {
        setPopoverVisible(false)
        return
      }

      setTargetElement(element)
      setPopoverVisible(true)
    }

    // Initial check
    if (document.readyState === "complete") {
      findEditableElements()
    } else {
      window.addEventListener("load", findEditableElements)
    }

    // Setup mutation observer
    const observer = new MutationObserver(() => {
      findEditableElements()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["contenteditable"]
    })

    // Setup route change listener
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function (...args) {
      originalPushState.apply(this, args)
      findEditableElements()
    }

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args)
      findEditableElements()
    }

    window.addEventListener("popstate", findEditableElements)

    return () => {
      observer.disconnect()
      window.removeEventListener("load", findEditableElements)
      window.removeEventListener("popstate", findEditableElements)
    }
  }, [])

  return (
    <Popover targetElement={targetElement} visible={popoverVisible} />
  )
}

export default ContentScript
