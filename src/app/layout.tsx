import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { ModalProvider } from "@/components/provider/modal-provider";
import { Toaster } from "@/components/ui/toaster";
import SessionProvider from "@/components/SessionProvider";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Provider from "@/components/provider/liveblocks-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "sribIQ | The Smoothest Ai Workspace Experience Ever",
  description:
    "The smart workspace for professionals and students. Write, sketch, collaborate, and use AI-powered tools for seamless productivity.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={inter.className}>

        <GoogleOAuthProvider clientId="310266179044-8a4cc4bcftmo1ke9l80d88idnrua5l80.apps.googleusercontent.com">
          <SessionProvider >
            <ThemeProvider
              attribute="class"
              defaultTheme="white"
              enableSystem
              disableTransitionOnChange
            >
              <Toaster  />
              <Provider>
                {children}
              </Provider>

              <ModalProvider />
            </ThemeProvider>

          </SessionProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
