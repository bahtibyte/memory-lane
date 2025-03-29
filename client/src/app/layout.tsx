import type { Metadata } from "next";
import "../styles/globals.css";
import { Roboto } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { toastConfig } from '@/core/config/toast';
import { AppDataProvider } from "@/core/context/app-provider";

const roboto = Roboto({
  weight: '500',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Memory Lane",
  description: "A visual journey through time - view your photos and memories in a beautiful timeline format",
  icons: {
    icon: '/favicon.ico',
  },
  keywords: ["photos", "timeline", "memories", "gallery", "photo journal"],
  authors: [{ name: "Photo Timeline Team" }],
  openGraph: {
    title: "Memory Lane",
    description: "A visual journey through time - view your photos and memories in a beautiful timeline format",
    type: "website",
  },
};

/**
 * The root layout for the memory lane web app. All providers are wrapped around
 * the children components.
 * 
 * @param {*} children 
 * @returns 
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <AppDataProvider>
          {children}
          <Toaster {...toastConfig} />
        </AppDataProvider>
      </body>
    </html>
  );
}