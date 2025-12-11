import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Claim, ClaimType, VerificationResult, VerificationStatus } from "../types";

// Schema for extracting claims strictly
const extractionSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      text: {
        type: Type.STRING,
        description: "The atomic fact or claim extracted from the text."
      },
      type: {
        type: Type.STRING,
        enum: ["PAPER", "DATA", "GENERAL"],
        description: "Classify the claim: PAPER for citations/studies, DATA for statistics/numbers, GENERAL for factual assertions."
      }
    },
    required: ["text", "type"]
  }
};

/**
 * Step 1: Extract atomic claims from the raw text
 */
export const extractClaims = async (text: string, apiKey: string): Promise<Claim[]> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  
  // Using Flash for fast extraction
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Analyze the following text and extract key factual claims that need verification. 
    Focus on specific entities, numbers, dates, and citations.
    Classify each claim carefully.
    
    Text:
    "${text.substring(0, 15000)}" 
    (Text truncated for length if necessary)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: extractionSchema,
      systemInstruction: "You are an expert fact-checker assistant. Extract atomic, verifiable claims."
    }
  });

  const rawJson = response.text;
  if (!rawJson) return [];

  try {
    const parsed = JSON.parse(rawJson);
    return parsed.map((item: any, index: number) => ({
      id: `claim-${Date.now()}-${index}`,
      text: item.text,
      type: item.type === 'PAPER' ? ClaimType.PAPER : item.type === 'DATA' ? ClaimType.DATA : ClaimType.GENERAL,
    }));
  } catch (e) {
    console.error("Failed to parse LLM extraction response", e);
    return [];
  }
};

/**
 * Step 2: Verify a single claim using Search Grounding
 */
export const verifyClaim = async (claim: Claim, apiKey: string): Promise<VerificationResult> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });

  // Prompt strategy changes slightly based on type
  let specificInstruction = "";
  if (claim.type === ClaimType.PAPER) {
    specificInstruction = "This is a bibliographic or academic claim. Verify if this paper/study exists and if the citation details are correct.";
  } else if (claim.type === ClaimType.DATA) {
    specificInstruction = "This is a statistical claim. specific numbers and dates. Check for accuracy.";
  } else {
    specificInstruction = "Verify the truthfulness of this general statement.";
  }

  // NOTE: Schema is NOT supported when using googleSearch tool. 
  // We must parse the natural language response or use a structured prompt without enforcement.
  // For this app, we will ask for a specific format in text and parse it, or rely on the text response.
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // Flash is good for search tasks
    contents: `Fact check this claim: "${claim.text}". 
    ${specificInstruction}
    
    Provide your response in the following strict format:
    STATUS: [TRUE | FALSE | UNCERTAIN]
    REASON: [A short explanation of why]`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const outputText = response.text || "";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  // Extract Sources from grounding metadata
  const sources = groundingChunks
    .map(chunk => chunk.web ? { title: chunk.web.title || "Web Source", uri: chunk.web.uri || "" } : null)
    .filter((s): s is { title: string; uri: string } => s !== null && !!s.uri); // simple uniqueness filter could be added

  // Simple parser for our custom format
  let status = VerificationStatus.UNCERTAIN;
  let reason = outputText;

  if (outputText.includes("STATUS: TRUE")) status = VerificationStatus.VERIFIED_TRUE;
  else if (outputText.includes("STATUS: FALSE")) status = VerificationStatus.VERIFIED_FALSE;
  else if (outputText.includes("STATUS: UNCERTAIN")) status = VerificationStatus.UNCERTAIN;

  // Clean up reason text
  const reasonMatch = outputText.match(/REASON:\s*(.*)/s);
  if (reasonMatch && reasonMatch[1]) {
    reason = reasonMatch[1].trim();
  } else {
    // If format fails, use full text but try to remove the status line
    reason = outputText.replace(/STATUS:.*(\n|$)/, '').trim();
  }

  return {
    claimId: claim.id,
    status,
    reasoning: reason,
    sources
  };
};