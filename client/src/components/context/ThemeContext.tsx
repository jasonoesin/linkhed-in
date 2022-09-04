import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({} as any);

export default function ThemeProvider({ children }: any) {
  const [theme, setTheme] = useState<any>();

  const data = JSON.parse(localStorage?.getItem("theme")!);

  useEffect(() => {
    if (data) {
      setTheme(data);
    } else {
      localStorage.setItem("theme", JSON.stringify("light"));
    }
  }, []);

  const changeTheme = () => {
    localStorage.setItem(
      "theme",
      JSON.stringify(theme === "light" ? "dark" : "light")
    );
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      <div className={theme === "dark" ? "dark app" : "app"}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
