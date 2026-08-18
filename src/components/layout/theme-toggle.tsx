"use client";

import { useTheme } from "@/components/layout/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        type="button"
        variant={theme === "dark" ? "primary" : "secondary"}
        onClick={() => setTheme("dark")}
      >
        Oscuro
      </Button>
      <Button
        type="button"
        variant={theme === "light" ? "primary" : "secondary"}
        onClick={() => setTheme("light")}
      >
        Claro
      </Button>
    </div>
  );
}
