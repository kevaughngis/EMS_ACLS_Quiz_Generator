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
