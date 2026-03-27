import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { 
  AnalyzeDocumentResponse, 
  ProcessGuidanceResponse, 
  FormAssistanceResponse, 
  ChatMessage 
} from '@workspace/api-client-react';

export type AppMode = 'explain' | 'redFlags' | 'processGuide' | 'formHelp' | null;
export type AppLanguage = 'english' | 'twi' | 'pidgin';
export type AppDocumentType = 'indenture' | 'titleDeed' | 'lease' | 'glcForm' | 'unknown';

interface AppState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  documentText: string;
  setDocumentText: (text: string) => void;
  documentType: AppDocumentType;
  setDocumentType: (type: AppDocumentType) => void;
  fileName: string;
  setFileName: (name: string) => void;
  selectedProcess: string | null;
  setSelectedProcess: (process: string | null) => void;
  
  analysisResult: AnalyzeDocumentResponse | null;
  setAnalysisResult: (res: AnalyzeDocumentResponse | null) => void;
  processResult: ProcessGuidanceResponse | null;
  setProcessResult: (res: ProcessGuidanceResponse | null) => void;
  formResult: FormAssistanceResponse | null;
  setFormResult: (res: FormAssistanceResponse | null) => void;
  
  conversationHistory: ChatMessage[];
  setConversationHistory: (history: ChatMessage[]) => void;
  
  clearSession: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>(null);
  const [language, setLanguage] = useState<AppLanguage>('english');
  const [documentText, setDocumentText] = useState('');
  const [documentType, setDocumentType] = useState<AppDocumentType>('unknown');
  const [fileName, setFileName] = useState('');
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  
  const [analysisResult, setAnalysisResult] = useState<AnalyzeDocumentResponse | null>(null);
  const [processResult, setProcessResult] = useState<ProcessGuidanceResponse | null>(null);
  const [formResult, setFormResult] = useState<FormAssistanceResponse | null>(null);
  
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);

  const clearSession = () => {
    setMode(null);
    setDocumentText('');
    setDocumentType('unknown');
    setFileName('');
    setSelectedProcess(null);
    setAnalysisResult(null);
    setProcessResult(null);
    setFormResult(null);
    setConversationHistory([]);
  };

  return (
    <AppContext.Provider value={{
      mode, setMode,
      language, setLanguage,
      documentText, setDocumentText,
      documentType, setDocumentType,
      fileName, setFileName,
      selectedProcess, setSelectedProcess,
      analysisResult, setAnalysisResult,
      processResult, setProcessResult,
      formResult, setFormResult,
      conversationHistory, setConversationHistory,
      clearSession
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}
