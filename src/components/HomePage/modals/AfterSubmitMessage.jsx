import { motion } from "motion/react";
import { useTheme } from "@/contexts/ThemeContext";

export default function AfterSubmitMessage() {
  const { theme, isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-24 right-6 z-50 max-w-sm"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-6 rounded-2xl transition-all duration-300"
        style={{
          background: `${theme.card}F5`, // 96% opacity
          backdropFilter: "blur(25px)",
          border: `1px solid ${theme.secondary}40`,
          boxShadow: isDark
            ? `0 20px 60px ${theme.primary}20`
            : `0 20px 60px ${theme.secondary}20`,
        }}
      >
        <div className="text-center">
          <motion.h3
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-lg font-semibold mb-2 transition-colors duration-300"
            style={{ color: theme.text }}
          >
            Thanks for your feedback! 🎉
          </motion.h3>
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{
              scale: 1.05,
              boxShadow: `0 8px 25px ${theme.primary}40`,
            }}
            whileTap={{ scale: 0.95 }}
            href="https://whatsapp.com/channel/0029Vb6RPBA1NCrTsBR2FD1U"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
            style={{
              background: "#25D366",
              color: "#FFFFFF",
              boxShadow: "0 4px 15px rgba(37, 211, 102, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#128C7E";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#25D366";
            }}
          >
            Join our WhatsApp Community
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}
