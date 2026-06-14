import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Paradigm Oral Health Project Status',
  description: 'National accounts project tracking platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-steel-900 text-steel-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
