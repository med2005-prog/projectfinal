import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fin Huwa - Lost & Found Platform Morocco",
    template: "%s | Fin Huwa"
  },
  description: "The most trusted community platform for lost and found items in Agadir and across Morocco. Smart matching, secure messaging, and real-time alerts.",
  keywords: ["lost and found morocco", "find lost items agadir", "fin huwa", "lost wallet agadir", "lost keys morocco", "lost phone agadir"],
  authors: [{ name: "Fin Huwa Team" }],
  openGraph: {
    type: "website",
    locale: "ar_MA",
    url: "https://finhuwa.com",
    title: "Fin Huwa - Reconnect with what's yours",
    description: "Smart matching platform for lost and found items in Morocco.",
    siteName: "Fin Huwa",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fin Huwa - Lost & Found",
    description: "The most trusted platform for lost and found items in Morocco.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        inter.variable,
        cairo.variable,
        "bg-background min-h-screen text-foreground font-sans selection:bg-primary/10"
      )}>
        <LayoutClientWrapper clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "setup-client-id"}>
          {children}
        </LayoutClientWrapper>
      </body>
    </html>
  );
}
