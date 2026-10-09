import { Bricolage_Grotesque, Caveat, JetBrains_Mono } from "next/font/google";

// The Desk page's three voices. Loaded here rather than in the root layout so
// only the home page downloads them. All three are variable fonts, so no
// `weight` arrays: listing weights makes next/font ship static instances.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-bricolage",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caveat",
});

export const DESK_FONTS = `${bricolage.variable} ${jetbrains.variable} ${caveat.variable}`;
