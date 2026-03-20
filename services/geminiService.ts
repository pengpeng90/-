import { GoogleGenAI } from "@google/genai";

// Note: For gemini-3-pro-image-preview / gemini-3.1-flash-image-preview, 
// key selection is handled in App.tsx via aistudio.
// We initialize the client inside each function to ensure we use the latest injected API_KEY.

const MODEL_NAME = 'gemini-3.1-flash-image-preview';

const MAX_RETRIES = 5;

const calculateDelay = (attempt: number) => {
  // Exponential backoff: 2s, 4s, 8s, 16s, 32s + random jitter
  return Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 1000);
};

const isRetryableError = (error: any): boolean => {
  return (
    error.status === 503 || 
    error.status === 500 || 
    error.status === 429 ||
    (error.message && (
        error.message.includes('overloaded') ||
        error.message.includes('UNAVAILABLE') ||
        error.message.includes('503') ||
        error.message.includes('xhr') || 
        error.message.includes('fetch') || 
        error.message.includes('network')
    ))
  );
};

/**
 * Edits an image based on a text prompt.
 * 
 * @param base64Image The source image in base64 format (raw, no data URI prefix).
 * @param changeDescription The description of what to change.
 * @param mode The generation mode: 'portrait' (default, maintains framing) or 'blueprint' (full body turnaround).
 * @returns The new image in base64 format.
 */
export const editCharacterImage = async (
  base64Image: string,
  changeDescription: string,
  mode: 'portrait' | 'blueprint' = 'portrait'
): Promise<string> => {
  
  let prompt = "";
  let config = {};

  if (mode === 'portrait') {
    // Original strict prompt for editing the avatar
    prompt = `
      Edit this 3D cartoon character image. 
      Task: ${changeDescription}
      
      CRITICAL FRAMING & ASPECT RATIO INSTRUCTIONS:
      1. OUTPUT ASPECT RATIO: 1:1 (SQUARE).
      2. FRAMING: STRICTLY HALF-BODY / WAIST-UP Portrait.
      3. REFERENCE: The framing must match the proportion of a standard ID photo or the Input Image exactly.
      4. DO NOT zoom out to show knees, legs, or feet. 
      5. DO NOT zoom in to extreme close-up. Keep the head and shoulders clearly visible with some space above the head.
      
      Other Instructions:
      1. Maintain the character's facial features, identity, and pose.
      2. Background: Pure solid white background (#FFFFFF). No shadows, no gradients.
      3. Style & Texture: STRICTLY MATCH the artistic style, hair texture, and material finish of the original Input Image. 
         - PROHIBITED: Do NOT add realistic hair strands, pores, or high-frequency details.
         - REQUIRED: Keep the soft, smooth, "blind box toy" or "3D cartoon" aesthetic.
         - QUALITY: Denoised, sharp edges, high fidelity.
      4. Eyes: Maintain dark brown/black eye color unless specified otherwise.
      5. PROHIBITED: Do NOT add text, labels, or logos.
    `;
    
    // Single image set to 1K (approx 1080p) as requested
    config = {
        imageConfig: { imageSize: '1K', aspectRatio: '1:1' }
    };
  } else {
    // New prompt for 3D Blueprint / Turnaround Sheet
    prompt = `
      You are a professional 3D Character Artist assistant.
      Task: Create a "Character Turnaround Sheet" (Three-View Blueprint).

      Output Requirements:
      1. Layout: Three distinct views side-by-side: [Front] [Side] [Back] within a 1:1 Square image.
      2. Subject: The EXACT same character as the input.
      3. Pose: T-Pose or A-Pose.
      4. Style: Clean 3D render, flat shading, white background.
      5. Task Detail: ${changeDescription}
    `;
    // Blueprint considered as single image output, set to 1K
    config = {
        imageConfig: { imageSize: '1K', aspectRatio: '1:1' }
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const makeRequest = async (attempt = 1): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [
            {
              text: prompt,
            },
            {
              inlineData: {
                mimeType: 'image/png',
                data: base64Image,
              },
            },
          ],
        },
        config: config
      });

      // Extract the image from the response
      const parts = response.candidates?.[0]?.content?.parts;
      
      if (!parts) {
        throw new Error("No content returned from Gemini");
      }

      // Look for the inlineData part which contains the image
      const imagePart = parts.find(part => part.inlineData && part.inlineData.data);

      if (imagePart && imagePart.inlineData) {
        return imagePart.inlineData.data;
      }

      throw new Error("Gemini did not return an image. It might have refused the request.");
    } catch (error: any) {
      if (attempt <= MAX_RETRIES && isRetryableError(error)) {
        const delay = calculateDelay(attempt);
        console.warn(`Gemini API request failed (Attempt ${attempt}/${MAX_RETRIES}). Retrying in ${delay}ms...`, error.message);
        await new Promise(r => setTimeout(r, delay)); 
        return makeRequest(attempt + 1);
      }
      throw error;
    }
  };

  try {
    return await makeRequest();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Advanced Custom Generation with multiple reference images.
 */
export const generateCustomCharacterGrid = async (
    baseImage: string,
    promptText: string,
    appearanceRef: string | null,
    appearanceWeight: number,
    clothingRef: string | null,
    clothingWeight: number,
    actionRef: string | null,
    actionWeight: number
): Promise<string> => {

    const parts: any[] = [];
    
    // 2. Build Complex Prompt
    let fullPrompt = `
    You are a professional 3D Character Designer.
    Task: Generate a 2x2 grid (4 distinct variations) of a 3D character.

    INPUTS:
    - Image 1: The BASE character (Style & Identity Core).
    `;

    // Calculate part indices dynamically
    let imgIndex = 2;

    if (appearanceRef) {
        // Updated to emphasize Hairstyle Only
        fullPrompt += `- Image ${imgIndex}: HAIRSTYLE Reference. Focus strictly on copying the hairstyle shape and color. Influence: ${appearanceWeight}%.\n`;
        imgIndex++;
    }
    if (clothingRef) {
        fullPrompt += `- Image ${imgIndex}: CLOTHING Reference. Influence: ${clothingWeight}%.\n`;
        imgIndex++;
    }
    if (actionRef) {
        fullPrompt += `- Image ${imgIndex}: ACTION/POSE Reference. Influence: ${actionWeight}%.\n`;
        imgIndex++;
    }

    fullPrompt += `
    USER INSTRUCTIONS:
    "${promptText}"

    CRITICAL CONSTRAINTS (READ CAREFULLY):
    
    1. *** VIEWPOINT & POSE ***: 
       - STRICTLY FRONT-FACING PORTRAIT (Head and shoulders facing forward).
       - Maintain the exact camera angle of Image 1.
       - Do NOT rotate the character side-ways unless the User Instructions explicitly ask for a profile view.
       
    2. *** STYLE & CONSISTENCY ***: 
       - STRICTLY MATCH the artistic style of Image 1 (The Base Character).
       - The character must look like a "3D Blind Box Toy" or "Pixar-style Avatar".
       - Skin must be SMOOTH and FLATTENED (like vinyl/plastic). DO NOT generate realistic human skin texture, pores, or wrinkles.
       - Eyes must remain the same style as Image 1.
       
    3. *** FRAMING ***:
       - Output a 2x2 Grid.
       - All 4 images must be WAIST-UP / HALF-BODY.
       - NO Full body, NO knees, NO feet.
       
    4. *** QUALITY ***:
       - 8k resolution, Ultra-HD, Completely Denoised.
       - Material: Smooth, soft matte plastic or high-quality vinyl.
       - Lighting: Soft studio lighting, ambient occlusion, pure white background (#FFFFFF).
    `;

    // 3. Construct Payload
    parts.push({ text: fullPrompt });
    parts.push({ inlineData: { mimeType: 'image/png', data: baseImage }}); // Image 1

    if (appearanceRef) {
        parts.push({ inlineData: { mimeType: 'image/png', data: appearanceRef }}); 
    }
    if (clothingRef) {
        parts.push({ inlineData: { mimeType: 'image/png', data: clothingRef }});
    }
    if (actionRef) {
        parts.push({ inlineData: { mimeType: 'image/png', data: actionRef }});
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const makeRequest = async (attempt = 1): Promise<string> => {
        try {
            const response = await ai.models.generateContent({
                model: MODEL_NAME,
                contents: { parts },
                config: {
                    // Set to 2K High Definition for 4-grid generation
                    imageConfig: { imageSize: '2K', aspectRatio: '1:1' }
                }
            });

            const respParts = response.candidates?.[0]?.content?.parts;
            const imagePart = respParts?.find(part => part.inlineData && part.inlineData.data);

            if (imagePart && imagePart.inlineData) {
                return imagePart.inlineData.data;
            }
            throw new Error("No image generated.");

        } catch (error: any) {
            if (attempt <= MAX_RETRIES && isRetryableError(error)) {
                const delay = calculateDelay(attempt);
                console.warn(`Custom Grid Gen failed (Attempt ${attempt}/${MAX_RETRIES}). Retrying in ${delay}ms...`, error.message);
                await new Promise(r => setTimeout(r, delay)); 
                return makeRequest(attempt + 1);
            }
            console.error("Custom Grid Generation Error:", error);
            throw error;
        }
    };

    return await makeRequest();
};

/**
 * Generates a 2x2 grid of random variations based on multiple distinct prompts.
 */
export const generateRandomCharacterGrid = async (
  base64Image: string,
  multiPromptText: string
): Promise<string> => {
  const prompt = `
      You are a professional 3D Character Designer.
      Task: Generate a 2x2 grid (4 distinct variations) of a 3D character.

      INPUT:
      - Image 1: The BASE character.

      INSTRUCTIONS FOR EACH PANEL:
      ${multiPromptText}

      OUTPUT REQUIREMENTS:
      1. Format: 2x2 Grid inside a 1:1 SQUARE Image.
      2. IDENTITY: The face (eyes, nose, mouth) and AGE must match the input. BUT the HAIRSTYLE MUST CHANGE to match the specific instruction.
      3. **VARIATION**: You MUST generate DIFFERENT HAIRSTYLES and OUTFITS for each panel. Do not just copy the input hair.
      4. **HAIR COLOR**: STRICTLY Natural Asian Hair Colors (Black, Dark Brown).
      5. **HAIR SHAPE**: Realistic volume. Avoid exaggerated/cartoonish spikes or size.
      6. STYLE: STRICTLY maintain the soft, clean 3D render style (Blind Box / C4D Render). 
         - SURFACE: Perfectly smooth, denoised.
         - QUALITY: Ultra-HD, 8k, sharp focus.
         - NO realistic hair strands or messy noise/grain. 
         - NO realistic skin texture or pores.
         - Keep it looking like a high-quality 3D avatar/toy.
      7. FRAMING: STRICT WAIST-UP / HALF-BODY Portrait.
      8. PROPORTION: Must match the input image proportion (Standard Avatar).
      9. NO FULL BODY. Do NOT show legs/feet.
      10. Background: Pure White (#FFFFFF).
    `;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const makeRequest = async (attempt = 1): Promise<string> => {
        try {
            const response = await ai.models.generateContent({
                model: MODEL_NAME,
                contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: 'image/png', data: base64Image } }
                ],
                },
                config: {
                    // Set to 2K High Definition for 4-grid generation
                    imageConfig: { imageSize: '2K', aspectRatio: '1:1' }
                }
            });

            const parts = response.candidates?.[0]?.content?.parts;
            const imagePart = parts?.find(part => part.inlineData && part.inlineData.data);

            if (imagePart && imagePart.inlineData) {
                return imagePart.inlineData.data;
            }
            throw new Error("No image generated.");
        } catch (error: any) {
             if (attempt <= MAX_RETRIES && isRetryableError(error)) {
                 const delay = calculateDelay(attempt);
                 console.warn(`Random Grid Gen failed (Attempt ${attempt}/${MAX_RETRIES}). Retrying in ${delay}ms...`, error.message);
                 await new Promise(r => setTimeout(r, delay)); 
                 return makeRequest(attempt + 1);
             }
             console.error("Random Grid Generation Error:", error);
             throw error;
        }
    };

    return await makeRequest();
};