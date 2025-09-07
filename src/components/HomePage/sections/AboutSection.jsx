import { motion } from "motion/react";
import { useTheme } from "@/contexts/ThemeContext";

export default function AboutSection() {
  const { theme, isDark } = useTheme();

  return (
    <motion.div
      key="about"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen p-12 flex items-center"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl font-bold mb-8 transition-colors duration-300"
          style={{ color: theme.text }}
        >
          About KaMaTi Gang
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="p-8 rounded-2xl transition-all duration-300"
          style={{
            background: `${theme.card}CC`,
            backdropFilter: "blur(20px)",
            border: `1px solid ${theme.secondary}30`,
            boxShadow: isDark
              ? `0 8px 32px ${theme.primary}15`
              : `0 8px 32px ${theme.primary}10`,
          }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg leading-relaxed mb-6 transition-colors duration-300"
            style={{ color: theme.secondary }}
          >
            KaMaTi Gang is a dedicated study hub for IPU students, providing
            comprehensive notes, resources, and a vibrant community platform. We
            believe in making education accessible and fostering collaborative
            learning among students.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg leading-relaxed transition-colors duration-300"
            style={{ color: theme.secondary }}
          >
            Join thousands of students who are already part of our community and
            accelerate your academic journey with our carefully curated
            resources and peer support.
          </motion.p>

          {/* Additional feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
          >
            {[
              {
                icon: "📚",
                title: "Quality Notes",
                desc: "Curated study materials",
              },
              { icon: "🤝", title: "Community", desc: "Connect with peers" },
              { icon: "🚀", title: "Growth", desc: "Accelerate learning" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{
                  scale: 1.05,
                  boxShadow: `0 8px 25px ${theme.primary}20`,
                }}
                className="p-4 rounded-xl transition-all duration-300"
                style={{
                  background: isDark
                    ? `${theme.background}60`
                    : `${theme.card}80`,
                  border: `1px solid ${theme.secondary}20`,
                }}
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3
                  className="font-semibold mb-1 transition-colors duration-300"
                  style={{ color: theme.text }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm transition-colors duration-300"
                  style={{ color: theme.secondary }}
                >
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
