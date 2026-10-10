import { Bricolage_Grotesque, Caveat, JetBrains_Mono } from "next/font/google";

// The site's three voices (ADR 0018): Bricolage Grotesque for the page,
// JetBrains Mono for labels and meta, Caveat for the handwritten asides. All
// three are variable fonts, so no `weight` arrays: listing weights makes
// next/font ship static instances instead of the variable face.
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

export const FONT_VARIABLES = `${bricolage.variable} ${jetbrains.variable} ${caveat.variable}`;
