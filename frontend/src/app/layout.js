import './globals.css'
import { AuthProvider } from '@/components/auth/AuthContext'
import { ThemeProvider } from '@/components/theme/ThemeContext'

export const metadata = {
  title: 'StockMaster Pro',
  description: 'Sistema de Controle de Estoque Inteligente',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}