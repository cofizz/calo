import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { I18nProvider, type Lang } from "./i18n-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calo — Calorie Tracker",
  description: "Track what you eat. Private diary for you and your friends.",
  // Lets it be added to a phone home screen like an app.
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Calo" },
};

export const viewport: Viewport = {
  themeColor: "#0b0f0e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Load the signed-in user's saved language (client localStorage can override).
  const userId = await getUserId();
  let lang: Lang = "en";
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { language: true },
    });
    if (user?.language === "sr") lang = "sr";
  }

  return (
    <html lang={lang} className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <I18nProvider initialLang={lang} loggedIn={!!userId}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
