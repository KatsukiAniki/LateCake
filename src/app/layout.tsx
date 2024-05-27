import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./header/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Late Cake",
  description: "A late cake webapp",
  icons:{
    icon: 'cakelogo.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header></Header>
        {children}
        </body>
    </html>
  );
}
