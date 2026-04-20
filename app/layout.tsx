import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/authContext";
import { AppProvider as AppProvider2 } from "@/components/context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Transfery Lotniskowe",
  description: "Transfery Lotniskowe",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} h-full antialiased app`}
    >
      <AppProvider>
        <AppProvider2>
          <body className="relative">
            <Toaster
              position="top-center"
              containerStyle={{
                top: 100,
              }}
            />
            {/* <Navbar /> */}
            {children}
            <Footer />
          </body>
        </AppProvider2>
      </AppProvider>
    </html>
  );
}
