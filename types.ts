export enum Gender {
  Male = 'Male',
  Female = 'Female'
}

export enum AgeGroup {
  Primary = 'Primary', // 小学生
  Middle = 'Middle'    // 中学生
}

export enum AppStep {
  HairSelection = 0,
  ExpressionSelection = 1,
  FeatureSelection = 2,
  ClothingSelection = 3,
  AccessorySelection = 4, // Swapped with Action
  ActionSelection = 5,    // Swapped with Accessory
  RandomSelection = 6,
  Customization = 7
  // Result step removed
}

export interface StylingOption {
  id: string;
  label: string;
  description: string;
  icon: string; // Emoji or image URL
  promptModifier: string; // The text to send to Gemini
}

export interface AppState {
  currentStep: AppStep;
  gender: Gender | null;
  ageGroup: AgeGroup; // Added AgeGroup
  baseImageBase64: string | null;
  currentImageBase64: string | null;
  history: string[]; // Keep track of image states for undo
  isGenerating: boolean;
  isCustomBaseImage: boolean; // Track if the user uploaded their own base image
  hairColor: string; // Hex color code for hair
  clothingPrimaryColor: string; // Hex for main clothing color
  clothingSecondaryColor: string; // Hex for accent clothing color
  selections: {
    hair: StylingOption | null;
    expression: StylingOption | null;
    feature: StylingOption | null;
    clothing: StylingOption | null;
    action: StylingOption | null;
    accessory: StylingOption | null;
  };
  // Custom Module State
  customAppearanceImg: string | null;
  customAppearanceWeight: number; // 0-100
  customClothingImg: string | null;
  customClothingWeight: number; // 0-100
  customActionImg: string | null;
  customActionWeight: number; // 0-100
  customTextPrompt: string;
}