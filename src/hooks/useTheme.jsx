import { CodeEditorService } from "../services/CodeEdtiorService";
import React, { useEffect, useRef, useState } from "react";
import { THEMES } from "../components/languageConfig";
import { AnimatePresence, motion } from "framer-motion";
import { CircleOff, Cloud, Laptop, Moon, Palette } from "lucide-react";
import useMounted from "./useMounted.jsx";
import "./theme-selector.css"; 

const THEME_ICONS = {
  "vs-dark": <Moon className="icon-small" />,
  monokai: <Laptop className="icon-small" />,
  "solarized-dark": <Cloud className="icon-small" />,
};

function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useMounted();
  const { theme, setTheme } = CodeEditorService();
  const dropdownRef = useRef(null);
  const currentTheme = THEMES.find((t) => t.id === theme);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return null;

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="theme-button"
      >
        <div className="bg-decorator" />

        <Palette className="palette-icon" />

        <span className="theme-label">
          {currentTheme?.label}
        </span>

        {/* color indicator */}
        <div
          className="color-indicator"
          style={{ background: currentTheme?.color }}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="dropdown-menu"
          >
            <div className="dropdown-header">
              <p className="dropdown-title">Select Theme</p>
            </div>

            {THEMES.map((t, index) => (
              <motion.button
                key={t.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`theme-option ${theme === t.id ? "theme-option-active" : ""}`}
                onClick={() => setTheme(t.id)}>
                <div className="option-bg-decorator" />
                <div className={`theme-icon ${theme === t.id ? "theme-icon-active" : ""}`}>
                  {THEME_ICONS[t.id] || <CircleOff className="icon-small" />}
                </div>
                <span className="option-label">
                  {t.label}
                </span>
                <div
                  className="option-color-indicator"
                  style={{ background: t.color }}
                />
                {theme === t.id && (
                  <motion.div
                    className="active-border"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ThemeSelector;