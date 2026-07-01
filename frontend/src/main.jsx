import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global Error Logger for Diagnostics
window.addEventListener('error', (event) => {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '0'
  container.style.width = '100vw'
  container.style.height = '100vh'
  container.style.backgroundColor = 'rgba(220, 38, 38, 0.98)'
  container.style.color = 'white'
  container.style.padding = '32px'
  container.style.zIndex = '999999'
  container.style.fontFamily = 'monospace'
  container.style.overflow = 'auto'
  container.innerHTML = `
    <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">🚨 Erro de Execução (React Crash)</h1>
    <p style="margin-bottom: 8px;"><strong>Mensagem:</strong> ${event.message}</p>
    <p style="margin-bottom: 8px;"><strong>Arquivo:</strong> ${event.filename}:${event.lineno}:${event.colno}</p>
    <p style="margin-top: 16px; font-weight: bold;">Pilha de Execução (Stack Trace):</p>
    <pre style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; white-space: pre-wrap; margin-top: 8px;">${event.error?.stack || 'Nenhuma pilha disponível'}</pre>
    <button onclick="this.parentElement.remove()" style="margin-top: 24px; padding: 8px 16px; background: white; color: #dc2626; border: none; font-weight: bold; border-radius: 8px; cursor: pointer;">Fechar Alerta</button>
  `
  document.body.appendChild(container)
})

window.addEventListener('unhandledrejection', (event) => {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '0'
  container.style.width = '100vw'
  container.style.height = '100vh'
  container.style.backgroundColor = 'rgba(217, 119, 6, 0.98)'
  container.style.color = 'white'
  container.style.padding = '32px'
  container.style.zIndex = '999999'
  container.style.fontFamily = 'monospace'
  container.style.overflow = 'auto'
  container.innerHTML = `
    <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">⚠️ Rejeição de Promise não Tratada</h1>
    <p style="margin-bottom: 8px;"><strong>Motivo:</strong> ${event.reason}</p>
    <p style="margin-top: 16px; font-weight: bold;">Pilha de Execução (Stack Trace):</p>
    <pre style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; white-space: pre-wrap; margin-top: 8px;">${event.reason?.stack || 'Nenhuma pilha disponível'}</pre>
    <button onclick="this.parentElement.remove()" style="margin-top: 24px; padding: 8px 16px; background: white; color: #d97706; border: none; font-weight: bold; border-radius: 8px; cursor: pointer;">Fechar Alerta</button>
  `
  document.body.appendChild(container)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
