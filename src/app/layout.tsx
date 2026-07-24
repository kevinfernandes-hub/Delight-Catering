import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function checkAndReload(msg) {
                  var str = String(msg || '');
                  if (str.indexOf('ChunkLoadError') !== -1 || str.indexOf('Failed to load chunk') !== -1 || str.indexOf('Loading chunk') !== -1) {
                    var lastReload = sessionStorage.getItem('chunk_reload');
                    var now = Date.now();
                    if (!lastReload || now - parseInt(lastReload, 10) > 6000) {
                      sessionStorage.setItem('chunk_reload', now.toString());
                      window.location.reload();
                    }
                  }
                }
                window.addEventListener('error', function(e) {
                  checkAndReload(e && (e.message || (e.error && e.error.message)));
                }, true);
                window.addEventListener('unhandledrejection', function(e) {
                  checkAndReload(e && (e.reason && (e.reason.message || e.reason)));
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
