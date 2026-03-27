import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { FaFileAlt, FaSyncAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export function Layout() {
  const { clearSession } = useAppContext();
  const navigate = useNavigate();

  const handleNewSession = () => {
    clearSession();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
              <FaFileAlt className="text-primary-foreground text-xl" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-primary">
              Land<span className="text-secondary">Mate</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleNewSession}
              className="text-primary border-primary/20 hover:bg-primary/5 hidden sm:flex"
            >
              <FaSyncAlt className="mr-2 h-4 w-4" />
              New Session
            </Button>
            <Button 
              size="icon"
              variant="outline" 
              onClick={handleNewSession}
              className="text-primary border-primary/20 hover:bg-primary/5 sm:hidden"
            >
              <FaSyncAlt className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>

      <footer className="border-t border-border/50 py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            LandMate is an AI-powered citizen guide. This is not legal advice. 
            Consult a licensed legal professional for official guidance.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            &copy; {new Date().getFullYear()} Ghana Lands Commission AI Initiative.
          </p>
        </div>
      </footer>
    </div>
  );
}
