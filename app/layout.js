// app/layout.js
import "./globals.css";
import Layout from "./components/Layout";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fortawesome/fontawesome-free/css/all.min.css";

export const metadata = {
  title: "lagden.dev",
  description: "Welcome to Lagden.dev",
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
