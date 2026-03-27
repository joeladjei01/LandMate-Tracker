import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import {
  TEMPLATE_A_SYSTEM,
  TEMPLATE_B_SYSTEM,
  TEMPLATE_C_SYSTEM,
  TEMPLATE_D_SYSTEM,
  TEMPLATE_E_SYSTEM,
  DISCLAIMER,
  getLanguageInstruction,
} from "../../prompts/templates.js";
import {
  parseAnalysisResponse,
  parseProcessGuidance,
  parseFormAssistance,
  classifyDocument,
} from "../../lib/parseClaudeResponse.js";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

async function callClaude(systemPrompt: string, userMessage: string, history: Array<{ role: string; content: string }> = []): Promise<string> {
  const messages = [
    ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user" as const, content: userMessage },
  ];

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: systemPrompt,
    messages,
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

function chunkText(text: string, maxWords = 3000): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "\n\n[Document truncated for analysis — first 3000 words shown]";
}

router.post("/extract-text", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file", message: "Please upload a file." });
      return;
    }

    const { originalname, mimetype, buffer } = req.file;

    let extractedText = "";

    if (mimetype === "application/pdf" || originalname.endsWith(".pdf")) {
      try {
        const pdfParse = (await import("pdf-parse")).default;
        const data = await pdfParse(buffer);
        extractedText = data.text;
      } catch {
        res.status(422).json({ error: "PDF extraction failed", message: "Could not extract text from this PDF. Please try pasting the text manually." });
        return;
      }
    } else if (mimetype.startsWith("image/")) {
      res.status(422).json({ error: "OCR not supported", message: "Image text extraction is not available. Please paste the document text manually." });
      return;
    } else {
      res.status(400).json({ error: "Unsupported file type", message: "Please upload a PDF file or paste the text directly." });
      return;
    }

    if (!extractedText.trim()) {
      res.status(422).json({ error: "No text found", message: "No readable text was found in this file. Please try pasting the text manually." });
      return;
    }

    const documentType = classifyDocument(extractedText);

    res.json({ text: extractedText, documentType, fileName: originalname });
  } catch (err) {
    req.log.error({ err }, "Error extracting text from file");
    res.status(500).json({ error: "Extraction failed", message: "An error occurred while processing your file. Please try again." });
  }
});

router.post("/analyze", async (req: Request, res: Response) => {
  try {
    const { documentText, documentType, mode, language = "english", fileName } = req.body as {
      documentText: string;
      documentType: string;
      mode: "explain" | "redFlags";
      language?: string;
      fileName?: string;
    };

    if (!documentText || !documentType || !mode) {
      res.status(400).json({ error: "Missing fields", message: "documentText, documentType, and mode are required." });
      return;
    }

    const langInstruction = getLanguageInstruction(language);
    const chunkedText = chunkText(documentText);

    const systemPrompt = mode === "explain"
      ? `${TEMPLATE_A_SYSTEM}\n\n${langInstruction}`
      : `${TEMPLATE_B_SYSTEM}\n\n${langInstruction}`;

    const userMessage = `Please analyze this land document${fileName ? ` (${fileName})` : ""}:\n\n${chunkedText}`;

    const rawResponse = await callClaude(systemPrompt, userMessage);
    const parsed = parseAnalysisResponse(rawResponse, mode);

    res.json({
      ...parsed,
      disclaimer: DISCLAIMER,
    });
  } catch (err) {
    req.log.error({ err }, "Error analyzing document");
    res.status(500).json({ error: "Analysis failed", message: "An error occurred during document analysis. Please try again." });
  }
});

router.post("/process-guidance", async (req: Request, res: Response) => {
  try {
    const { processName, language = "english" } = req.body as { processName: string; language?: string };

    if (!processName) {
      res.status(400).json({ error: "Missing fields", message: "processName is required." });
      return;
    }

    const langInstruction = getLanguageInstruction(language);
    const systemPrompt = `${TEMPLATE_C_SYSTEM}\n\n${langInstruction}`;
    const userMessage = `Please provide a detailed step-by-step guide for this GLC process: ${processName}`;

    const rawResponse = await callClaude(systemPrompt, userMessage);
    const parsed = parseProcessGuidance(rawResponse);

    res.json({
      ...parsed,
      disclaimer: DISCLAIMER,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting process guidance");
    res.status(500).json({ error: "Process guidance failed", message: "An error occurred. Please try again." });
  }
});

router.post("/form-assistance", async (req: Request, res: Response) => {
  try {
    const { documentText, documentType, language = "english" } = req.body as {
      documentText: string;
      documentType: string;
      language?: string;
    };

    if (!documentText || !documentType) {
      res.status(400).json({ error: "Missing fields", message: "documentText and documentType are required." });
      return;
    }

    const langInstruction = getLanguageInstruction(language);
    const chunkedText = chunkText(documentText, 2000);
    const systemPrompt = `${TEMPLATE_D_SYSTEM}\n\n${langInstruction}`;
    const userMessage = `Please provide field-by-field guidance for filling out this GLC form:\n\n${chunkedText}`;

    const rawResponse = await callClaude(systemPrompt, userMessage);
    const parsed = parseFormAssistance(rawResponse);

    res.json({
      ...parsed,
      disclaimer: DISCLAIMER,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting form assistance");
    res.status(500).json({ error: "Form assistance failed", message: "An error occurred. Please try again." });
  }
});

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [], documentContext, documentType, language = "english" } = req.body as {
      message: string;
      conversationHistory: Array<{ role: string; content: string }>;
      documentContext?: string;
      documentType?: string;
      language?: string;
    };

    if (!message) {
      res.status(400).json({ error: "Missing fields", message: "message is required." });
      return;
    }

    const langInstruction = getLanguageInstruction(language);
    let systemPrompt = `${TEMPLATE_E_SYSTEM}\n\n${langInstruction}`;

    if (documentContext) {
      const chunked = chunkText(documentContext, 1500);
      systemPrompt += `\n\nDOCUMENT CONTEXT (the citizen's land document):\nDocument type: ${documentType || "unknown"}\n\n${chunked}`;
    }

    const sanitizedMessage = message.slice(0, 500);
    const rawResponse = await callClaude(systemPrompt, sanitizedMessage, conversationHistory);

    res.json({
      response: rawResponse,
      disclaimer: DISCLAIMER,
    });
  } catch (err) {
    req.log.error({ err }, "Error in chat");
    res.status(500).json({ error: "Chat failed", message: "An error occurred. Please try again." });
  }
});

export default router;
