import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Augustiner Schafkopf Finder',
    description: 'Find the perfect Augustiner location for your Schafkopf round in Munich',
    icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/beer-icon.svg',
    },
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={inter.className}>{children}</body>
        </html>
    )
}