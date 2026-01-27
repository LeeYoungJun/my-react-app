import { useState, useRef, useEffect } from 'react'
import './Claude.css'

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

function Claude() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: '안녕하세요! 저는 당신의 AI 어시스턴트입니다. 궁금한 점이 있으시면 무엇이든 물어보세요. 😊',
      time: '방금 전'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedModel, setSelectedModel] = useState('claude')
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const isApiKeyConfigured = ANTHROPIC_API_KEY && ANTHROPIC_API_KEY !== 'sk-여기에-API-키-입력'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [inputValue])

  const getTimeString = () => {
    const now = new Date()
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
  }

  const callClaude = async (messageHistory) => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: messageHistory.filter(msg => msg.id !== 1).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API 오류: ${response.status}`)
    }

    const data = await response.json()
    return data.content[0].text
  }

  const getSimulatedResponse = (userInput) => {
    const responses = [
      `"${userInput}"에 대해 답변드리겠습니다.\n\n현재 데모 모드로 실행 중입니다.\n\n**API 키 설정 방법:**\n1. https://console.anthropic.com 에서 API 키 발급\n2. .env 파일의 VITE_ANTHROPIC_API_KEY에 키 입력\n3. 개발 서버 재시작`,
      `좋은 질문이네요!\n\n실제 Claude와 대화하려면 Anthropic API 키가 필요합니다.\n\n.env 파일에 API 키를 설정해주세요.`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    setError(null)

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim(),
      time: getTimeString()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputValue('')
    setIsLoading(true)

    try {
      let responseContent

      if (isApiKeyConfigured) {
        responseContent = await callClaude(updatedMessages)
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000))
        responseContent = getSimulatedResponse(userMessage.content)
      }

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: responseContent,
        time: getTimeString()
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      setError(err.message)
      console.error('Claude API 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="ai-chat-container">
      {/* 헤더 */}
      <header className="ai-chat-header">
        <div className="header-left">
          <h1 className="header-title">AI Chat Assistant</h1>
          <p className="header-subtitle">무엇이든 물어보세요. 언제나 도와드릴 준비가 되어 있습니다.</p>
        </div>
        <div className="header-right">
          <label className="model-label" htmlFor="ai-model-select">AI 모델</label>
          <div className="model-select-wrapper">
            <select
              id="ai-model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="model-select"
            >
              <option value="claude">Claude</option>
            </select>
            <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </header>

      {/* 메시지 영역 */}
      <main className="ai-chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message-item ${message.role}`}>
            {message.role === 'assistant' && (
              <div className="ai-avatar">
                <span>AI</span>
              </div>
            )}
            <div className="message-content">
              <p className="message-text">{message.content}</p>
              <span className="message-time">{message.time}</span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message-item assistant">
            <div className="ai-avatar">
              <span>AI</span>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-toast">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* 입력 영역 */}
      <footer className="ai-chat-input">
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              rows={1}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="send-button"
          >
            전송
          </button>
        </form>
      </footer>
    </div>
  )
}

export default Claude
