import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export async function getScenarioFeedback(protocol: string, logs: string[]) {
  if (!genAI) {
    return "Gemini API key not configured. Please check your .env file.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are an expert medical educator specializing in ${protocol} (Advanced Life Support).
      Below is a log of actions taken by a student during a simulated cardiac arrest scenario.

      Actions:
      ${logs.join('\n')}

      Please provide a detailed, gamified debriefing:
      1. CRITIQUE: Did they follow the ${protocol} algorithm correctly? (Timing of drugs, shocks, etc.)
      2. PATHOPHYSIOLOGY: Explain the physiological reason why their actions helped or hindered the patient based on the logs.
      3. SCORE: Give a score out of 100.
      4. TIPS: Three high-yield tips for next time.

      Format the response as a JSON-like object for a UI.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Error generating feedback. Please consult the standard AHA guidelines.";
  }
}
