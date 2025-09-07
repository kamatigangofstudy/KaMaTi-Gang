import { motion } from "motion/react";
import { Mail, MessageCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Footer() {
  const { theme, isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="fixed bottom-0 left-32 right-0 p-6 z-30"
    >
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm rounded-xl px-6 py-4 transition-all duration-300"
        style={{
          background: `${theme.card}CC`,
          backdropFilter: "blur(15px)",
          border: `1px solid ${theme.secondary}20`,
          boxShadow: isDark
            ? `0 4px 20px ${theme.primary}10`
            : `0 4px 20px ${theme.secondary}10`,
        }}
      >
        <div>
          <h4
            className="font-semibold mb-3 transition-colors duration-300"
            style={{ color: theme.text }}
          >
            Reach Us
          </h4>
          <div className="space-y-2">
            <motion.div
              whileHover={{ x: 3 }}
              className="flex items-center space-x-2"
            >
              <Mail size={16} style={{ color: theme.primary }} />
              <a
                href="mailto:kamatigangofstudy@gmail.com"
                className="transition-colors duration-300 hover:underline"
                style={{
                  color: theme.secondary,
                }}
                onMouseEnter={(e) => (e.target.style.color = theme.primary)}
                onMouseLeave={(e) => (e.target.style.color = theme.secondary)}
              >
                kamatigangofstudy@gmail.com
              </a>
            </motion.div>
            <motion.div
              whileHover={{ x: 3 }}
              className="flex items-center space-x-2"
            >
              <MessageCircle size={16} style={{ color: theme.primary }} />
              <a
                href="https://whatsapp.com/channel/0029Vb6RPBA1NCrTsBR2FD1U"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-300 hover:underline"
                style={{
                  color: theme.secondary,
                }}
                onMouseEnter={(e) => (e.target.style.color = theme.primary)}
                onMouseLeave={(e) => (e.target.style.color = theme.secondary)}
              >
                Join WhatsApp Channel
              </a>
            </motion.div>
          </div>
        </div>

        <div>
          <h4
            className="font-semibold mb-3 transition-colors duration-300"
            style={{ color: theme.text }}
          >
            Developer Info
          </h4>
          <div
            className="space-y-1 transition-colors duration-300"
            style={{ color: theme.secondary }}
          >
            <div>
              KaMaTi Gang Developer:{" "}
              <span
                className="font-medium transition-colors duration-300"
                style={{ color: theme.text }}
              >
                Akshat Pal
              </span>
            </div>
            <div>Tech Stack: React, Node.js</div>
            <div>Collab: https://www.linkedin.com/in/akshatpal2007/ </div>
            <div>© 2025 KaMaTi Gang</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
