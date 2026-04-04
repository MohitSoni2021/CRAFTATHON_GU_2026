import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./globals.css";
import { APP_NAME } from "@/constants";
import { SocketProvider } from "@/context/SocketContext";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Advanced Medication Adherence Monitoring System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className={`${poppins.className} min-h-full flex flex-col antialiased`}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1013424979439-rqq4uvrgp5bve5hah28gq5ava13cb1cn.apps.googleusercontent.com"}>
          <SocketProvider>
            {children}
          </SocketProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
