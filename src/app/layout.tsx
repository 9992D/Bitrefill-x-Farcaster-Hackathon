
import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Visual Shopping Mini App",
  description: "Farcaster Mini App for visual shopping",
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://your-domain.com/og-image.png", 
      button: {
        title: "Open Visual Shopping",
        action: {
          type: "launch_frame",
          name: "Visual Shopping Mini App"
        }
      }
    }),
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
