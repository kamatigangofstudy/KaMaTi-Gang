import { motion } from "motion/react";
import { useTheme } from "@/contexts/ThemeContext";
import { Home, BookOpen, MessageCircle, Info, Mail } from "lucide-react";
import Logo from "@/components/Logo";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "notes", label: "Notes", icon: BookOpen },
  { id: "community", label: "Community", icon: MessageCircle },
  { id: "about", label: "About", icon: Info },
  { id: "contact", label: "Contact", icon: Mail },
];

export default function Sidebar({ activeSection, onNavClick }) {
  const { theme, isDark } = useTheme();

  return (
    <motion.nav
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed left-6 top-6 bottom-6 w-20 rounded-2xl flex flex-col items-center py-6 z-50 transition-all duration-300"
      style={{
        background: isDark
          ? "rgba(30, 41, 59, 0.7)"
          : "rgba(215, 204, 200, 0.3)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${theme.secondary}30`,
        boxShadow: isDark
          ? "0 8px 32px rgba(0, 224, 255, 0.1)"
          : "0 8px 32px rgba(78, 52, 46, 0.1)",
      }}
    >
      <div className="mb-8 text-center transition-colors duration-300">
  {/* Logo removed as requested */}
        <div
          className="font-bold text-sm leading-tight"
          style={{ color: theme.text }}
        >
          KaMaTi
          <br />
          <span
            className="text-xs font-medium"
            style={{ color: theme.primary }}
          >
            Gang
          </span>
        </div>
        <div
          className="text-[10px] mt-1 leading-tight"
          style={{ color: theme.secondary }}
        >
          Your AI & DS
          <br />
          Study Hub
        </div>
      </div>

      <div className="flex flex-col space-y-3 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavClick(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-xl transition-all duration-300 group relative`}
              style={{
                color: isActive ? theme.primary : theme.secondary,
                background: isActive ? `${theme.primary}20` : "transparent",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `${theme.primary}20`,
                    boxShadow: `0 0 20px ${theme.primary}30`,
                  }}
                />
              )}
              <Icon size={20} className="relative z-10" />
              <div
                className="absolute left-full ml-4 px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
                style={{
                  background: `${theme.card}F0`, // 94% opacity
                  backdropFilter: "blur(10px)",
                  boxShadow: `0 4px 12px ${theme.secondary}20`,
                  color: theme.text,
                }}
              >
                {item.label}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
