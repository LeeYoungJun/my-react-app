import { useState } from 'react'
import HelloWorld from './components/HelloWorld'
import LoginForm from './components/LoginForm'
import Map from './components/Map'
import './App.css'

function App() {
  const [showLogin, setShowLogin] = useState(false)
  const [showMap, setShowMap] = useState(false)

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
        <Map />
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
      </div>
    </div>
  )
}

export default App
