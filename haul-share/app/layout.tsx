import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Haul — Shopping Comparison",
  description: "Compare products side by side with Haul.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
