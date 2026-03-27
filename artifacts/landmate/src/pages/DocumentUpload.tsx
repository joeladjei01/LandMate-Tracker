import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext, AppDocumentType } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { FaFileUpload, FaPaste, FaArrowRight, FaFileAlt } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';

export default function DocumentUpload() {
  const { documentText, setDocumentText, setDocumentType, setFileName } = useAppContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectType = (text: string): AppDocumentType => {
    const lower = text.toLowerCase();
    if (lower.includes('indenture') || lower.includes('vendor') || lower.includes('purchaser') || lower.includes('conveyance')) return 'indenture';
    if (lower.includes('title deed') || lower.includes('land title registry') || lower.includes('certificate of title')) return 'titleDeed';
    if (lower.includes('lease') || lower.includes('lessor') || lower.includes('lessee') || lower.includes('tenancy')) return 'lease';
    if (lower.includes('form lc') || lower.includes('application form') || lower.includes('lands commission')) return 'glcForm';
    return 'unknown';
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setDocumentText(text);
    setDocumentType(detectType(text));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }
    
    setFileName(file.name);
    
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setDocumentText(text);
        setDocumentType(detectType(text));
        toast({ title: "Text extracted successfully!" });
      };
      reader.readAsText(file);
      return;
    }

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      try {
        toast({ title: "Extracting text from PDF...", description: "Please wait a moment." });
        const formData = new FormData();
        formData.append("file", file);
        const resp = await fetch("/api/landmate/extract-text", { method: "POST", body: formData });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          toast({
            title: "Extraction failed",
            description: (err as { message?: string }).message || "Could not extract text from PDF. Please paste the text manually.",
            variant: "destructive"
          });
          return;
        }
        const data = await resp.json() as { text: string; documentType: string; fileName: string };
        setDocumentText(data.text);
        setDocumentType((data.documentType || "unknown") as AppDocumentType);
        toast({ title: "PDF text extracted!", description: `${data.text.split(/\s+/).length} words found.` });
      } catch {
        toast({ title: "Upload failed", description: "Network error. Please paste the text manually.", variant: "destructive" });
      }
      return;
    }

    toast({
      title: "Unsupported file type",
      description: "Please upload a PDF or plain text file, or paste the text directly.",
      variant: "destructive"
    });
  };

  const handleAnalyze = () => {
    if (!documentText.trim()) {
       toast({
         title: "No content provided",
         description: "Please paste your document text or upload a file first.",
         variant: "destructive"
       });
       return;
    }
    navigate('/processing');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col items-center py-12 px-4 container mx-auto max-w-4xl"
    >
      <div className="text-center mb-8 w-full">
        <h2 className="font-display text-4xl font-bold text-primary mb-3">Provide Your Document</h2>
        <p className="text-muted-foreground text-lg">
          Upload a file or paste the document text below for AI analysis.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          className="col-span-1 border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-card hover:bg-muted/30 hover:border-primary/50 transition-all cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FaFileUpload className="text-2xl text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-1 text-foreground">Upload File</h3>
          <p className="text-sm text-muted-foreground mb-4">PDF, JPG, PNG (Max 10MB)</p>
          <Button variant="outline" className="w-full no-default-hover-elevate pointer-events-none">Select File</Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.jpg,.jpeg,.png,.txt" 
            onChange={handleFileUpload}
          />
        </div>

        <div className="col-span-1 md:col-span-2 relative">
          <div className="absolute top-4 left-4 text-muted-foreground flex items-center gap-2 font-medium">
            <FaPaste /> Paste Text Here
          </div>
          <Textarea 
            className="w-full h-[300px] resize-none pt-12 pb-4 px-4 rounded-2xl border-2 focus-visible:ring-primary focus-visible:border-primary shadow-sm bg-card text-base"
            placeholder="Paste the contents of your land document, indenture, or form here..."
            value={documentText}
            onChange={handleTextChange}
          />
          {documentText.length > 0 && (
             <div className="absolute bottom-4 right-4 text-xs font-mono bg-muted text-muted-foreground px-2 py-1 rounded">
               {documentText.length} chars
             </div>
          )}
        </div>
      </div>

      {documentText && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-secondary/10 border border-secondary/30 rounded-xl p-4 mb-8 flex items-center gap-4"
        >
          <div className="p-3 bg-secondary/20 rounded-lg text-secondary-foreground">
            <FaFileAlt className="text-xl" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Document Type Detected</h4>
            <p className="text-sm text-muted-foreground capitalize font-medium">
              {documentType === 'unknown' ? 'Unclassified Document' : documentType.replace(/([A-Z])/g, ' $1').trim()}
            </p>
          </div>
        </motion.div>
      )}

      <Button 
        size="lg" 
        onClick={handleAnalyze} 
        className="w-full max-w-md h-14 text-lg rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg group"
      >
        Analyze Document
        <FaArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
      </Button>
    </motion.div>
  );
}
