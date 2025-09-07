import { motion } from "motion/react";
import { Mail, MessageCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ContactSection() {
  const { theme, isDark } = useTheme();

  return (
    <motion.div
      key="contact"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen p-12 flex items-center"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="p-8 rounded-2xl max-w-md transition-all duration-300"
            style={{
              background: `${theme.card}CC`,
              backdropFilter: "blur(20px)",
              border: `1px solid ${theme.secondary}30`,
              boxShadow: isDark
                ? `0 8px 32px ${theme.primary}15`
                : `0 8px 32px ${theme.primary}10`,
            }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl font-bold mb-6 transition-colors duration-300"
              style={{ color: theme.text }}
            >
              Reach Us
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-4"
            >
              <motion.div
                whileHover={{
                  x: 5,
                  backgroundColor: `${theme.primary}10`,
                }}
                className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-300"
              >
                <Mail size={20} style={{ color: theme.primary }} />
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
                whileHover={{
                  x: 5,
                  backgroundColor: `${theme.primary}10`,
                }}
                className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-300"
              >
                <MessageCircle size={20} style={{ color: theme.primary }} />
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
                  WhatsApp Channel
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
