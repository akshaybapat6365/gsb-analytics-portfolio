import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./radar-theme.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider slug="ord-lga-price-war">
      <div className="radar-page">{children}</div>
    </ThemeProvider>
  );
}
