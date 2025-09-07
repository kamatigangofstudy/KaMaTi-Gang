import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="transition-colors duration-300 ease-in-out">
      <body className="transition-colors duration-300 ease-in-out">
          {/* Top right logo in a circle */}
          <div
            style={{
              position: 'fixed',
              top: 20,
              right: 20,
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              background: 'white',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              overflow: 'hidden',
            }}
          >
            <img
              src="/KaMaTi Gang of Study (2).png"
              alt="Logo"
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
          </div>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>{children}</ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
