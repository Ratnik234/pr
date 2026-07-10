import { BrowserRouter } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './index.css'
import AppLayout from './components/layout/AppLayout'
import AuthPage from './components/pages/Auth'
import { getSettings, getCurrentUser } from './utils/storage'

function App() {
  const [themeReady, setThemeReady] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check auth
    setUser(getCurrentUser())

    // getSettings є async — чекаємо результату перед рендером лейауту
    getSettings()
      .then(s => {
        if (s?.theme === 'light') {
          document.documentElement.classList.add('theme-light')
        } else {
          document.documentElement.classList.remove('theme-light')
        }
        setThemeReady(true)
      })
      .catch(err => {
        console.error('getSettings error in App.jsx:', err)
        setThemeReady(true) // Prevent WSOD
      })
  }, [])

  if (!themeReady) return null  // DBProvider вже показує spinner; тут просто тримаємо паузу

  if (!user) {
    return <AuthPage onLoginSuccess={() => setUser(getCurrentUser())} />
  }

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
