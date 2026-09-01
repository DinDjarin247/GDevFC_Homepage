import type { Metadata, Viewport } from 'next';
import site from '@/data/site.json';
import AuthProvider from '@/components/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: site.meta.siteName,
  description: site.meta.description,
};

export const viewport: Viewport = {
  themeColor: '#0b0b0b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* 한글 픽셀 폰트 — Press Start 2P 에 없는 한글 글리프를 담당 */}
        <link
          href="https://cdn.jsdelivr.net/npm/galmuri/dist/galmuri.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
