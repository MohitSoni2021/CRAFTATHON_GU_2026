import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/store/ReduxProvider";
import ActionDock from "@/components/ActionDock";

export const metadata: Metadata = {
  title: "LifeDoc - Your Health Documentation",
  description: "Create, organize, and share your medical records",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head></head>
      <body>
        <ReduxProvider>
          {children}
          <ActionDock />
        </ReduxProvider>
      </body>
    </html>
  );
}
