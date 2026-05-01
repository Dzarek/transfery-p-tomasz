import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import StyledComponentsRegistry from "@/components/StyledComponentsRegistry";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const allowedUID = process.env.ADMIN_ID;
  const isAdmin = session && session.uid === allowedUID;

  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} h-full antialiased app`}
    >
      <AppProvider isAdmin={isAdmin || false}>
        <body className="relative">
          <StyledComponentsRegistry>
            <Toaster
              position="top-center"
              containerStyle={{
                top: 100,
                zIndex: 999999999999,
              }}
            />
            {session && session.uid && <Navbar />}
            {children}
            <Footer />
          </StyledComponentsRegistry>
        </body>
      </AppProvider>
    </html>
  );
}
