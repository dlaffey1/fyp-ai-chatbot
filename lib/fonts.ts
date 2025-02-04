import localFont from 'next/font/local';

// Load Inter from local files
export const fontSans = localFont({
  src: [
    {
      path: '/fonts/Inter-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '/fonts/Inter-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: ["sans-serif"],
});

// Load JetBrains Mono from Google Fonts (or do the same local process)
export const fontMono = localFont({
  src: [
    {
      path: '/fonts/JetBrainsMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '/fonts/JetBrainsMono-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: "--font-mono",
  display: "swap",
  fallback: ["monospace"],
});
