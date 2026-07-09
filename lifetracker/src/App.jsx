import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import './index.css'
import AppLayout from './components/layout/AppLayout'
import { getSettings } from './utils/storage'

function App() {
  useEffect(() => {
    const s = getSettings()
    if (s?.theme === 'light') {
      document.documentElement.classList.add('theme-light')
    } else {
      document.documentElement.classList.remove('theme-light')
    }
  }, [])

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
