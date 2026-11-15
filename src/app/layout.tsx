/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/src/mainComponents/header/Header";
import Footer from "@/src/mainComponents/footer/Footer";
import MobileBottomBar from "@/src/mainComponents/header/MobileBottomBar";
import { AuthProvider } from "@/src/mainComponents/auth/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import QueryProvider from "@/src/providers/QueryProvider";
import "swiper/css";
import "swiper/css/pagination";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import NextTopLoader from "nextjs-toploader";
import { CanonicalURL } from "../components/colonical-tag-generator/ColonicalTagGenerator";
import Script from "next/script";

export const metadata: Metadata = {
  // share links (WhatsApp, Facebook, LinkedIn): relative images like /share-image-1200x630.png become
  // full links on whichever site is running (uat.bcrealestatemarket.com or bcrealestatemarket.com)
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_MAIN_URL || "https://bcrealestatemarket.com"),
  applicationName: "BC Real Estate Market",
  title: "BC Homes for Sale & Sold Prices | BC Real Estate Market",
  description:
    "Search MLS® listings in Greater Vancouver and the Fraser Valley. See sold prices, lot lines, flood risk and monthly market reports. Free.",
  keywords:
    "BC Real Estate, British Columbia Real Estate, Condos for Sale BC, Houses for Sale BC, Townhouses for Sale BC, Vancouver Real Estate, Burnaby Real Estate, Surrey Real Estate, Richmond Real Estate, Coquitlam Real Estate, Victoria Real Estate, Kelowna Real Estate, Abbotsford Real Estate, White Rock Real Estate, Nanaimo Real Estate, New Westminster Real Estate, North Vancouver Real Estate, West Vancouver Real Estate, Langley Real Estate, Delta Real Estate, Maple Ridge Real Estate, Chilliwack Real Estate",
  robots: "index, follow",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-48.png", type: "image/png", sizes: "48x48" },
    ],
    apple: [{ url: "/app-icon-180.png", sizes: "180x180" }],
  },
  openGraph: {
    url: "/",
    siteName: "BC Real Estate Market",
    locale: "en_CA",
    type: "website",
    title: "BC Homes for Sale & Sold Prices | BC Real Estate Market",
    description:
      "Search MLS® listings in Greater Vancouver and the Fraser Valley. See sold prices, lot lines, flood risk and monthly market reports. Free.",
    images: [
      {
        url: "/share-image-1200x630.png",
        width: 1200,
        height: 630,
        alt: "BC Real Estate | Homes, Condos & Townhouses for Sale",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BC Homes for Sale & Sold Prices | BC Real Estate Market",
    description:
      "Search MLS® listings in Greater Vancouver and the Fraser Valley. See sold prices, lot lines, flood risk and monthly market reports. Free.",
    images: ["/share-image-1200x630.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@xz/fonts@1/serve/plus-jakarta-display.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Figtree:wght@400;600&display=swap"
        />
        <meta name="google-site-verification" content="_9Vs41vRcW_kQn7Ni2l5uhdxFs8pJm6TMq5DLZaxi5U" />
        <CanonicalURL />
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
        />

        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
             window.dataLayer = window.dataLayer || [];
             function gtag(){dataLayer.push(arguments);}
             gtag('js', new Date());
             gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}', {
                 page_path: window.location.pathname,
                }); `,
          }}
        />
      </head>

      <body
        className={`plusJakartaDisplay antialiased bg-background`}
        suppressHydrationWarning
      >
        <NextTopLoader color="#22558b" height={4} showSpinner={false} />
        <QueryProvider>
          <GoogleOAuthProvider clientId="265527084086-pd2igue5ksbto4srj2du15nj6b7re5ov.apps.googleusercontent.com">
            <AuthProvider>
              <Header />
              {children}
              <Footer />
              <MobileBottomBar />
              {/* AI assistant chat button (files in public/assistant, API in app/api/assistant) */}
              <Script src="/assistant/widget.js" data-app="/assistant/index.html" strategy="lazyOnload" />
              <ToastContainer />
            </AuthProvider>
          </GoogleOAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
