export interface ParsedAnalysis {
  summary: string;
  keyPoints: string[];
  importantDates: Array<{ label: string; value: string; daysUntil?: number }>;
  nextSteps: string[];
  redFlags: Array<{ severity: 'HIGH' | 'MEDIUM' | 'LOW'; issue: string; explanation: string; recommendation: string }>;
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  documentType: string;
}

export interface ParsedProcessGuidance {
  processName: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    office?: string;
    fee?: string;
    documents: string[];
  }>;
  requiredDocuments: string[];
  estimatedFees: string;
  estimatedDuration: string;
  offices: string[];
}

export interface ParsedFormAssistance {
  formName: string;
  summary: string;
  fieldGuidance: Array<{
    fieldName: string;
    instructions: string;
    example?: string;
    required: boolean;
    commonMistake?: string;
  }>;
  commonMistakes: string[];
  submissionInstructions: string;
}

function extractTag(text: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

function extractAllTags(text: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const results: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    results.push(match[1].trim());
  }
  return results;
}

function parseDateDaysUntil(dateStr: string): number | undefined {
  try {
    const now = new Date();
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return undefined;
    const diff = Math.floor((parsed.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  } catch {
    return undefined;
  }
}

export function parseAnalysisResponse(text: string, mode: string): ParsedAnalysis {
  const result: ParsedAnalysis = {
    summary: '',
    keyPoints: [],
    importantDates: [],
    nextSteps: [],
    redFlags: [],
    overallRiskLevel: 'LOW',
    documentType: 'unknown',
  };

  if (mode === 'explain') {
    result.summary = extractTag(text, 'summary');
    result.keyPoints = extractAllTags(text, 'point').filter(Boolean);
    result.nextSteps = extractAllTags(text, 'step').filter(Boolean);
    result.documentType = extractTag(text, 'document_type') || 'unknown';

    const dateBlocks = extractAllTags(text, 'date');
    for (const block of dateBlocks) {
      const label = extractTag(block, 'label');
      const value = extractTag(block, 'value');
      if (label && value) {
        result.importantDates.push({
          label,
          value,
          daysUntil: parseDateDaysUntil(value),
        });
      }
    }
  } else {
    const riskLevel = extractTag(text, 'overall_risk').toUpperCase();
    result.overallRiskLevel = (riskLevel === 'HIGH' || riskLevel === 'MEDIUM' || riskLevel === 'LOW') ? riskLevel as 'HIGH' | 'MEDIUM' | 'LOW' : 'LOW';
    result.summary = extractTag(text, 'document_summary');
    result.nextSteps = extractAllTags(text, 'step').filter(Boolean);

    const flagBlocks = extractAllTags(text, 'flag');
    for (const block of flagBlocks) {
      const severity = extractTag(block, 'severity').toUpperCase();
      const issue = extractTag(block, 'issue');
      const explanation = extractTag(block, 'explanation');
      const recommendation = extractTag(block, 'recommendation');
      if (issue) {
        result.redFlags.push({
          severity: (severity === 'HIGH' || severity === 'MEDIUM' || severity === 'LOW') ? severity as 'HIGH' | 'MEDIUM' | 'LOW' : 'MEDIUM',
          issue,
          explanation,
          recommendation,
        });
      }
    }
  }

  return result;
}

export function parseProcessGuidance(text: string): ParsedProcessGuidance {
  const processName = extractTag(text, 'process_name');
  const estimatedFees = extractTag(text, 'estimated_fees');
  const estimatedDuration = extractTag(text, 'estimated_duration');
  const requiredDocuments = extractAllTags(text, 'doc').filter(Boolean);
  const offices = extractAllTags(text, 'office').filter(Boolean);

  const stepBlocks = extractAllTags(text, 'step');
  const steps = stepBlocks.map((block) => {
    const numberStr = extractTag(block, 'number');
    const title = extractTag(block, 'title');
    const description = extractTag(block, 'description');
    const office = extractTag(block, 'office');
    const fee = extractTag(block, 'fee');
    const docsStr = extractTag(block, 'documents');
    const documents = docsStr ? docsStr.split(',').map(d => d.trim()).filter(Boolean) : [];

    return {
      stepNumber: parseInt(numberStr) || 0,
      title: title || `Step ${numberStr}`,
      description,
      office: office || undefined,
      fee: fee || undefined,
      documents,
    };
  });

  return {
    processName,
    steps: steps.filter(s => s.description),
    requiredDocuments,
    estimatedFees,
    estimatedDuration,
    offices,
  };
}

export function parseFormAssistance(text: string): ParsedFormAssistance {
  const formName = extractTag(text, 'form_name');
  const summary = extractTag(text, 'form_summary');
  const submissionInstructions = extractTag(text, 'submission_instructions');
  const commonMistakes = extractAllTags(text, 'mistake').filter(Boolean);

  const fieldBlocks = extractAllTags(text, 'field');
  const fieldGuidance = fieldBlocks.map(block => {
    const fieldName = extractTag(block, 'name');
    const instructions = extractTag(block, 'instructions');
    const example = extractTag(block, 'example');
    const requiredStr = extractTag(block, 'required');
    const commonMistake = extractTag(block, 'common_mistake');

    return {
      fieldName,
      instructions,
      example: example || undefined,
      required: requiredStr.toLowerCase() === 'true',
      commonMistake: commonMistake || undefined,
    };
  });

  return {
    formName,
    summary,
    fieldGuidance: fieldGuidance.filter(f => f.fieldName),
    commonMistakes,
    submissionInstructions,
  };
}

export function classifyDocument(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('indenture') || (lower.includes('vendor') && lower.includes('purchaser')) || lower.includes('conveyance')) {
    return 'indenture';
  }
  if (lower.includes('title deed') || lower.includes('land title registry') || lower.includes('certificate of title')) {
    return 'titleDeed';
  }
  if (lower.includes('lease') || (lower.includes('lessor') && lower.includes('lessee')) || lower.includes('tenancy')) {
    return 'lease';
  }
  if (lower.includes('ghana lands commission') || lower.includes('application form') || lower.includes('form lc')) {
    return 'glcForm';
  }
  return 'unknown';
}
