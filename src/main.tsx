import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './i18n'
import './index.css'

// Apply theme from stored user preferences or default to dark
const stored = localStorage.getItem('finance_user')
const theme = stored ? (JSON.parse(stored).theme ?? 'dark') : 'dark'
document.documentElement.classList.toggle('dark', theme === 'dark')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
