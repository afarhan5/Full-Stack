import './globals.css'

export const metadata = {
  title: 'My Next.js App',
  description: 'Built with Next.js and deployed on Vercel',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
