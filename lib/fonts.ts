import { Inter, JetBrains_Mono } from "next/font/google";

// ✅ Load Inter font from Google Fonts
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["sans-serif"],
});

// ✅ Load JetBrains Mono font from Google Fonts
export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  fallback: ["monospace"],
});
// import path from "path";
// import fs from "fs";
// import localFont from "next/font/local";

// // Debugging: Print absolute path
// const interRegularPath = path.join(process.cwd(), "public/fonts/Inter-Regular.woff2");
// const interBoldPath = path.join(process.cwd(), "public/fonts/Inter-Bold.woff2");

// console.log("🔍 Checking Font Paths:");
// console.log("Inter-Regular Path:", interRegularPath);
// console.log("Inter-Bold Path:", interBoldPath);

// // Verify if the files exist
// if (!fs.existsSync(interRegularPath)) {
//   console.error("❌ ERROR: Inter-Regular.woff2 not found at", interRegularPath);
// } else {
//   console.log("✅ Inter-Regular.woff2 found at", interRegularPath);
// }

// if (!fs.existsSync(interBoldPath)) {
//   console.error("❌ ERROR: Inter-Bold.woff2 not found at", interBoldPath);
// } else {
//   console.log("✅ Inter-Bold.woff2 found at", interBoldPath);
// }

// // Load Inter from local files
// export const fontSans = localFont({
//   src: [
//     {
//       path: "fonts/Inter-Regular.woff2",
//       weight: "400",
//       style: "normal",
//     },
//     {
//       path: "fonts/Inter-Bold.woff2",
//       weight: "700",
//       style: "normal",
//     },
//   ],
//   variable: "--font-sans",
//   display: "swap",
//   fallback: ["sans-serif"],
// });

// export const fontMono = localFont({
//   src: [
//     {
//       path: "fonts/JetBrainsMono-Regular.woff2",
//       weight: "400",
//       style: "normal",
//     },
//     {
//       path: "fonts/JetBrainsMono-Bold.woff2",
//       weight: "700",
//       style: "normal",
//     },
//   ],
//   variable: "--font-mono",
//   display: "swap",
//   fallback: ["monospace"],
// });
