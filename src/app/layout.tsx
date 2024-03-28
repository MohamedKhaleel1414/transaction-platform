import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SideList from "@/app/sidelist";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Transaction Platform",
  description: "This project is a task for creating transaction platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{display: "flex", minHeight: "100vh"}}>
        <SideList />
        <div className="w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
