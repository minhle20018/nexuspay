import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexusPay - Web3 Fintech Wallet",
  description: "Smart Web3 wallet with institutional-grade MPC security.",
  icons: {
    icon: "/favicon.png", // Tự động nhận diện file favicon.png trong thư mục public
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}