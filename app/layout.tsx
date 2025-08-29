import "./globals.css";
import { WhopIframeSdkProvider } from "@whop/react";

export const metadata = { title: "CopyCat AI", description: "All-in-one AI copywriter" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-black">
      <body className="bg-black text-white">
        <WhopIframeSdkProvider>
          {children}
        </WhopIframeSdkProvider>
      </body>
    </html>
  );
}