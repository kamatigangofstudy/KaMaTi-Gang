import { motion } from "motion/react";
import { useTheme } from "@/contexts/ThemeContext";
import { BookOpen } from "lucide-react";

export default function HomeSection({ onExploreNotes, onJoinCommunity }) {
  const { theme, isDark } = useTheme();

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex items-center px-12"
    >
      <div className="flex w-full max-w-7xl mx-auto">
        {/* Left Hero Content */}
        <div className="flex-1 pr-12">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl font-bold mb-4 transition-colors duration-300"
            style={{ color: theme.text }}
          >
            Welcome to KaMaTi Gang
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl mb-8 font-light transition-colors duration-300"
            style={{ color: theme.secondary }}
          >
            IPU Notes Hub • Simplified Resources • Vibrant Community
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex space-x-4"
          >
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: `0 8px 25px ${theme.primary}40`,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={onExploreNotes}
              className="px-8 py-4 rounded-2xl font-medium text-lg transition-all duration-300"
              style={{
                background: theme.button.bg,
                color: theme.button.text,
                boxShadow: `0 4px 15px ${theme.primary}30`,
              }}
            >
              Explore Notes
            </motion.button>

            <motion.button
              whileHover={{
                scale: 1.02,
                backgroundColor: theme.primary,
                color: theme.button.text,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={onJoinCommunity}
              className="px-8 py-4 rounded-2xl font-medium text-lg transition-all duration-300"
              style={{
                border: `2px solid ${theme.primary}`,
                color: theme.primary,
                backgroundColor: "transparent",
              }}
            >
              Join Community
            </motion.button>
          </motion.div>
        </div>

        {/* Right Preview Panel */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex-1 max-w-md"
        >
          <div className="relative">
            {/* Tilted screenshot image from public/screenshots */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, marginTop: 32, flexWrap: 'wrap' }}>
              <img
                src="/screenshots/Screenshot%202025-09-01%20002729.png"
                alt="Screenshot 1"
                style={{
                  transform: 'rotate(-8deg)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  borderRadius: 16,
                  width: '320px',
                  maxWidth: '90%',
                  border: '2px solid #eee',
                }}
              />
              <img
                src="/screenshots/Screenshot%202025-09-01%20003151.png"
                alt="Screenshot 2"
                style={{
                  transform: 'rotate(6deg)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  borderRadius: 16,
                  width: '320px',
                  maxWidth: '90%',
                  border: '2px solid #eee',
                }}
              />
              <img
                src="/screenshots/Screenshot%202025-09-01%20003240.png"
                alt="Screenshot 3"
                style={{
                  transform: 'rotate(-4deg)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  borderRadius: 16,
                  width: '320px',
                  maxWidth: '90%',
                  border: '2px solid #eee',
                }}
              />
              <img
                src="/screenshots/WhatsApp%20Image%202025-09-01%20at%2012.30.01%20AM.jpeg"
                alt="Screenshot 4"
                style={{
                  transform: 'rotate(10deg)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  borderRadius: 16,
                  width: '320px',
                  maxWidth: '90%',
                  border: '2px solid #eee',
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
