import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ToastProvider } from "@/contexts/toast-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "LiveFire - Fire Prediction System",
  description: "Wildfire prediction and alert system",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen flex flex-col">
              {/* Navbar is included in page.js, not in layout */}
              <main className="flex-grow">{children}</main>
              <footer className="bg-gray-100 text-center py-4 text-gray-600">
                <div className="container mx-auto px-4">
                  © {new Date().getFullYear()} LiveFire Prediction System
                </div>
              </footer>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

