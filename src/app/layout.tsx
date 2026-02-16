import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "70.3 Training | ethanshistoricalgoods",
  description:
    "Ironman 70.3 training dashboard. Track cycling, swimming, and running consistency. Connect Strava to visualize your progress.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen bg-neutral-950 text-white antialiased`}
      >
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-orange-500/15 blur-3xl" />
          <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-orange-600/5 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] bg-[size:24px_24px]" />
        </div>
        <main>{children}</main>
      </body>
    </html>
  );
}
