import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AppLayout from './components/layout/AppLayout'

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
