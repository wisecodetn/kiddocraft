import { Baloo_Bhaijaan_2, Fredoka, Nunito } from "next/font/google";

// Rounded faces that echo the bubbly KiddoCraft wordmark.
const fredoka = Fredoka({ subsets: ["latin", "latin-ext"], variable: "--font-fredoka", display: "swap" });
const nunito = Nunito({ subsets: ["latin", "latin-ext"], variable: "--font-nunito", display: "swap" });
// Arabic: only preloaded on Arabic pages (see layout), but available everywhere for mixed text.
const baloo = Baloo_Bhaijaan_2({ subsets: ["arabic", "latin"], variable: "--font-baloo", display: "swap", preload: false });

export const fontVariables = [fredoka.variable, nunito.variable, baloo.variable].join(" ");
