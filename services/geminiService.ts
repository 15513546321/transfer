
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse } from "../types";

const API_KEY = process.env.API_KEY || '';

export const translateText = async (inputs: string[]): Promise<GeminiResponse> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate the following list of terms into English keywords suitable for variable naming. Return the result as a JSON array of objects, where each object has "original" and "translated" properties.
    
    Terms:
    ${inputs.join('\n')}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          translations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                translated: { type: Type.STRING }
              },
              required: ["original", "translated"]
            }
          }
        },
        required: ["translations"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{"translations":[]}');
    return data;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Translation failed to parse correctly.");
  }
};
