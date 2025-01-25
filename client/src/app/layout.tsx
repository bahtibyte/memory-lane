import type { Metadata } from "next";
import "./globals.css";
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Photo Timeline",
  description: "A visual journey through time - view your photos and memories in a beautiful timeline format",
  keywords: ["photos", "timeline", "memories", "gallery", "photo journal"],
  authors: [{ name: "Photo Timeline Team" }],
  openGraph: {
    title: "Photo Timeline",
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
        {children}
      </body>
    </html>
  );
}