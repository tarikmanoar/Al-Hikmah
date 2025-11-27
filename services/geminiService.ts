import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MODELS, SYSTEM_INSTRUCTION_SCHOLAR } from "../constants";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Standard Scholar Chat
export async function* streamScholarChat(history: { role: string; parts: { text: string }[] }[], newMessage: string) {
  const ai = getAI();
  
  // Transform history for the SDK
  const formattedHistory = history.map(msg => ({
    role: msg.role,
    parts: msg.parts
  }));

  const chat = ai.chats.create({
    model: MODELS.CHAT,
    history: formattedHistory,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_SCHOLAR,
      temperature: 0.7,
    },
  });

  const result = await chat.sendMessageStream({ message: newMessage });

  for await (const chunk of result) {
    const c = chunk as GenerateContentResponse;
    yield c.text;
  }
}

// Search Grounded Chat
export async function searchGroundedQuery(query: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.SEARCH,
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text,
    groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
}

// Image Editing
export async function editImage(base64Image: string, mimeType: string, prompt: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.IMAGE,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });
  
  // Need to parse parts to find image
  let imageBase64 = null;
  let text = null;

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageBase64 = part.inlineData.data;
      } else if (part.text) {
        text = part.text;
      }
    }
  }

  return { imageBase64, text };
}