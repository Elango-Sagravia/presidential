import { Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/ui/navbar/navbar";
import Footer from "@/components/ui/footer/footer";
import AppProvider from "@/context/appContext";
import RedditPixel from "@/components/ui/RedditPixel/REdditPixel";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "Presidential Summary",
//   description: "Stay informed, widen your worldview",
// };

const thumbnail = "/og.png";
const baseUrl = process.env.url;
export async function generateMetadata() {
  const title =
    "Presidential Summary - Stay Informed with Insightful Newsletters";

  const description =
    "Get the latest updates and expert analysis through Presidential Summary newsletters. Stay informed with our trusted news and insights.";

  return {
    metadataBase: new URL(process.env.url),
    title,
    description,
    themeColor: "#4c305f",
    openGraph: {
      title,
      description,
      url: baseUrl,
      images: [
        {
          url: thumbnail,
          secureUrl: thumbnail,
          alt: "Presidential Summary",
        },
      ],
      type: "website",
    },
  };
}
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Presidential Summary",
  alternateName: "presidentialsummary",
  url: "https://www.presidentialsummary.com/",
  logo: "https://www.presidentialsummary.com/logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "(307) 429-0673",
    contactType: "customer service",
    contactOption: "TollFree",
    areaServed: "US",
    availableLanguage: "en",
  },
  sameAs: [
    "https://www.facebook.com/people/Presidential-Summary/61562652791256/",
    "https://www.instagram.com/presidentialsummary/",
    "https://www.linkedin.com/showcase/presidentialsummary/",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning={true} lang="en" className={inter.className}>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
      />
      <head>
        <RedditPixel />
        <Script
          id="schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6840958913821863"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            <Navbar />
            {children}
            <Analytics />
            <SpeedInsights />
            <Footer />
          </AppProvider>
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-3PS7NGG88R" />
    </html>
  );
}
