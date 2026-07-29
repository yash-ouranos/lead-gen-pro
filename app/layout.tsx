import type { Metadata } from"next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from"next/font/google";
import"./globals.css";
import { Providers } from"./providers";
import Link from"next/link";
import LogoutButton from"./components/LogoutButton";

const ibmPlexSans = IBM_Plex_Sans({ 
 subsets: ["latin"],
 weight: ['100','200','300','400','500','600','700'],
 variable:"--font-ibm-sans"
});

const ibmPlexMono = IBM_Plex_Mono({
 subsets: ["latin"],
 weight: ['100','200','300','400','500','600','700'],
 variable:"--font-ibm-mono"
});

export const metadata: Metadata = {
 title:"Lead Gen Pro",
 description:"Advanced lead generation and management",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en">
 <body className={`${ibmPlexSans.className} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
 <Providers>
 {children}
 </Providers>
 </body>
 </html>
 );
}
