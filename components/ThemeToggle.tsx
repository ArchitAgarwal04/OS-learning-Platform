
import React from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if user has a theme preference in localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-full glass shadow-sm hover:bg-white/30 dark:hover:bg-black/30"
    >
      <div className="relative w-5 h-5 overflow-hidden">
        <Sun className="absolute h-5 w-5 transition-all duration-300 transform" 
          style={{opacity: isDarkMode ? 1 : 0, transform: isDarkMode ? 'rotate(0deg)' : 'rotate(90deg)'}} />
        <Moon className="absolute h-5 w-5 transition-all duration-300 transform" 
          style={{opacity: isDarkMode ? 0 : 1, transform: isDarkMode ? 'rotate(-90deg)' : 'rotate(0deg)'}} />
      </div>
    </Button>
  );
};

export default ThemeToggle;
