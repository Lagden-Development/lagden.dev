import "./globals.css";
import Layout from "./components/Layout";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fortawesome/fontawesome-free/css/all.min.css";
import GoogleAnalytics from "./components/GoogleAnalytics";

export const metadata = {
  charset: "UTF-8",
  title: "lagden.dev",
  description: "A small development group passionate about open-source.",
  keywords: "lagden, development, open-source, dev",
  robots: "index, follow",
  httpEquiv: {
    "content-type": "text/html; charset=utf-8",
  },
  language: "English",
  revisitAfter: "7 days",
  author: "Lagden Development",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://lagden.dev/",
    title: "lagden.dev",
    description: "A small development group passionate about open-source.",
    images: [
      {
        url: "https://i.lagden.dev/logo.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    url: "https://lagden.dev/",
    title: "lagden.dev",
    description: "A small development group passionate about open-source.",
    images: [
      {
        url: "https://i.lagden.dev/logo.png",
      },
    ],
  },
};

export const generateViewport = () => {
  return {
    themeColor: "#FFFFFF",
    viewport: "width=device-width, initial-scale=1.0",
  };
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="text-white bg-black">
        <GoogleAnalytics />
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
