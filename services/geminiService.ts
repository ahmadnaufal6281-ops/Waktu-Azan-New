
import { GoogleGenAI } from "@google/genai";
import { AttendanceRecord } from "../types";

export const getAttendanceInsights = async (records: AttendanceRecord[]) => {
  // Use named parameter for the API key as required by the @google/genai SDK
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const recordsSummary = records.map(r => `${r.userName} - ${r.status} - ${r.date} ${r.time}`).join('\n');
  
  const prompt = `
    Berikut adalah data kehadiran digital selama beberapa hari terakhir:
    ${recordsSummary}
    
    Tolong berikan ringkasan singkat (maksimal 3 poin) mengenai tren kehadiran, siapa yang paling sering telat, dan saran untuk meningkatkan disiplin. Gunakan bahasa Indonesia yang ramah dan profesional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Access the text property directly on GenerateContentResponse
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf, gagal mengambil insight AI saat ini.";
  }
};
