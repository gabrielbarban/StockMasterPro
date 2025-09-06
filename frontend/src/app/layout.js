import './globals.css'

export const metadata = {
  title: 'StockMaster Pro',
  description: 'Sistema de Controle de Estoque Inteligente',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}