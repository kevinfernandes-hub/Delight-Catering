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
              window.addEventListener('error', function(e) {
                if (e && e.message && (e.message.indexOf('ChunkLoadError') !== -1 || e.message.indexOf('Failed to load chunk') !== -1 || e.message.indexOf('Loading chunk') !== -1)) {
                  var lastReload = sessionStorage.getItem('chunk_reload');
                  var now = Date.now();
                  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
                    sessionStorage.setItem('chunk_reload', now.toString());
                    window.location.reload();
                  }
                }
              }, true);
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
