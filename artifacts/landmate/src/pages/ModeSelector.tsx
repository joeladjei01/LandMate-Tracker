import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext, AppMode, AppLanguage } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { FaFileAlt, FaShieldAlt, FaRoute, FaWpforms, FaArrowRight } from 'react-icons/fa';
import { cn } from '@/lib/utils';

const MODES = [
  { 
    id: 'explain', 
    title: 'Explain My Document', 
    desc: 'Get a plain-language summary, key points, and important dates from any land document.', 
    template: 'Template A', 
    icon: FaFileAlt,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  { 
    id: 'redFlags', 
    title: 'Check for Red Flags', 
    desc: 'Scan your document for fraud risks, missing elements, and suspicious clauses.', 
    template: 'Template B', 
    icon: FaShieldAlt,
    color: 'text-red-600',
    bg: 'bg-red-50'
  },
  { 
    id: 'processGuide', 
    title: 'Guide Me Through a Process', 
    desc: 'Step-by-step guidance, required documents, and fees for GLC procedures.', 
    template: 'Template C', 
    icon: FaRoute,
    color: 'text-green-600',
    bg: 'bg-green-50'
  },
  { 
    id: 'formHelp', 
    title: 'Help Me Fill a Form', 
    desc: 'Field-by-field instructions, examples, and common mistakes for official forms.', 
    template: 'Template D', 
    icon: FaWpforms,
    color: 'text-orange-600',
    bg: 'bg-orange-50'
  },
];

export default function ModeSelector() {
  const { mode, setMode, language, setLanguage } = useAppContext();
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!mode) return;
    if (mode === 'processGuide') {
      navigate('/process');
    } else {
      navigate('/upload');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col items-center py-12 px-4 container mx-auto max-w-5xl"
    >
      <div className="text-center mb-10 w-full">
        <h2 className="font-display text-4xl font-bold text-primary mb-4">What do you need help with?</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Select a mode below to get specialized AI assistance tailored to your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
        {MODES.map((m) => {
          const isSelected = mode === m.id;
          return (
            <Card 
              key={m.id} 
              onClick={() => setMode(m.id as AppMode)}
              className={cn(
                "cursor-pointer transition-all duration-300 border-2 overflow-hidden group",
                isSelected 
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-2 ring-primary/20 ring-offset-2" 
                  : "border-border hover:border-primary/50 hover:shadow-lg"
              )}
            >
              <CardContent className="p-6 flex items-start gap-4">
                <div className={cn("p-4 rounded-xl shrink-0 transition-colors", isSelected ? "bg-primary text-primary-foreground" : m.bg + " " + m.color)}>
                  <m.icon className="text-2xl" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{m.title}</h3>
                    <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-1 rounded-md border">
                      {m.template}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{m.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-sm mb-8">
        <label className="block text-sm font-semibold text-foreground mb-3">
          Preferred Language
        </label>
        <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
          <SelectTrigger className="w-full h-12 text-base">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">🇬🇧 English</SelectItem>
            <SelectItem value="twi">🇬🇭 Twi (Akan)</SelectItem>
            <SelectItem value="pidgin">🗣️ Pidgin English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        size="lg" 
        onClick={handleContinue} 
        disabled={!mode}
        className="w-full max-w-md h-14 text-lg rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        Continue
        <FaArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
      </Button>
    </motion.div>
  );
}
