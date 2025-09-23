import { createContext, useState, useEffect, useContext } from "react";

const ThemeContext = createContext<{
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  darkMode: false,
  setDarkMode: () => {},
});

import type { ReactNode } from "react";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : false;
  });
  const [isThemeChanging, setIsThemeChanging] = useState(false);

  useEffect(() => {
    setIsThemeChanging(true);
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    if (isThemeChanging) {
      const timer = setTimeout(() => setIsThemeChanging(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isThemeChanging]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {/* apply custom css to avoid flickering of child */}
      <div className={isThemeChanging ? "no-transitions" : ""}>{children}</div>
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDarkMode = () => useContext(ThemeContext);
