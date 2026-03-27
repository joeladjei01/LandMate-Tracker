import { 
  useAnalyzeDocument, 
  useGetProcessGuidance, 
  useGetFormAssistance, 
  useChatWithLandmate 
} from '@workspace/api-client-react';

// Re-exporting generated hooks to maintain clean component imports
// and provide a centralized data layer for LandMate-specific features.

export function useAnalyze() {
  return useAnalyzeDocument();
}

export function useProcessGuidance() {
  return useGetProcessGuidance();
}

export function useFormAssistance() {
  return useGetFormAssistance();
}

export function useChat() {
  return useChatWithLandmate();
}
