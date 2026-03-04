import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CS224N Project Reviews",
  description: "Final project grading for CS224N",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b border-[var(--border)]">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="text-lg font-semibold text-[var(--foreground)] no-underline hover:no-underline"
            >
              CS224N Reviews
            </Link>
            <nav className="flex gap-6 text-sm">
              <Link href="/" className="text-[var(--muted)] no-underline hover:text-[var(--foreground)]">
                Submissions
              </Link>
              <Link href="/submit" className="text-[var(--muted)] no-underline hover:text-[var(--foreground)]">
                Submit Project
              </Link>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
