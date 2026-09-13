import type { Metadata } from "next";
import { Caveat, Inter } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-context";
import "./globals.css";

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paper Portfolio",
  description: "A notebook-themed personal portfolio",
};

/**
 * Blocking inline script that runs before first paint.
 * Reads the stored theme from localStorage and applies data-theme
 * to <html> synchronously, preventing any dark-mode flash or
 * hydration mismatch.
 */
const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('paper-portfolio-theme');
    if (t === 'chalkboard') {
      document.documentElement.setAttribute('data-theme', 'chalkboard');
    }
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="paper"
      className={`${caveat.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-body)]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
