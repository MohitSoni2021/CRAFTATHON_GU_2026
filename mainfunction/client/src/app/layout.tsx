import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/store/ReduxProvider";
import ActionDock from "@/components/ActionDock";
import MedicationReminderService from "./Components/MedicationReminderService";

export const metadata: Metadata = {
  title: "SwasthyaSaathi - Your Health Documentation",
  description: "Create, organize, and share your medical records",
  icons: {
    icon: '/favicon.ico',
  },
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body className={inter.className}>
        <ReduxProvider>
          {children}
          <ActionDock />
          <MedicationReminderService />
        </ReduxProvider>
      </body>
    </html>
  );
}
