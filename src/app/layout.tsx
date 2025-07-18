
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/layout/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Listify',
  description: 'Modern SPA for advertisement listings.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-muted/30">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
            {children}
          </main>
          <footer className="bg-card text-muted-foreground py-6 text-center mt-auto border-t">
            <div className="container mx-auto px-4">
              <p>&copy; {new Date().getFullYear()} Listify. All rights reserved.</p>
              <p className="text-sm">
                Built with Next.js & Tailwind CSS
              </p>
            </div>
          </footer>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
