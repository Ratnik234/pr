import { BrowserRouter } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './index.css'
import AppLayout from './components/layout/AppLayout'
import { getSettings } from './utils/storage'

function App() {
  const [themeReady, setThemeReady] = useState(false)

  useEffect(() => {
    // getSettings є async — чекаємо результату перед рендером лейауту
    getSettings().then(s => {
      if (s?.theme === 'light') {
        document.documentElement.classList.add('theme-light')
      } else {
        document.documentElement.classList.remove('theme-light')
      }
      setThemeReady(true)
    })
  }, [])

  if (!themeReady) return null  // DBProvider вже показує spinner; тут просто тримаємо паузу

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
