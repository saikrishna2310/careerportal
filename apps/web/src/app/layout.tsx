import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerConnect — Talent, opportunity, growth",
  description: "A modern career platform connecting emerging talent with teams building the future."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
