import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { DialogProvider } from './contexts/DialogContext'
import ErrorBoundary from './components/ErrorBoundary'
import { theme } from './config/theme'
import { router } from './config/router'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <DialogProvider>
            <RouterProvider router={router} />
            <Toaster position="top-right" />
          </DialogProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App