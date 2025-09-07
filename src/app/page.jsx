"use client";

import { AnimatePresence } from "motion/react";
import { useHomePage } from "@/hooks/useHomePage";
import { useTheme } from "@/contexts/ThemeContext";

import Background from "@/components/HomePage/Background";
import Sidebar from "@/components/HomePage/Sidebar";
import HomeSection from "@/components/HomePage/sections/HomeSection";
import CommunitySection from "@/components/HomePage/sections/CommunitySection";
import AboutSection from "@/components/HomePage/sections/AboutSection";
import ContactSection from "@/components/HomePage/sections/ContactSection";
import NotesWindow from "@/components/HomePage/modals/NotesWindow";
import FeedbackPopup from "@/components/HomePage/modals/FeedbackPopup";
import AfterSubmitMessage from "@/components/HomePage/modals/AfterSubmitMessage";
import Footer from "@/components/HomePage/Footer";
import GlobalStyles from "@/components/HomePage/GlobalStyles";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Logo from "@/components/Logo";

export default function HomePage() {
  const {
    activeSection,
    setActiveSection,
    showNotesWindow,
    setShowNotesWindow,
    showFeedbackPopup,
    setShowFeedbackPopup,
    showAfterSubmit,
    handleNavClick,
    handleFeedbackSuccess,
  } = useHomePage();

  const { theme } = useTheme();

  const renderSection = () => {
    switch (activeSection) {
      case "community":
        return <CommunitySection />;
      case "about":
        return <AboutSection />;
      case "contact":
        return <ContactSection />;
      case "home":
      default:
        return (
          <HomeSection
            onExploreNotes={() => setShowNotesWindow(true)}
            onJoinCommunity={() => setActiveSection("community")}
          />
        );
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden transition-colors duration-300"
      style={{
        background: theme.background,
      }}
    >
      <GlobalStyles />
      <Background />
        <div className="absolute top-4 left-4 z-20">
          <Logo />
        </div>
      <Sidebar activeSection={activeSection} onNavClick={handleNavClick} />
      <ThemeSwitcher />

      <main className="ml-32 relative z-10">
        <AnimatePresence mode="wait">
          {!showNotesWindow && renderSection()}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showNotesWindow && (
          <NotesWindow onClose={() => setShowNotesWindow(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFeedbackPopup && (
          <FeedbackPopup
            onClose={() => setShowFeedbackPopup(false)}
            onSuccess={handleFeedbackSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAfterSubmit && <AfterSubmitMessage />}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
