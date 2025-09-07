import { motion } from "motion/react";
import { useTheme } from "@/contexts/ThemeContext";

const threads = [];

export default function CommunitySection() {
  const { theme, isDark } = useTheme();

  return (
    <motion.div
      key="community"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen p-12"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl font-bold mb-8 transition-colors duration-300"
          style={{ color: theme.text }}
        >
          Community Discussion
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Discussion Threads */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="p-6 rounded-2xl transition-all duration-300"
            style={{
              background: `${theme.card}CC`,
              backdropFilter: "blur(20px)",
              border: `1px solid ${theme.secondary}30`,
              boxShadow: isDark
                ? `0 8px 32px ${theme.primary}15`
                : `0 8px 32px ${theme.primary}10`,
            }}
          >
            <h3
              className="text-xl font-semibold mb-4 transition-colors duration-300"
              style={{ color: theme.text }}
            >
              Recent Discussions
            </h3>
            <div className="space-y-4">
              {threads.map((thread, index) => (
                <motion.div
                  key={index}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: `0 8px 25px ${theme.primary}20`,
                  }}
                  className="p-4 rounded-xl cursor-pointer transition-all duration-300"
                  style={{
                    background: isDark
                      ? `${theme.card}80`
                      : `${theme.background}80`,
                    border: `1px solid ${theme.secondary}20`,
                  }}
                >
                  <h4
                    className="font-medium mb-2 transition-colors duration-300"
                    style={{ color: theme.text }}
                  >
                    {thread.title}
                  </h4>
                  <div
                    className="flex space-x-4 text-sm transition-colors duration-300"
                    style={{ color: theme.secondary }}
                  >
                    <span>💬 {thread.replies} replies</span>
                    <span>👍 {thread.upvotes} upvotes</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Ask Question */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="p-6 rounded-2xl transition-all duration-300"
            style={{
              background: `${theme.card}CC`,
              backdropFilter: "blur(20px)",
              border: `1px solid ${theme.secondary}30`,
              boxShadow: isDark
                ? `0 8px 32px ${theme.primary}15`
                : `0 8px 32px ${theme.primary}10`,
            }}
          >
            <h3
              className="text-xl font-semibold mb-4 transition-colors duration-300"
              style={{ color: theme.text }}
            >
              Ask a Question
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Question title..."
                className="w-full rounded-xl px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{
                  background: isDark
                    ? `${theme.background}80`
                    : `${theme.card}80`,
                  border: `1px solid ${theme.secondary}40`,
                  color: theme.text,
                  focusRingColor: theme.primary,
                }}
              />
              <textarea
                placeholder="Describe your question in detail..."
                rows={4}
                className="w-full rounded-xl px-4 py-3 resize-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{
                  background: isDark
                    ? `${theme.background}80`
                    : `${theme.card}80`,
                  border: `1px solid ${theme.secondary}40`,
                  color: theme.text,
                  focusRingColor: theme.primary,
                }}
              />
              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: `0 8px 25px ${theme.primary}40`,
                }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-xl font-medium transition-all duration-300"
                style={{
                  background: theme.button.bg,
                  color: theme.button.text,
                  boxShadow: `0 4px 15px ${theme.primary}30`,
                }}
              >
                Post Question
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
