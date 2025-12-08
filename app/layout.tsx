import type { Metadata } from "next";
import "./globals.css";
import Head from "next/head";
import Header from "@/src/mainComponents/header/Header";
import Footer from "@/src/mainComponents/footer/Footer";

export const metadata: Metadata = {
  title: "BC Club",
  description: "British Columbia Club",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@xz/fonts@1/serve/plus-jakarta-display.min.css"
        />
      </Head>
      <body className={`plusJakartaDisplay antialiased bg-background`}>
        {/* <MaterialThemeProvider> */}
        <Header />
        {children}
        <Footer />
        {/* </MaterialThemeProvider> */}
      </body>
    </html>
  );
}
