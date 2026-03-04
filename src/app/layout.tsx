import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "./logout-button";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="text-lg font-semibold text-[var(--foreground)] no-underline hover:no-underline"
            >
              CS224N Project Reviews
            </Link>
            {session && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--muted)]">
                  {session.role === "admin" ? "Admin" : session.name}
                </span>
                <LogoutButton />
              </div>
            )}
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
