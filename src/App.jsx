import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import toast, { Toaster } from 'react-hot-toast'
import './styles/App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <header className="App-header">
            <h1>Travel Lounge Admin Panel</h1>
            <p>Welcome to the admin panel</p>
          </header>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App