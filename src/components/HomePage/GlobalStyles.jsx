export default function GlobalStyles() {
  return (
    <style jsx global>{`
      @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");

      * {
        font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
      }

      @keyframes float {
        0%,
        100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
    `}</style>
  );
}
