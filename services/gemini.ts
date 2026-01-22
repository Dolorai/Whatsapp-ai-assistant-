import { GoogleGenAI } from "@google/genai";

// Note: In a real app, never expose keys in frontend code. 
// This is structured to use the env variable as per instructions.
// The user must provide their key in the environment.

export const generateWelcomeMessage = async (businessName: string, description: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Welcome to " + businessName + "! We offer " + description + ". How can we help?";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    
    const prompt = `
      Act as a professional WhatsApp Business Assistant for a company named "${businessName}".
      The business does the following: "${description}".
      
      Write a short, engaging, and professional welcome message for a new customer initiating a chat.
      Include a placeholder for the customer's name.
      Keep it under 50 words.
      Do not use hashtags.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    return response.text || "Welcome! How can we assist you today?";
  } catch (error) {
    console.error("Gemini AI generation failed", error);
    return `Welcome to ${businessName}! How can we help you today?`;
  }
};

export const analyzePaymentProof = async (imageUrl: string): Promise<{valid: boolean, reason: string}> => {
   if (!process.env.API_KEY) {
     // Mock response if no key
    return { valid: true, reason: "Mock validation: API Key missing." };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // In a real scenario, we would pass the base64 image here.
    // For this demo, we are mocking the image content part as we don't have a real backend to proxy the file bytes easily.
    
    // Simulating a text-only check for demonstration of the prompt structure
    const prompt = `
      I have received a payment proof image. 
      Hypothetically, check if it contains a transaction ID, date, and amount.
      Return a JSON with "valid" boolean and "reason" string.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
       config: {
        responseMimeType: "application/json"
      }
    });

    const json = JSON.parse(response.text);
    return json;
  } catch (error) {
    console.error("Proof analysis failed", error);
    return { valid: false, reason: "AI Analysis failed to run." };
  }
}