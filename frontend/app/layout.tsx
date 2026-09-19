import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/providers/auth-provider";
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
  title: "GyannPortal — Smart School Management System | स्मार्ट विद्यालय, सरल व्यवस्थापन",
  description:
    "GyannPortal is a complete school management platform connecting administrators, teachers, students, and parents. Manage attendance, fees, exams, timetables, and more — all in one place.",
  keywords: [
    "school management system",
    "school management software",
    "school ERP",
    "education platform",
    "student management",
    "school software Nepal",
    "gyanportal",
    "स्मार्ट विद्यालय",
    "विद्यालय व्यवस्थापन",
  ],
  openGraph: {
    title: "GyannPortal — Smart School Management System",
    description:
      "One platform to manage your entire school. Manage attendance, fees, exams, timetables, and more.",
    url: "https://gyannportal.com",
    siteName: "GyannPortal",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GyannPortal — Smart School Management System",
    description:
      "One platform to manage your entire school.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}