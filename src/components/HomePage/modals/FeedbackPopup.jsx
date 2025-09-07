import { useState } from "react";
import { motion } from "motion/react";
import { X, Star } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function FeedbackPopup({ onClose, onSuccess }) {
  const { theme, isDark } = useTheme();
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        score: rating,
        comment: feedbackComment,
        timestamp: new Date().toISOString(),
      };

      // 👇 Google Apps Script URL
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbx-XFIS3dthNuWIEcm6jmwbna-YnZN8XnobP1msZlL9tThvwZCIWEB1rW70JtxMTKZoiQ/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        onSuccess();
        alert("✅ Feedback submitted successfully!");
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("❌ Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{
        background: isDark ? "rgba(13, 27, 42, 0.7)" : "rgba(78, 52, 46, 0.4)",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="p-8 max-w-md w-full rounded-2xl transition-all duration-300"
        style={{
          background: `${theme.card}F5`,
          backdropFilter: "blur(25px)",
          border: `1px solid ${theme.secondary}40`,
          boxShadow: isDark
            ? `0 20px 60px ${theme.primary}20`
            : `0 20px 60px ${theme.secondary}20`,
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold transition-colors duration-300"
              style={{ color: theme.text }}
            >
              How much do you like the service?
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm mt-1 transition-colors duration-300"
              style={{ color: theme.secondary }}
            >
              We'd love to hear your feedback! ⭐
            </motion.p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-300"
            style={{
              backgroundColor: `${theme.secondary}20`,
            }}
            disabled={isSubmitting}
          >
            <X size={20} style={{ color: theme.secondary }} />
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <label
            className="block font-medium mb-3 transition-colors duration-300"
            style={{ color: theme.text }}
          >
            Rate your experience
          </label>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRating(star)}
                disabled={isSubmitting}
                className="p-1 transition-colors duration-300"
                style={{
                  color:
                    star <= rating ? theme.primary : `${theme.secondary}50`,
                }}
              >
                <Star
                  size={32}
                  fill={star <= rating ? theme.primary : "none"}
                />
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <label
            className="block font-medium mb-2 transition-colors duration-300"
            style={{ color: theme.text }}
          >
            Additional feedback (optional)
          </label>
          <textarea
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
            placeholder="Your suggestions or issues..."
            rows={3}
            disabled={isSubmitting}
            className="w-full rounded-xl px-4 py-3 resize-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50"
            style={{
              background: isDark ? `${theme.background}80` : `${theme.card}80`,
              border: `1px solid ${theme.secondary}40`,
              color: theme.text,
            }}
          />
        </motion.div>

        <motion.button
          whileHover={
            !isSubmitting
              ? {
                  scale: 1.02,
                  boxShadow: `0 8px 25px ${theme.primary}40`,
                }
              : {}
          }
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="w-full px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: theme.button.bg,
            color: theme.button.text,
            boxShadow: `0 4px 15px ${theme.primary}30`,
          }}
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
