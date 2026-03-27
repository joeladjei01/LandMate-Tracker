import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { useAnalyze, useProcessGuidance, useFormAssistance } from '@/hooks/use-landmate';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileAlt, FaSearch } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';

const MESSAGES = [
  "Reading document clauses...",
  "Analyzing legal terminology...",
  "Checking against GLC standards...",
  "Scanning for potential red flags...",
  "Generating your plain-language report..."
];

export default function Processing() {
  const { 
    mode, language, documentText, documentType, fileName, selectedProcess,
    setAnalysisResult, setProcessResult, setFormResult 
  } = useAppContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [msgIndex, setMsgIndex] = useState(0);

  const analyze = useAnalyze();
  const process = useProcessGuidance();
  const form = useFormAssistance();

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mode) {
      navigate('/');
      return;
    }

    try {
      if (mode === 'explain' || mode === 'redFlags') {
        analyze.mutate({ 
          data: { 
            documentText, 
            documentType, 
            mode, 
            language,
            fileName
          } 
        }, {
          onSuccess: (data) => {
            setAnalysisResult(data);
            navigate('/results');
          },
          onError: handleError
        });
      } else if (mode === 'processGuide' && selectedProcess) {
        process.mutate({ 
          data: { 
            processName: selectedProcess, 
            language 
          } 
        }, {
          onSuccess: (data) => {
            setProcessResult(data);
            navigate('/results');
          },
          onError: handleError
        });
      } else if (mode === 'formHelp') {
        form.mutate({ 
          data: { 
            documentText, 
            documentType, 
            language 
          } 
        }, {
          onSuccess: (data) => {
            setFormResult(data);
            navigate('/results');
          },
          onError: handleError
        });
      }
    } catch (e) {
      handleError(e as Error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleError = (error: any) => {
    toast({
      title: "Analysis Failed",
      description: error?.message || "An unexpected error occurred. Please try again.",
      variant: "destructive"
    });
    navigate(-1); // Go back
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FaSearch className="text-3xl text-primary animate-bounce" />
        </div>
      </div>
      
      <h2 className="font-display text-3xl font-bold text-foreground mb-4">Claude is thinking...</h2>
      
      <div className="h-8 relative overflow-hidden w-full max-w-md text-center">
        <AnimatePresence mode="popLayout">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-muted-foreground text-lg absolute w-full"
          >
            {MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
