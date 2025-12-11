export enum ClaimType {
  PAPER = 'Paper/Reference',
  DATA = 'Data/Statistic',
  GENERAL = 'General Statement'
}

export enum VerificationStatus {
  VERIFIED_TRUE = 'True',
  VERIFIED_FALSE = 'False',
  UNCERTAIN = 'Uncertain',
  PENDING = 'Pending'
}

export interface Claim {
  id: string;
  text: string;
  type: ClaimType;
  context?: string; // Surrounding text for context
}

export interface VerificationResult {
  claimId: string;
  status: VerificationStatus;
  reasoning: string;
  sources: Array<{
    title: string;
    uri: string;
  }>;
}

export interface AppConfig {
  geminiApiKey: string;
  // Although simulated in this demo via Gemini Grounding, we allow input
  searchApiKey?: string; 
  scholarApiKey?: string;
}

export type ProcessStage = 'IDLE' | 'PARSING' | 'EXTRACTING' | 'VERIFYING' | 'COMPLETE';
