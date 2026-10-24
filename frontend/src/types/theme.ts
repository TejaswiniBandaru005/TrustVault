import { ThemePalette, ThemePaletteId } from "./trustvault";

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: "cobalt",
    name: "Cobalt Vault",
    tagline: "Zero-Trust Enterprise Blue",
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    accentSoft: "#eaf1fc",
    gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    glow: "rgba(37, 99, 235, 0.35)",
    dotColor: "#3b82f6",
  },
  {
    id: "emerald",
    name: "Emerald Shield",
    tagline: "Cyber Defense Green",
    primary: "#059669",
    primaryHover: "#047857",
    accentSoft: "#ecfdf5",
    gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    glow: "rgba(5, 150, 105, 0.35)",
    dotColor: "#10b981",
  },
  {
    id: "violet",
    name: "Cyber Amethyst",
    tagline: "Quantum Cryptographic Violet",
    primary: "#7c3aed",
    primaryHover: "#6d28d9",
    accentSoft: "#f5f3ff",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
    glow: "rgba(124, 58, 237, 0.35)",
    dotColor: "#8b5cf6",
  },
  {
    id: "amber",
    name: "Amber Obsidian",
    tagline: "High-Clearance Executive Gold",
    primary: "#d97706",
    primaryHover: "#b45309",
    accentSoft: "#fffbeb",
    gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
    glow: "rgba(217, 119, 6, 0.35)",
    dotColor: "#f59e0b",
  },
  {
    id: "crimson",
    name: "Crimson Sentinel",
    tagline: "DEFCON-1 Classified Red",
    primary: "#dc2626",
    primaryHover: "#b91c1c",
    accentSoft: "#fef2f2",
    gradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    glow: "rgba(220, 38, 38, 0.35)",
    dotColor: "#ef4444",
  },
  {
    id: "cyan",
    name: "Electric Cyan",
    tagline: "Neo-Matrix Cyber Cyan",
    primary: "#0891b2",
    primaryHover: "#0e7490",
    accentSoft: "#ecfeff",
    gradient: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
    glow: "rgba(8, 145, 178, 0.35)",
    dotColor: "#06b6d4",
  },
];

export const DEFAULT_PALETTE_ID: ThemePaletteId = "cobalt";

export function getPalette(id?: string): ThemePalette {
  const found = THEME_PALETTES.find((p) => p.id === id);
  return found || THEME_PALETTES[0];
}
