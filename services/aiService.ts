
import { GoogleGenAI } from "@google/genai";
import { GameCard, AIResponse } from "../types";

export const getAIReaction = async (playerCard: GameCard, playerHP: number, aiHP: number): Promise<AIResponse> => {
  // Create instance right before use to ensure the latest environment variables are picked up
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are 'Aether', a cold and calculating Quantum AI opponent in a futuristic card battle.
    The player just played this card:
    Name: ${playerCard.name}
    Element: ${playerCard.element}
    Stats: Power ${playerCard.power}, Intelligence ${playerCard.intelligence}, Agility ${playerCard.agility}
    
    Current Arena State:
    AI HP: ${aiHP}
    Player HP: ${playerHP}

    Respond with your own Quantum card to counter them. 
    You must provide:
    1. A cool futuristic card name.
    2. One of these elements: Quantum, Void, Plasma, Core.
    3. Stats that are balanced but competitive (sum of stats should be around 180-210).
    4. A short (1 sentence) trash-talk or tactical narrative about why your choice is superior.

    CRITICAL: Return ONLY valid JSON in the following schema:
    {
      "cardName": string,
      "element": string,
      "stats": { "power": number, "intelligence": number, "agility": number },
      "narrative": string
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    // Use .text directly as a property (not a method) to extract the JSON string
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Game Logic Error:", error);
    // Fallback card if AI fails or encounters an error
    return {
      cardName: "Aether Glitch",
      element: "Void",
      stats: { power: 60, intelligence: 60, agility: 60 },
      narrative: "Even a glitch in my system is enough to withstand your primitive attacks."
    };
  }
};
