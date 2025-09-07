import { useState, useEffect } from "react";

export function useHomePage() {
  const [activeSection, setActiveSection] = useState("home");
  const [showNotesWindow, setShowNotesWindow] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [showAfterSubmit, setShowAfterSubmit] = useState(false);

  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem("kamati_visited");

    if (!hasVisitedBefore) {
      localStorage.setItem("kamati_visited", "true");
      const timer = setTimeout(() => {
        setShowFeedbackPopup(true);
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearTimeout(timer);
    }
  }, []);

  const handleNavClick = (itemId) => {
    if (itemId === "notes") {
      setShowNotesWindow(true);
      setActiveSection("home");
    } else {
      setActiveSection(itemId);
      setShowNotesWindow(false);
    }
  };

  const handleFeedbackSuccess = () => {
    setShowFeedbackPopup(false);
    setShowAfterSubmit(true);
    setTimeout(() => setShowAfterSubmit(false), 5000);
  };

  return {
    activeSection,
    setActiveSection,
    showNotesWindow,
    setShowNotesWindow,
    showFeedbackPopup,
    setShowFeedbackPopup,
    showAfterSubmit,
    handleNavClick,
    handleFeedbackSuccess,
  };
}
