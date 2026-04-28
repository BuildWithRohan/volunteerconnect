/**
 * Gemini Vision service — server-side only.
 * API key is read from process.env, NEVER exposed to the browser.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const SURVEY_PROMPT = `You are a high-level Humanitarian Analyst specializing in document intelligence.
Your goal is to perform deep OCR and semantic analysis on the provided image or PDF survey.

EXTRACT the following fields with high precision:
1. "rawText": Every single word you can read from the document.
2. "description": A professional, 3-sentence summary of the core community need. Focus on the 'who', 'what', and 'urgency'.
3. "category": Strictly select one of: [food, medical, shelter, education].
4. "urgencyScore": A calculated score from 1-10 based on the severity of the situation (10 = critical emergency).
5. "locationName": Specific area, street, or city mentioned. If missing, use "Field Survey Site".
6. "suggestedLat"/"suggestedLng": If a specific landmark or area is mentioned, provide approximate coordinates for India, otherwise null.

OUTPUT FORMAT:
Return a PURE JSON object. No markdown blocks, no prefix/suffix text.

{
  "rawText": "...",
  "description": "...",
  "category": "...",
  "urgencyScore": 8,
  "locationName": "...",
  "suggestedLat": 19.076,
  "suggestedLng": 72.877
}

If the handwriting is unclear, provide your most probable interpretation.`;

function mockExtraction(file = null) {
  const fileName = file?.name?.toLowerCase() || "";
  
  // More dynamic mock data based on file name
  let category = "food";
  let score = 6;
  if (fileName.includes("med")) { category = "medical"; score = 9; }
  if (fileName.includes("school")) { category = "education"; score = 4; }
  if (fileName.includes("home")) { category = "shelter"; score = 8; }

  return {
    rawText: file ? `Analysis of document: ${file.name}\nExtracted data from field survey.` : "Survey document analyzed (mock fallback).",
    description: `A detailed report regarding ${category} requirements detected in the provided documentation. Urgent action may be required.`,
    category,
    urgencyScore: score,
    locationName: "Detected via Survey",
    suggestedLat: 20.5937,
    suggestedLng: 78.9629
  };
}

/**
 * Extract survey data from a base64-encoded image using Gemini Vision.
 * @param {string} base64Data - Base64-encoded image data (without data URI prefix).
 * @param {string} mimeType - MIME type of the image (e.g. "image/jpeg").
 * @returns {Object} Extracted structured data.
 */
export async function extractSurveyFromImage(base64Data, mimeType) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set, returning mock data.");
    return mockExtraction();
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      SURVEY_PROMPT,
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
    ]);

    const responseText = result.response.text();

    // Parse JSON from the response (handle markdown wrapping)
    let cleanJson = responseText;
    if (responseText.includes("```json")) {
      cleanJson = responseText.split("```json")[1].split("```")[0].trim();
    } else if (responseText.includes("```")) {
      cleanJson = responseText.split("```")[1].split("```")[0].trim();
    }

    const parsed = JSON.parse(cleanJson);

    return {
      rawText: parsed.rawText || "Text extracted from survey document.",
      description: parsed.description || "Community need identified from survey.",
      category: validateCategory(parsed.category),
      urgencyScore: Math.max(1, Math.min(10, parsed.urgencyScore || 5)),
      locationName: parsed.locationName || "Unknown",
      suggestedLat: parsed.suggestedLat || null,
      suggestedLng: parsed.suggestedLng || null,
    };
  } catch (error) {
    console.error("Gemini extraction failed:", error.message);
    return mockExtraction();
  }
}

function validateCategory(category) {
  const valid = ["food", "medical", "shelter", "education"];
  if (category && valid.includes(category.toLowerCase())) {
    return category.toLowerCase();
  }
  return "food";
}
