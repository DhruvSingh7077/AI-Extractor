import './globals.css'

export const metadata = {
  title: 'AIChatbot — Django + LangChain + pgvector',
  description: 'RAG-powered AI chatbot built with Django, LangChain, LangGraph and pgvector',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
