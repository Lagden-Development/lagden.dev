// app/layout.js
import "./globals.css";
import Layout from "./components/Layout";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fortawesome/fontawesome-free/css/all.min.css";

export const metadata = {
  charset: "UTF-8",
  themeColor: "#FFFFFF",
  title: "lagden.dev",
  description: "A small development group passionate about open-source.",
  keywords: "lagden, development, open-source, dev",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1.0",
  httpEquiv: {
    "Content-Type": "text/html; charset=utf-8",
  },
  language: "English",
  revisitAfter: "7 days",
  author: "Lagden Development",
  og: {
    type: "website",
    locale: "en_GB",
    url: "https://lagden.dev/",
    title: "lagden.dev",
    description: "A small development group passionate about open-source.",
    image: "https://i.lagden.dev/logo.png",
  },
  twitter: {
    card: "summary_large_image",
    url: "https://lagden.dev/",
    title: "lagden.dev",
    description: "A small development group passionate about open-source.",
    image: "https://i.lagden.dev/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="text-white bg-black">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
