import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import HelloWorld from './components/HelloWorld'
import LoginForm from './components/LoginForm'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [showLogin, setShowLogin] = useState(false)

  if (showLogin) {
    return (
      <>
        <button
          onClick={() => setShowLogin(false)}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-white rounded-lg shadow-lg text-gray-800 font-medium hover:bg-gray-100"
        >
          ← Back
        </button>
        <LoginForm />
      </>
    )
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <HelloWorld />
      <HelloWorld name="Vite" />
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={() => setShowLogin(true)} style={{ marginLeft: '1rem' }}>
          Show Login
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
