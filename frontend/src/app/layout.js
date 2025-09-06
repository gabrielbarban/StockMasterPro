import './globals.css'
import { AuthProvider } from '@/components/auth/AuthContext'

export const metadata = {
  title: 'StockMaster Pro',
  description: 'Sistema de Controle de Estoque Inteligente',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}