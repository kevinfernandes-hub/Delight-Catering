import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Delight Caterers | We Craft Memories",
  description: "Premium catering for weddings, corporate events & exclusive celebrations in Nagpur.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${dmSans.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function checkAndReload(err) {
                  var str = String((err && (err.message || err.reason || (err.reason && err.reason.message) || err)) || '');
                  if (str.indexOf('ChunkLoadError') !== -1 || str.indexOf('Failed to load chunk') !== -1 || str.indexOf('Loading chunk') !== -1) {
                    var lastReload = sessionStorage.getItem('chunk_reload');
                    var now = Date.now();
                    if (!lastReload || now - parseInt(lastReload, 10) > 3000) {
                      sessionStorage.setItem('chunk_reload', now.toString());
                      if ('caches' in window) {
                        caches.keys().then(function(keys) {
                          keys.forEach(function(key) { caches.delete(key); });
                        });
                      }
                      window.location.reload();
                    }
                  }
                }
                window.addEventListener('error', function(e) {
                  checkAndReload(e);
                }, true);
                window.addEventListener('unhandledrejection', function(e) {
                  checkAndReload(e);
                }, true);
              })();
            `
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
