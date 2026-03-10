import { GoogleGenAI, Type } from "@google/genai";
import { TemplateLayout } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface GeneratedAssets {
  palette: string[];
  fontFamily: string;
  screenshots: {
    title: string;
    subtitle: string;
    layout: TemplateLayout;
    backgroundIndex: number;
  }[];
}

export async function generateScreenshotAssets(appDetails: string): Promise<GeneratedAssets> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an expert App Store Optimization (ASO) designer.
    Based on the following app description, generate a cohesive set of 5 App Store screenshots.
    Provide a color palette (hex codes), a font pairing, and for each screenshot: a catchy title, a descriptive subtitle, and a recommended layout.
    
    App Description: ${appDetails}
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          palette: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of 3-5 hex color codes that fit the app's vibe. Ensure high contrast with white or black text.",
          },
          fontFamily: {
            type: Type.STRING,
            description: "A Google Font name suitable for the app (e.g., 'Inter', 'Space Grotesk', 'Playfair Display', 'Outfit').",
          },
          screenshots: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Short, punchy title (max 5 words)" },
                subtitle: { type: Type.STRING, description: "Descriptive subtitle (max 10 words)" },
                layout: { 
                  type: Type.STRING, 
                  description: "One of: 'text-top', 'text-bottom', 'split-left', 'split-right', 'angled-right', 'panorama-right', 'panorama-left'. Use panorama-right followed by panorama-left for a continuous device effect." 
                },
                backgroundIndex: {
                  type: Type.INTEGER,
                  description: "Index of the color from the palette to use as background (0 to palette.length - 1)"
                }
              },
              required: ["title", "subtitle", "layout", "backgroundIndex"]
            }
          }
        },
        required: ["palette", "fontFamily", "screenshots"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
