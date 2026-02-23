import { ThemeProvider } from "@/components/theme/ThemeProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider slug="ord-lga-price-war">{children}</ThemeProvider>;
}
