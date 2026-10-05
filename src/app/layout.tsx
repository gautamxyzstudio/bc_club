import type { Metadata } from "next";
import "./globals.css";
import Header from "@/src/mainComponents/header/Header";
import Footer from "@/src/mainComponents/footer/Footer";
import { AuthProvider } from "@/src/mainComponents/auth/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import QueryProvider from "@/src/providers/QueryProvider";
import "swiper/css";
import "swiper/css/pagination";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import NextTopLoader from "nextjs-toploader";
import { CanonicalURL } from "../components/colonical-tag-generator/ColonicalTagGenerator";

export const metadata: Metadata = {
  title: "BC Real Estate | Homes, Condos & Townhouses for Sale",
  description:
    "Find condos, townhouses, and houses for sale in British Columbia. Detailed property information, market insights, and expert guidance from BC Real Estate.",
  keywords:
    "BC Real Estate, British Columbia Real Estate, Condos for Sale BC, Houses for Sale BC, Townhouses for Sale BC, Vancouver Real Estate, Burnaby Real Estate, Surrey Real Estate, Richmond Real Estate, Coquitlam Real Estate, Victoria Real Estate, Kelowna Real Estate, Abbotsford Real Estate, White Rock Real Estate, Nanaimo Real Estate, New Westminster Real Estate, North Vancouver Real Estate, West Vancouver Real Estate, Langley Real Estate, Delta Real Estate, Maple Ridge Real Estate, Chilliwack Real Estate",
  robots: "noindex, nofollow",
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
        <CanonicalURL />
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
              <ToastContainer />
            </AuthProvider>
          </GoogleOAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
