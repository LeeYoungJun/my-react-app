import { useState, lazy, Suspense } from 'react'
import HelloWorld from './components/HelloWorld'
import LoginForm from './components/LoginForm'
import Monday from './components/Monday'
import ChatGPT from './components/ChatGPT'
import './App.css'

const Map = lazy(() => import('./components/Map'))

function App() {
  const [showLogin, setShowLogin] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showMonday, setShowMonday] = useState(false)
  const [showChatGPT, setShowChatGPT] = useState(false)

  if (showLogin) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowLogin(false)}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-white rounded-lg shadow-lg text-gray-800 font-medium hover:bg-gray-100"
        >
          ← Back
        </button>
        <LoginForm />
      </>
    )
  }

  if (showMap) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowMap(false)}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-white rounded-lg shadow-lg text-gray-800 font-medium hover:bg-gray-100"
        >
          ← Back
        </button>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">지도 로딩 중...</div>}>
          <Map />
        </Suspense>
      </>
    )
  }

  if (showMonday) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowMonday(false)}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-white rounded-lg shadow-lg text-gray-800 font-medium hover:bg-gray-100"
        >
          ← Back
        </button>
        <Monday />
      </>
    )
  }

  if (showChatGPT) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowChatGPT(false)}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-white rounded-lg shadow-lg text-gray-800 font-medium hover:bg-gray-100"
        >
          ← Back
        </button>
        <ChatGPT />
      </>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8">
      <HelloWorld />
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setShowLogin(true)}
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-lg"
        >
          어서오세요
        </button>
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all text-lg"
        >
          지도 보기
        </button>
        <button
          type="button"
          onClick={() => setShowMonday(true)}
          className="px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-lg shadow-lg hover:from-pink-700 hover:to-rose-700 transition-all text-lg"
        >
          monday.com
        </button>
        <button
          type="button"
          onClick={() => setShowChatGPT(true)}
          className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-700 hover:to-teal-700 transition-all text-lg"
        >
          ChatGPT와 대화하기
        </button>
      </div>
    </div>
  )
}

export default App
