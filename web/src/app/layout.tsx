import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-geist-sans'
});

export const metadata: Metadata = {
    title: 'Canvas Toolkit - Quiz Assistant',
    description: 'AI-powered Canvas quiz assistant',
    icons: {
        icon: '/favicon.ico'
    }
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable}`}>
            <body className={inter.className}>
                <Navbar></Navbar>
                <main className="pt-18 sm:pt-20">{children}</main>
            </body>
        </html>
    );
}
