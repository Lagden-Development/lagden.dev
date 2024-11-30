import React from 'react';
import Navigation from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { GoogleAnalytics } from '@next/third-parties/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://lagden.dev'),
  charset: 'UTF-8',
  title: {
    default: 'lagden.dev',
    template: '%s | lagden.dev',
  },
  description: 'A small development group passionate about open-source.',
  keywords: [
    'lagden',
    'development',
    'open-source',
    'dev',
    'software',
    'web development',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  authors: [{ name: 'Lagden Development' }],
  generator: 'Next.js',
  applicationName: 'Lagden Development',
  referrer: 'origin-when-cross-origin',
  creator: 'Lagden Development',
  publisher: 'Lagden Development',
  category: 'technology',
  verification: {
    google: 'G-JHDS9FXCK2',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://lagden.dev/',
    title: 'lagden.dev',
    description: 'A small development group passionate about open-source.',
    siteName: 'Lagden Development',
    images: [
      {
        url: 'https://i.lagden.dev/logo.png',
        width: 1200,
        height: 630,
        alt: 'Lagden Development Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@lagdendev',
    creator: '@lagdendev',
    title: 'lagden.dev',
    description: 'A small development group passionate about open-source.',
    images: [
      {
        url: 'https://i.lagden.dev/logo.png',
        width: 1200,
        height: 630,
        alt: 'Lagden Development Logo',
      },
    ],
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [{ url: '/icon.ico', type: 'image/png' }],
  },
  other: {
    'revisit-after': '7 days',
    language: 'English',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-black font-sans text-white antialiased"
        suppressHydrationWarning
      >
        <GoogleAnalytics gaId="G-JHDS9FXCK2" />

        <div className="relative min-h-screen bg-black text-white">
          {/* Fixed grid background */}
          <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808025_1px,transparent_1px),linear-gradient(to_bottom,#80808025_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

          <Navigation />

          {/* Main Content */}
          <main className="relative mt-16 flex-grow px-4 py-8">{children}</main>

          <Footer />
        </div>
      </body>
    </html>
  );
}
