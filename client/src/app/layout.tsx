import type { Metadata } from "next";
import "../styles/globals.css";
import { Roboto } from 'next/font/google';
import { MemoryLaneProvider } from '@/core/context/memory-provider';
import { AuthProvider } from "@/core/context/auth-provider";
import { Toaster } from 'react-hot-toast';
import { toastConfig } from '@/core/config/toast';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <AuthProvider>
          <MemoryLaneProvider>
            {children}
            <Toaster {...toastConfig} />
          </MemoryLaneProvider>
        </AuthProvider>
      </body>
    </html>
  );
}