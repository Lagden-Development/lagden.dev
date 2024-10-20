// app/layout.tsx

import React from 'react';
import Layout from './components/Layout';
import { GoogleAnalytics } from '@next/third-parties/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './globals.css';

export const metadata = {
  charset: 'UTF-8',
  title: 'lagden.dev',
  description: 'A small development group passionate about open-source.',
  keywords: 'lagden, development, open-source, dev',
  robots: 'index, follow',
  httpEquiv: {
    'content-type': 'text/html; charset=utf-8',
  },
  language: 'English',
  revisitAfter: '7 days',
  author: 'Lagden Development',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://lagden.dev/',
    title: 'lagden.dev',
    description: 'A small development group passionate about open-source.',
    images: [
      {
        url: 'https://i.lagden.dev/logo.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    url: 'https://lagden.dev/',
    title: 'lagden.dev',
    description: 'A small development group passionate about open-source.',
    images: [
      {
        url: 'https://i.lagden.dev/logo.png',
      },
    ],
  },
};

export const generateViewport = () => {
  return {
    themeColor: '#FFFFFF',
    viewport: 'width=device-width, initial-scale=1.0',
  };
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-black text-white">
        <GoogleAnalytics gaId="G-JHDS9FXCK2" />
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
