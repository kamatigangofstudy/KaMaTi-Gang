import { motion } from "motion/react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Background() {
  const { theme, isDark } = useTheme();

  return (
    <>
      {/* Floating Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-1/4 w-64 h-64 rounded-full transition-all duration-1000"
          style={{
            background: isDark
              ? `radial-gradient(circle, ${theme.primary}30 0%, transparent 70%)`
              : `radial-gradient(circle, ${theme.secondary}40 0%, transparent 70%)`,
            filter: "blur(40px)",
            opacity: isDark ? 0.4 : 0.3,
          }}
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full transition-all duration-1000"
          style={{
            background: isDark
              ? `radial-gradient(circle, ${theme.primary}25 0%, transparent 70%)`
              : `radial-gradient(circle, ${theme.primary}40 0%, transparent 70%)`,
            filter: "blur(40px)",
            opacity: isDark ? 0.3 : 0.25,
          }}
        />
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute bottom-1/4 left-1/2 w-72 h-72 rounded-full transition-all duration-1000"
          style={{
            background: isDark
              ? `radial-gradient(circle, ${theme.primary}20 0%, transparent 70%)`
              : `radial-gradient(circle, ${theme.primary}30 0%, transparent 70%)`,
            filter: "blur(40px)",
            opacity: isDark ? 0.25 : 0.2,
          }}
        />

        {/* Additional dark mode exclusive elements */}
        {isDark && (
          <>
            <motion.div
              animate={{
                x: [0, -120, 0],
                y: [0, 40, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute top-1/3 left-1/6 w-32 h-32 rounded-full transition-all duration-1000"
              style={{
                background: `radial-gradient(circle, ${theme.primary}15 0%, transparent 70%)`,
                filter: "blur(30px)",
                opacity: 0.3,
              }}
            />
            <motion.div
              animate={{
                x: [0, 90, 0],
                y: [0, -70, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3,
              }}
              className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full transition-all duration-1000"
              style={{
                background: `radial-gradient(circle, ${theme.primary}12 0%, transparent 70%)`,
                filter: "blur(35px)",
                opacity: 0.2,
              }}
            />
          </>
        )}
      </div>

      {/* Floating Background Text */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isDark ? 0.06 : 0.04,
            scale: 1,
          }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="text-[18rem] font-black select-none leading-none transition-all duration-1000"
          style={{
            fontFamily: "Inter, sans-serif",
            color: isDark ? theme.primary : theme.text,
            textShadow: isDark ? `0 0 100px ${theme.primary}20` : "none",
          }}
        >
          KaMaTi
        </motion.div>
      </div>

      {/* Grid overlay for dark mode */}
      {isDark && (
        <div
          className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
          style={{
            backgroundImage: `
              linear-gradient(${theme.primary}08 1px, transparent 1px),
              linear-gradient(90deg, ${theme.primary}08 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            opacity: 0.3,
          }}
        />
      )}
    </>
  );
}
