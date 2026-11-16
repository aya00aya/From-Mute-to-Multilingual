import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Polyglot Meet — From Mute to Multilingual",
  description: "Real-time, consent-based voice translation for video meetings.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
