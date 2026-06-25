import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function getScenarioFeedback(protocol: string, logs: string[]) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are an expert medical educator specializing in ${protocol}.
      Analyze the following simulation logs from a student:
      ${logs.join('\n')}

      Please provide:
      1. PERFORMANCE SCORE (0-100)
      2. CRITICAL ERRORS: List any deviations from current AHA/ERC/AAP guidelines.
      3. PATHOPHYSIOLOGY: Explain the cellular and physiological reasons why the interventions (or lack thereof) affected the patient's state.
      4. GUIDELINE REFRESH: Provide 3 high-yield bullet points for this specific scenario.

      Keep the tone professional yet encouraging. Use Markdown.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Debrief Error:", error);
    return "The AI preceptor is currently unavailable. Please review the AHA guidelines manually.";
  }
}

export async function getClinicalChatResponse(persona: string, message: string, context: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `You are a ${persona} in a high-stress medical emergency.
        Current Context: ${context}
        The user (Medic/Doctor) says: "${message}"
        Respond as this character would. Be brief, realistic, and clinically appropriate.
        If you are the patient and are unconscious, respond with "..." or "No response".
        Stay in character. Do not provide medical advice as an AI.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        return "The person seems unable to respond clearly right now.";
    }
}

export async function getLiveCoachingHint(protocol: string, logs: string[], vitals: any) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
        You are an expert medical preceptor watching a student perform a simulation.
        PROTOCOL: ${protocol}
        CURRENT VITALS: HR ${vitals.hr}, SpO2 ${vitals.spo2}, MAP ${vitals.map}
        LOGS SO FAR:
        ${logs.slice(-5).join('\n')}

        Provide ONE short, urgent hint (max 15 words) for the student.
        Focus on the immediate next priority in the algorithm.
        Example: "Check for a pulse and start high-quality CPR immediately."
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      return null;
    }
  }
