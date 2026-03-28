import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { useChat } from '@/hooks/use-landmate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { 
  FaExclamationTriangle, FaCheck, FaInfoCircle, FaFileAlt, 
  FaPaperPlane, FaUser, FaRobot, FaCalendarAlt, FaExclamationCircle,
  FaRoute, FaWpforms, FaMicrophone, FaStop
} from 'react-icons/fa';

export default function Results() {
  const { 
    mode, analysisResult, processResult, formResult, 
    documentType, fileName, language, documentText,
    conversationHistory, setConversationHistory
  } = useAppContext();
  const navigate = useNavigate();
  const [chatMessage, setChatMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const chatMutation = useChat();

  const handleMicToggle = useCallback(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser. Please try Chrome or Edge.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    let finalTranscript = chatMessage;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript = (finalTranscript + " " + transcript).trim();
        } else {
          interim = transcript;
        }
      }
      setChatMessage((finalTranscript + (interim ? " " + interim : "")).trim());
    };

    recognition.onend = () => {
      setIsListening(false);
      setChatMessage(finalTranscript.trim());
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [isListening, chatMessage]);

  useEffect(() => {
    if (!mode || (!analysisResult && !processResult && !formResult)) {
      navigate('/');
    }
  }, [mode, analysisResult, processResult, formResult, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    
    const newHistory = [...conversationHistory, { role: 'user' as const, content: chatMessage }];
    setConversationHistory(newHistory);
    setChatMessage('');
    
    chatMutation.mutate({
      data: {
        message: chatMessage,
        conversationHistory: newHistory,
        documentContext: documentText,
        documentType: documentType,
        language: language
      }
    }, {
      onSuccess: (data) => {
         setConversationHistory([...newHistory, { role: 'assistant', content: data.response }]);
      }
    });
  };

  const renderDisclaimer = (text: string) => (
    <div className="mt-8 p-4 bg-muted/50 border rounded-xl flex items-start gap-3 text-sm text-muted-foreground">
      <FaInfoCircle className="mt-0.5 shrink-0 text-primary" />
      <p>{text}</p>
    </div>
  );

  const renderAnalysis = () => {
    if (!analysisResult) return null;
    
    const getRiskColor = (level?: string) => {
      if (level === 'HIGH') return 'text-destructive bg-destructive/10 border-destructive/20';
      if (level === 'MEDIUM') return 'text-amber-600 bg-amber-50 border-amber-200';
      return 'text-green-600 bg-green-50 border-green-200';
    };

    return (
      <div className="w-full max-w-5xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-card border shadow-sm rounded-2xl p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FaFileAlt className="text-2xl text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-foreground">{fileName || "Pasted Document"}</h2>
              <p className="text-muted-foreground text-sm capitalize">{documentType.replace(/([A-Z])/g, ' $1').trim()}</p>
            </div>
          </div>
          {analysisResult.overallRiskLevel && (
            <div className={cn("px-4 py-2 rounded-xl border font-bold flex items-center gap-2", getRiskColor(analysisResult.overallRiskLevel))}>
              {analysisResult.overallRiskLevel === 'HIGH' && <FaExclamationTriangle />}
              {analysisResult.overallRiskLevel} RISK
            </div>
          )}
        </div>

        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-14 bg-muted/50 rounded-xl p-1 mb-6">
            <TabsTrigger value="results" className="rounded-lg font-medium text-base data-[state=active]:bg-card data-[state=active]:shadow-sm">Results</TabsTrigger>
            <TabsTrigger value="flags" className="rounded-lg font-medium text-base data-[state=active]:bg-card data-[state=active]:shadow-sm">Red Flags</TabsTrigger>
            <TabsTrigger value="steps" className="rounded-lg font-medium text-base data-[state=active]:bg-card data-[state=active]:shadow-sm">Next Steps</TabsTrigger>
            <TabsTrigger value="chat" className="rounded-lg font-medium text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">Ask LandMate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="results" className="mt-0 outline-none">
            <div className="grid gap-6">
              <Card className="border-border shadow-sm">
                <CardHeader className="bg-muted/30 border-b pb-4">
                  <CardTitle className="text-xl">Plain Language Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 prose prose-p:leading-relaxed prose-p:text-foreground/80 max-w-none">
                  <p>{analysisResult.summary}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border shadow-sm">
                  <CardHeader className="bg-muted/30 border-b pb-4">
                    <CardTitle className="text-lg flex items-center gap-2"><FaCheck className="text-primary"/> Key Points</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      {analysisResult.keyPoints.map((kp, i) => (
                        <li key={i} className="flex gap-3 text-foreground/80">
                          <span className="font-bold text-primary shrink-0">{i+1}.</span>
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {analysisResult.importantDates && analysisResult.importantDates.length > 0 && (
                  <Card className="border-border shadow-sm">
                    <CardHeader className="bg-muted/30 border-b pb-4">
                      <CardTitle className="text-lg flex items-center gap-2"><FaCalendarAlt className="text-primary"/> Important Dates</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 grid gap-3">
                      {analysisResult.importantDates.map((date, i) => {
                        const isUrgent = date.daysUntil !== null && date.daysUntil !== undefined && date.daysUntil <= 30;
                        return (
                          <div key={i} className={cn("p-4 rounded-xl border flex justify-between items-center", isUrgent ? "border-destructive bg-destructive/5" : "border-border bg-card")}>
                            <div>
                              <p className="font-medium text-foreground">{date.label}</p>
                              {isUrgent && <p className="text-xs text-destructive font-bold mt-1">{date.daysUntil} days remaining</p>}
                            </div>
                            <div className={cn("font-bold font-mono", isUrgent ? "text-destructive" : "text-primary")}>
                              {date.value}
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            {renderDisclaimer(analysisResult.disclaimer)}
          </TabsContent>

          <TabsContent value="flags" className="mt-0 outline-none">
            <Card className="border-border shadow-sm mb-6">
              <CardContent className="p-6">
                <div className="flex gap-8 items-center justify-center py-4">
                  <div className="text-center">
                    <div className="text-4xl font-black text-destructive">{analysisResult.redFlags?.filter(f => f.severity === 'HIGH').length || 0}</div>
                    <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">High Risk</div>
                  </div>
                  <div className="w-px h-12 bg-border"></div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-amber-500">{analysisResult.redFlags?.filter(f => f.severity === 'MEDIUM').length || 0}</div>
                    <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Medium Risk</div>
                  </div>
                  <div className="w-px h-12 bg-border"></div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-green-500">{analysisResult.redFlags?.filter(f => f.severity === 'LOW').length || 0}</div>
                    <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Low Risk</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {analysisResult.redFlags?.map((flag, i) => (
                <Card key={i} className={cn("border-l-4 shadow-sm", 
                  flag.severity === 'HIGH' ? "border-l-destructive" : 
                  flag.severity === 'MEDIUM' ? "border-l-amber-500" : "border-l-green-500"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {flag.severity === 'HIGH' ? <FaExclamationTriangle className="text-destructive"/> : <FaExclamationCircle className={flag.severity === 'MEDIUM' ? "text-amber-500" : "text-green-500"}/>}
                        {flag.issue}
                      </CardTitle>
                      <span className={cn("text-xs font-bold px-2 py-1 rounded", getRiskColor(flag.severity))}>
                        {flag.severity}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-foreground/80">{flag.explanation}</p>
                    <div className="bg-muted p-3 rounded-lg border text-sm">
                      <span className="font-bold text-foreground">Recommendation: </span>
                      <span className="text-muted-foreground">{flag.recommendation}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!analysisResult.redFlags || analysisResult.redFlags.length === 0) && (
                <div className="text-center py-12 bg-muted/30 border rounded-xl">
                  <FaCheck className="text-4xl text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold">No Red Flags Detected</h3>
                  <p className="text-muted-foreground mt-2">The document appears to follow standard conventions.</p>
                </div>
              )}
            </div>
            {renderDisclaimer(analysisResult.disclaimer)}
          </TabsContent>

          <TabsContent value="steps" className="mt-0 outline-none">
            <Card className="border-border shadow-sm">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <CardTitle className="text-xl">Recommended Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="pt-8 pb-8 px-8">
                <div className="relative border-l-2 border-primary/20 ml-4 space-y-8">
                  {analysisResult.nextSteps.map((step, i) => (
                    <div key={i} className="relative pl-8">
                      <div className="absolute w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold -left-[17px] -top-1 shadow-md ring-4 ring-card">
                        {i + 1}
                      </div>
                      <p className="text-lg text-foreground/90 font-medium pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {renderDisclaimer(analysisResult.disclaimer)}
          </TabsContent>

          <TabsContent value="chat" className="mt-0 outline-none flex flex-col h-[600px] border rounded-2xl bg-card shadow-sm overflow-hidden">
            <div className="bg-muted p-3 border-b shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">L</div>
                <div>
                  <p className="text-sm font-bold leading-none">LandMate Assistant</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Context: {fileName || "Document"}</p>
                </div>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-6 max-w-3xl mx-auto pb-4">
                <div className="flex justify-start">
                  <div className="bg-muted/50 border rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                    <p className="text-sm text-foreground">Hello! I've analyzed your document. What specific questions do you have about it?</p>
                  </div>
                </div>

                {conversationHistory.map((msg, i) => (
                  <div key={i} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "p-4 max-w-[85%] shadow-sm",
                      msg.role === 'user' 
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none" 
                        : "bg-card border border-border rounded-2xl rounded-tl-none"
                    )}>
                      <div className="flex items-center gap-2 mb-2 opacity-80">
                        {msg.role === 'user' ? <FaUser className="text-xs" /> : <FaRobot className="text-xs text-secondary" />}
                        <span className="text-xs font-bold">{msg.role === 'user' ? 'You' : 'LandMate'}</span>
                      </div>
                      {msg.role === 'user' ? (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      ) : (
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => <h1 className="text-lg font-bold text-foreground mt-4 mb-2 first:mt-0">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold text-foreground mt-4 mb-2 first:mt-0">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold text-foreground mt-3 mb-1.5 pb-1 border-b border-border/50 first:mt-0">{children}</h3>,
                            p: ({ children }) => <p className="text-sm text-foreground/90 leading-relaxed my-1.5 first:mt-0 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                            ul: ({ children }) => <ul className="my-2 space-y-1 pl-4 list-disc">{children}</ul>,
                            ol: ({ children }) => <ol className="my-2 space-y-1 pl-4 list-decimal">{children}</ol>,
                            li: ({ children }) => <li className="text-sm text-foreground/85 leading-relaxed">{children}</li>,
                            hr: () => <hr className="my-3 border-border/40" />,
                            code: ({ children }) => <code className="text-primary bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                ))}
                
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border rounded-2xl rounded-tl-none p-4 w-24">
                      <div className="flex justify-center gap-1">
                        <motion.div className="w-2 h-2 rounded-full bg-primary/40" animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                        <motion.div className="w-2 h-2 rounded-full bg-primary/60" animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                        <motion.div className="w-2 h-2 rounded-full bg-primary" animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 bg-muted/30 border-t shrink-0">
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 mb-2 max-w-3xl mx-auto"
                >
                  <div className="flex items-center gap-1.5">
                    {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
                      <motion.div
                        key={i}
                        className="w-1 rounded-full bg-destructive"
                        animate={{ height: ["8px", "20px", "8px"] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-destructive">Listening… speak your question</span>
                </motion.div>
              )}
              <div className="flex gap-2 max-w-3xl mx-auto">
                <Input 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                  placeholder={isListening ? "Listening…" : "Ask a question about your document…"}
                  className={cn(
                    "flex-1 h-12 rounded-xl bg-card border-2 transition-all",
                    isListening && "border-destructive/60 bg-destructive/5"
                  )}
                  maxLength={500}
                  readOnly={isListening}
                />
                <Button
                  size="icon"
                  type="button"
                  onClick={handleMicToggle}
                  className={cn(
                    "h-12 w-12 rounded-xl shadow-md transition-all",
                    isListening
                      ? "bg-destructive hover:bg-destructive/90 text-white"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground border border-border"
                  )}
                  title={isListening ? "Stop recording" : "Record voice question"}
                >
                  {isListening ? (
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                      <FaStop className="text-sm" />
                    </motion.div>
                  ) : (
                    <FaMicrophone className="text-sm" />
                  )}
                </Button>
                <Button 
                  size="icon" 
                  onClick={handleSendChat}
                  disabled={!chatMessage.trim() || chatMutation.isPending}
                  className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                >
                  <FaPaperPlane />
                </Button>
              </div>
              <div className="flex justify-between max-w-3xl mx-auto mt-1">
                <span className="text-xs text-muted-foreground">🎤 Tap mic to speak, or type your question</span>
                <span className="text-xs text-muted-foreground">{chatMessage.length}/500</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderProcess = () => {
    if (!processResult) return null;
    return (
      <div className="w-full max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-primary mb-4">{processResult.processName}</h1>
          <div className="flex justify-center gap-4 flex-wrap">
            <span className="px-3 py-1 bg-muted rounded-md text-sm border font-medium">⏳ {processResult.estimatedDuration}</span>
            <span className="px-3 py-1 bg-muted rounded-md text-sm border font-medium">💰 {processResult.estimatedFees}</span>
          </div>
        </div>

        <Card className="mb-8 border-primary/20 shadow-md overflow-hidden">
          <div className="bg-primary px-6 py-3">
            <h3 className="text-primary-foreground font-bold text-lg flex items-center gap-2"><FaRoute /> Step-by-Step Guide</h3>
          </div>
          <CardContent className="p-0">
            <div className="divide-y">
              {processResult.steps.map((step, i) => (
                <div key={i} className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 hover:bg-muted/20 transition-colors">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-display font-bold text-xl">
                      {step.stepNumber}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-foreground mb-2">{step.title}</h4>
                    <p className="text-foreground/80 leading-relaxed mb-4">{step.description}</p>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {step.office && (
                        <div className="bg-muted/50 p-3 rounded-lg border text-sm">
                          <span className="font-bold block text-muted-foreground mb-1 text-xs uppercase tracking-wider">Office</span>
                          <span className="font-medium">{step.office}</span>
                        </div>
                      )}
                      {step.fee && (
                        <div className="bg-muted/50 p-3 rounded-lg border text-sm">
                          <span className="font-bold block text-muted-foreground mb-1 text-xs uppercase tracking-wider">Fee</span>
                          <span className="font-medium">{step.fee}</span>
                        </div>
                      )}
                    </div>

                    {step.documents && step.documents.length > 0 && (
                      <div className="mt-4">
                        <span className="font-bold text-sm text-foreground">Required Documents:</span>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
                          {step.documents.map((d, j) => <li key={j}>{d}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {renderDisclaimer(processResult.disclaimer)}
      </div>
    );
  };

  const renderFormHelp = () => {
    if (!formResult) return null;
    return (
      <div className="w-full max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8 bg-card border rounded-2xl p-6 shadow-sm">
          <h1 className="font-display text-3xl font-bold text-primary mb-3 flex items-center gap-3">
            <FaWpforms /> {formResult.formName}
          </h1>
          <p className="text-muted-foreground">{formResult.summary}</p>
        </div>

        <h3 className="text-xl font-bold mb-4 px-2">Field Instructions</h3>
        <div className="grid gap-4 mb-10">
          {formResult.fieldGuidance.map((field, i) => (
            <Card key={i} className="shadow-sm border-l-4 border-l-primary overflow-hidden">
              <CardHeader className="py-3 bg-muted/20 border-b">
                <CardTitle className="text-base flex justify-between items-center">
                  <span>{field.fieldName}</span>
                  {field.required && <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded">Required</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <p className="text-sm text-foreground/90">{field.instructions}</p>
                {field.example && (
                  <div className="bg-muted p-3 rounded-lg border border-border/50 text-sm font-mono text-muted-foreground">
                    <span className="text-xs uppercase tracking-wider font-sans font-bold block mb-1">Example</span>
                    {field.example}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {formResult.commonMistakes && formResult.commonMistakes.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/30 shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="text-amber-800 flex items-center gap-2 text-lg">
                <FaExclamationTriangle /> Common Mistakes to Avoid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {formResult.commonMistakes.map((mistake, i) => (
                  <li key={i} className="flex gap-2 text-amber-900/80 text-sm">
                    <span className="font-bold text-amber-500">•</span> {mistake}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {renderDisclaimer(formResult.disclaimer)}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 w-full bg-background/50"
    >
      {mode === 'explain' || mode === 'redFlags' ? renderAnalysis() : null}
      {mode === 'processGuide' ? renderProcess() : null}
      {mode === 'formHelp' ? renderFormHelp() : null}
    </motion.div>
  );
}
