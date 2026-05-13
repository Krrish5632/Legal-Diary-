/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const gemini = {
  summarizeCase: async (caseData: any) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Summarize this legal case for an advocate: ${JSON.stringify(caseData)}`,
        config: {
          systemInstruction: "You are an expert legal assistant. Provide a concise, professional summary of the case including key parties, next steps, and potential legal focus points.",
        }
      });
      return response.text;
    } catch (error) {
      console.error("AI summarization failed:", error);
      return "Unable to generate summary at this time.";
    }
  },

  suggestSections: async (firDetails: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on these FIR/Case details, suggest relevant IPC, CrPC, or BNS sections: ${firDetails}`,
        config: {
          systemInstruction: "You are an expert in Indian Law. Suggest specific legal sections based on descriptions. Always include a disclaimer.",
        }
      });
      return response.text;
    } catch (error) {
      console.error("AI section suggestion failed:", error);
      return "Unable to suggest sections.";
    }
  }
};
