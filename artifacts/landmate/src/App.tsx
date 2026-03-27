import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppContextProvider } from "@/context/AppContext";

// Components
import { Layout } from "@/components/layout/Layout";

// Pages
import Home from "@/pages/Home";
import ModeSelector from "@/pages/ModeSelector";
import DocumentUpload from "@/pages/DocumentUpload";
import ProcessSelector from "@/pages/ProcessSelector";
import Processing from "@/pages/Processing";
import Results from "@/pages/Results";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <TooltipProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="mode" element={<ModeSelector />} />
                <Route path="upload" element={<DocumentUpload />} />
                <Route path="process" element={<ProcessSelector />} />
                <Route path="processing" element={<Processing />} />
                <Route path="results" element={<Results />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
        </TooltipProvider>
      </AppContextProvider>
    </QueryClientProvider>
  );
}

export default App;
