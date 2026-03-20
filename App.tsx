import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { StepWizard } from './components/StepWizard';
import { SelectionCard } from './components/SelectionCard';
import { 
  AppStep, 
  Gender, 
  AgeGroup,
  StylingOption, 
  AppState 
} from './types';
import { 
  MALE_HAIR_OPTIONS,
  FEMALE_HAIR_OPTIONS,
  EXPRESSION_OPTIONS,
  FEATURE_OPTIONS,
  CLOTHING_OPTIONS,
  ACTION_OPTIONS,
  ACCESSORY_OPTIONS, 
  CHARACTER_ARCHETYPES,
  PRI_MALE_START_IMAGE_URL, 
  PRI_FEMALE_START_IMAGE_URL,
  MID_MALE_START_IMAGE_URL, 
  MID_FEMALE_START_IMAGE_URL,
  MALE_FALLBACK,
  FEMALE_FALLBACK
} from './constants';
import { editCharacterImage, generateCustomCharacterGrid, generateRandomCharacterGrid } from './services/geminiService';
import { urlToBase64, getSrcFromBase64, downloadImage, resizeImageBase64 } from './utils/imageUtils';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// Helpers for randomization
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// --- NEW: Rich Color Palettes (Harmonious, Youthful, Lively) ---
const YOUTHFUL_PALETTES = [
    { name: "多巴胺红蓝", colors: ["#FF4D4D", "#3B82F6", "#FFD93D"] }, 
    { name: "清新薄荷", colors: ["#4ADE80", "#F0FDF4", "#0D9488"] }, 
    { name: "甜美浆果", colors: ["#D946EF", "#FAE8FF", "#6366F1"] }, 
    { name: "海盐气泡", colors: ["#0EA5E9", "#BAE6FD", "#F59E0B"] }, 
    { name: "落日橘光", colors: ["#F97316", "#FEF3C7", "#BE123C"] }, 
    { name: "赛博霓虹", colors: ["#14B8A6", "#111827", "#F472B6"] }, 
    { name: "学院红蓝", colors: ["#1E3A8A", "#FFFFFF", "#DC2626"] }, 
    { name: "梦幻紫罗兰", colors: ["#8B5CF6", "#DDD6FE", "#FBBF24"] }, 
    { name: "青柠柠檬", colors: ["#84CC16", "#FFFF00", "#FFFFFF"] }, 
    { name: "泡泡糖粉", colors: ["#F43F5E", "#FFFFFF", "#60A5FA"] }, 
];

const getRandomYouthfulPalette = () => getRandomItem(YOUTHFUL_PALETTES);

const DEFAULT_HAIR_COLOR = '#2C222B'; // Default to a Dark Warm Brown
const DEFAULT_CLOTHING_PRIMARY = '#3b82f6'; // Blue-500
const DEFAULT_CLOTHING_SECONDARY = '#FFFFFF';

// --- Zoom Modal Component ---
const ZoomModal = ({ isOpen, imageSrc, onClose }: { isOpen: boolean; imageSrc: string | null; onClose: () => void }) => {
    if (!isOpen || !imageSrc) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
                 <button 
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2"
                 >
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                 </button>
                 <img 
                    src={imageSrc} 
                    alt="Zoomed Preview" 
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()} // Prevent close when clicking image
                 />
            </div>
        </div>
    );
};

export default function App() {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } catch (e) {
          console.error("Error checking API key:", e);
          setHasKey(true); // Fallback
        }
      } else {
        setHasKey(true); // Fallback for environments without aistudio
      }
    };
    checkKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true); // Assume success
    }
  };

  const [state, setState] = useState<AppState>({
    currentStep: AppStep.HairSelection, // Start at HairSelection
    gender: Gender.Male, // Default to Male
    ageGroup: AgeGroup.Primary, // Default to Primary School
    baseImageBase64: null,
    currentImageBase64: null,
    history: [],
    isGenerating: false,
    isCustomBaseImage: false,
    hairColor: DEFAULT_HAIR_COLOR, 
    clothingPrimaryColor: DEFAULT_CLOTHING_PRIMARY, 
    clothingSecondaryColor: DEFAULT_CLOTHING_SECONDARY, 
    selections: {
      hair: null,
      expression: null,
      feature: null,
      clothing: null,
      action: null,
      accessory: null
    },
    // Custom Module State
    customAppearanceImg: null,
    customAppearanceWeight: 50,
    customClothingImg: null,
    customClothingWeight: 50,
    customActionImg: null,
    customActionWeight: 50,
    customTextPrompt: ""
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  // Initialize scrolling to top on step change
  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.currentStep]);

  // Load initial image on mount
  useEffect(() => {
    if (!state.baseImageBase64 && !state.isGenerating) {
        updateBaseCharacter(Gender.Male, AgeGroup.Primary);
    }
  }, []);

  // Handle Navigation via Step Wizard
  const handleStepClick = (step: AppStep) => {
      if (state.isGenerating) return;
      if (!state.baseImageBase64) return;
      setState(prev => ({ ...prev, currentStep: step }));
  };

  // Helper to get correct URL based on gender and age group
  const getBaseImageUrl = (gender: Gender, ageGroup: AgeGroup) => {
      if (ageGroup === AgeGroup.Primary) {
          return gender === Gender.Male ? PRI_MALE_START_IMAGE_URL : PRI_FEMALE_START_IMAGE_URL;
      } else {
          return gender === Gender.Male ? MID_MALE_START_IMAGE_URL : MID_FEMALE_START_IMAGE_URL;
      }
  };

  // Unified function to update base character (Gender or Age Group)
  const updateBaseCharacter = async (gender: Gender, ageGroup: AgeGroup) => {
    if (state.isGenerating) return;

    // Update gender/age immediately so UI shows the static image from public folder
    // We clear baseImageBase64/currentImageBase64 to trigger the URL fallback in preview
    setState(prev => ({ 
        ...prev, 
        gender, 
        ageGroup, 
        baseImageBase64: null,
        currentImageBase64: null,
        errorMsg: null,
        isCustomBaseImage: false,
        // Reset selections on switch to avoid incompatibility
        selections: { hair: null, expression: null, feature: null, clothing: null, action: null, accessory: null },
        history: [] 
    }));

    try {
      const baseUrl = getBaseImageUrl(gender, ageGroup);
      
      let base64 = "";
      
      try {
         base64 = await urlToBase64(baseUrl);
      } catch (e: any) {
         console.warn(`Primary image load failed for ${baseUrl}, attempting fallback...`, e);
         // Silent fallback if local file missing
         const fallbackUrl = gender === Gender.Male ? MALE_FALLBACK : FEMALE_FALLBACK;
         base64 = await urlToBase64(fallbackUrl);
      }
      
      const optimizedBase64 = await resizeImageBase64(base64, 1024, 1024);

      setState(prev => ({
        ...prev,
        baseImageBase64: optimizedBase64,
        currentImageBase64: optimizedBase64,
      }));
    } catch (err) {
      console.error("Critical Error Loading Image:", err);
      // Only show error if BOTH primary and fallback fail
      setErrorMsg("无法加载初始角色图片，且备用图片加载失败。");
    }
  };


  // --- Main Generation Logic ---
  const handleGenerate = async () => {
    if (state.isGenerating || !state.baseImageBase64) return;
    
    // Construct Prompt from all selections
    let prompt = "Edit this character. Maintain the exact framing, pose, and identity. ";
    
    // Hair
    if (state.selections.hair) {
        prompt += state.selections.hair.promptModifier;
        prompt += ` Hair color: ${state.hairColor}. `;
    }
    
    // Expression
    if (state.selections.expression) {
        prompt += state.selections.expression.promptModifier + " ";
    }
    
    // Feature
    if (state.selections.feature) {
        prompt += state.selections.feature.promptModifier + " ";
    }
    
    // Clothing
    if (state.selections.clothing) {
        prompt += state.selections.clothing.promptModifier + " ";
        prompt += ` Clothing Primary Color: ${state.clothingPrimaryColor}. `;
        prompt += ` Clothing Secondary Color: ${state.clothingSecondaryColor}. `;
    }

    // Action (New)
    if (state.selections.action) {
        prompt += state.selections.action.promptModifier + " ";
    }
    
    // Accessory
    if (state.selections.accessory) {
        prompt += state.selections.accessory.promptModifier + " ";
    }

    setState(prev => ({ ...prev, isGenerating: true, errorMsg: null }));

    try {
        // Always generate from the CLEAN base image to avoid artifact accumulation
        // Standard generation can handle higher resolution
        const inputImage = await resizeImageBase64(state.baseImageBase64, 1024, 1024); 
        const newImage = await editCharacterImage(inputImage, prompt, 'portrait');
        
        setState(prev => ({
            ...prev,
            currentImageBase64: newImage,
            history: [...prev.history, prev.currentImageBase64 || prev.baseImageBase64!], 
            isGenerating: false
        }));
    } catch (e: any) {
        console.error(e);
        if (e.status === 403 || e.message?.includes("PERMISSION_DENIED")) {
            setHasKey(false);
            setErrorMsg("您的 API Key 权限不足，请确保使用的是已启用结算的付费项目 Key。");
        } else {
            setErrorMsg("生成失败，请重试。");
        }
        setState(prev => ({ ...prev, isGenerating: false }));
    }
  };


  // Handle selection (Accumulate only)
  const applyStyle = (
      option: StylingOption, 
      type: 'hair' | 'expression' | 'feature' | 'clothing' | 'action' | 'accessory'
    ) => {
    setState(prev => ({ 
      ...prev, 
      selections: { ...prev.selections, [type]: option }
    }));
  };

  // Handle Restore Default (Clear selection)
  const handleRestoreDefault = () => {
      const currentSelectionType = 
          state.currentStep === AppStep.HairSelection ? 'hair' :
          state.currentStep === AppStep.ExpressionSelection ? 'expression' :
          state.currentStep === AppStep.FeatureSelection ? 'feature' :
          state.currentStep === AppStep.ClothingSelection ? 'clothing' :
          state.currentStep === AppStep.ActionSelection ? 'action' : 
          state.currentStep === AppStep.AccessorySelection ? 'accessory' : null;

      if (currentSelectionType) {
        setState(prev => ({
            ...prev,
            selections: { ...prev.selections, [currentSelectionType]: null }
        }));
      }
  };

  const handleRandomize = async () => {
    if (state.isGenerating || !state.currentImageBase64) return;
    
    // Set loading state
    setState(prev => ({ ...prev, isGenerating: true, errorMsg: null }));

    try {
        const availableArchetypes = CHARACTER_ARCHETYPES.filter(
            arch => arch.gender === 'Any' || arch.gender === state.gender
        );

        const shuffled = [...availableArchetypes].sort(() => 0.5 - Math.random());
        const selectedArchetypes = shuffled.slice(0, 4);
        
        const variations = [];
        let lastAppliedPalette = null;

        for (let i = 0; i < selectedArchetypes.length; i++) {
            const archetype = selectedArchetypes[i];
            const rPalette = getRandomYouthfulPalette();
            lastAppliedPalette = rPalette;

            const description = `
              Panel ${i + 1} Theme: "${archetype.label}" (ID: ${archetype.id})
              - Visuals: ${archetype.promptDescription}
              - COLOR PALETTE (Apply to clothing/details):
                  * Primary: ${rPalette.colors[0]}
                  * Secondary: ${rPalette.colors[1]}
                  * Accent: ${rPalette.colors[2]}
            `;
            variations.push(description);
        }

        let ageSpecificConstraints = "";
        if (state.ageGroup === AgeGroup.Middle) {
            ageSpecificConstraints = `
            - CLOTHING STYLE: Trendy Teenager Fashion / Gen-Z Streetwear. 
            - KEYWORDS: Cool, stylish, layered outfits, oversized hoodies, denim jackets, varsity style, cargo pants, headphones, modern sneakers.
            - STRICTLY AVOID: Adult business suits, office wear, mature evening gowns, high heels, or overly revealing clothing.
            - VIBE: Energetic, youthful, "Cool Kid", or "Trendy Student".
            `;
        } else {
            ageSpecificConstraints = `
            - CLOTHING STYLE: Cute Primary School Child Fashion.
            - KEYWORDS: Colorful, comfortable, playful, bright t-shirts, dungarees, cute animal patterns, soft fabrics.
            - STRICTLY AVOID: Adult fashion, dark rebellious styles, or complex layered streetwear.
            - VIBE: Innocent, happy, playful, cute.
            `;
        }

        const masterPrompt = `
          Create 4 UNIQUE variations in the 2x2 grid based on these SPECIFIC CHARACTER ARCHETYPES.
          
          GLOBAL CONSTRAINTS:
          1. IDENTITY & AGE: RETAIN the facial features (eyes, mouth, nose) and EXACT AGE.
          2. **CHANGE THE HAIRSTYLE**: The hairstyle MUST change to match the archetype description. Do NOT copy the input hair.
          3. **HAIR COLOR**: STRICTLY use Natural Asian Hair Colors (Black, Dark Brown, Dark Grey). NO bright dyes, NO blonde, NO pink/blue/green hair.
          4. **HAIRSTYLE SHAPE**: Natural and realistic volume. NO exaggerated anime spikes, NO gravity-defying hair, NO massive twin-tails.
          5. TEXTURE: Maintain a SUPER CLEAN, SMOOTH 3D Art Toy style. 
             - Surfaces must be smooth and denoised (like soft vinyl or matte plastic).
             - NO grain, NO film noise, NO realistic skin details/pores/hair strands.
             - High-definition, sharp edges.
          6. CLOTHING: Must be AGE-APPROPRIATE and suitable for school or casual play.
             ${ageSpecificConstraints}
          7. EXPRESSIONS: Natural, cute, and not overly exaggerated.
          8. VIEW: Front-facing portrait.
          
          TOP-LEFT (Variant 1): ${variations[0]}
          TOP-RIGHT (Variant 2): ${variations[1]}
          BOTTOM-LEFT (Variant 3): ${variations[2]}
          BOTTOM-RIGHT (Variant 4): ${variations[3]}
        `;

        // Reduced resolution for grid generation to prevent 500 errors
        const inputImage = await resizeImageBase64(state.currentImageBase64, 512, 512);
        const newImageBase64 = await generateRandomCharacterGrid(inputImage, masterPrompt);

        setState(prev => ({
            ...prev,
            currentImageBase64: newImageBase64,
            history: [...prev.history, prev.currentImageBase64!],
            isGenerating: false,
            hairColor: '#2C222B', 
            clothingPrimaryColor: lastAppliedPalette ? lastAppliedPalette.colors[0] : prev.clothingPrimaryColor,
            clothingSecondaryColor: lastAppliedPalette ? lastAppliedPalette.colors[1] : prev.clothingSecondaryColor,
        }));

    } catch (error: any) {
        console.error("Randomize failed:", error);
        if (error.status === 403 || error.message?.includes("PERMISSION_DENIED")) {
            setHasKey(false);
            setErrorMsg("您的 API Key 权限不足，请确保使用的是已启用结算的付费项目 Key。");
        } else {
            setErrorMsg("随机生成失败，请重试。");
        }
        setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  // --- NEW: Custom Module Handlers ---

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, type: 'appearance' | 'clothing' | 'action') => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64Raw = reader.result as string;
              // Resize reference images to 512 to save payload size
              const resized = await resizeImageBase64(base64Raw.split(',')[1], 512, 512); 
              
              const update: Partial<AppState> = {};
              if (type === 'appearance') update.customAppearanceImg = resized;
              if (type === 'clothing') update.customClothingImg = resized;
              if (type === 'action') update.customActionImg = resized;

              setState(prev => ({ ...prev, ...update }));
          };
          reader.readAsDataURL(file);
      } catch (err) {
          console.error("Upload failed", err);
          setErrorMsg("图片上传失败，请重试");
      }
  };

  const handlePreviewUpload = async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64Raw = reader.result as string;
              // Resize main base image
              const resized = await resizeImageBase64(base64Raw.split(',')[1], 1024, 1024);
              
              setState(prev => ({
                  ...prev,
                  baseImageBase64: resized,
                  currentImageBase64: resized,
                  history: [], // Clear history on new base
                  isCustomBaseImage: true,
                  gender: prev.gender || Gender.Male, // Keep current gender or default
                  // Stay on current step, but clear selections
                  selections: { hair: null, expression: null, feature: null, clothing: null, action: null, accessory: null }
              }));
          };
          reader.readAsDataURL(file);
      } catch (err) {
          console.error("Preview upload failed", err);
          setErrorMsg("上传预览图失败，请重试");
      }
  };

  const removeCustomImage = () => {
      if (state.gender) {
          updateBaseCharacter(state.gender, state.ageGroup); // Re-fetch default
      } else {
          // Fallback if no gender
          setState(prev => ({
              ...prev,
              baseImageBase64: null,
              currentImageBase64: null,
              isCustomBaseImage: false,
              selections: { hair: null, expression: null, feature: null, clothing: null, action: null, accessory: null }
          }));
      }
  };

  const handleCustomGenerate = async () => {
      if (state.isGenerating || !state.currentImageBase64) return;
      
      setState(prev => ({ ...prev, isGenerating: true, errorMsg: null }));

      let finalPrompt = state.customTextPrompt.trim();
      
      const { hair, expression, feature, clothing, action, accessory } = state.selections;
      const activeTraits = [];

      if (hair) {
         activeTraits.push(`Hairstyle: ${hair.label}. ${hair.promptModifier}. Color: ${state.hairColor}`);
      }
      if (expression) {
         activeTraits.push(`Expression: ${expression.label}. ${expression.promptModifier}`);
      }
      if (feature) {
         activeTraits.push(`Face Feature: ${feature.label}. ${feature.promptModifier}`);
      }
      if (clothing) {
         activeTraits.push(`Clothing: ${clothing.label}. ${clothing.promptModifier}. Primary Color: ${state.clothingPrimaryColor}, Secondary Color: ${state.clothingSecondaryColor}`);
      }
      if (action) {
         activeTraits.push(`Action/Pose: ${action.label}. ${action.promptModifier}`);
      }
      if (accessory) {
         activeTraits.push(`Accessory: ${accessory.label}. ${accessory.promptModifier}`);
      }

      if (activeTraits.length > 0) {
          finalPrompt += "\n\nREQUIRED CHARACTER TRAITS (Must Maintain):";
          activeTraits.forEach(trait => {
              finalPrompt += `\n- ${trait}`;
          });
      }

      try {
          // Use reduced resolution (512x512) for input to avoid 500 errors during complex grid generation
          const baseImage = await resizeImageBase64(state.currentImageBase64, 512, 512);
          
          const newImageBase64 = await generateCustomCharacterGrid(
              baseImage,
              finalPrompt,
              state.customAppearanceImg,
              state.customAppearanceWeight,
              state.customClothingImg,
              state.customClothingWeight,
              state.customActionImg,
              state.customActionWeight
          );

          setState(prev => ({
              ...prev,
              currentImageBase64: newImageBase64,
              history: [...prev.history, prev.currentImageBase64!],
              isGenerating: false
          }));

      } catch (error: any) {
          console.error("Custom generation failed", error);
          if (error.status === 403 || error.message?.includes("PERMISSION_DENIED")) {
              setHasKey(false);
              setErrorMsg("您的 API Key 权限不足，请确保使用的是已启用结算的付费项目 Key。");
          } else {
              setErrorMsg("高级定制生成失败，请减少图片大小或重试。");
          }
          setState(prev => ({ ...prev, isGenerating: false }));
      }
  };

  const handleBlueprintRender = async () => {
    if (!state.currentImageBase64 || state.isGenerating) return;
    
    setState(prev => ({ ...prev, isGenerating: true, errorMsg: null }));

    const prompt = `Generate a high-quality 3D character turnaround sheet (Front, Side, Back views) based on this character. Full body, T-Pose.`;

    try {
        // Reduced resolution for blueprint generation stability
        const inputImage = await resizeImageBase64(state.currentImageBase64, 512, 512);
        const newImageBase64 = await editCharacterImage(inputImage, prompt, 'blueprint');
        
        setState(prev => ({
            ...prev,
            currentImageBase64: newImageBase64,
            history: [...prev.history, prev.currentImageBase64!],
            isGenerating: false
        }));
    } catch (error: any) {
        console.error("Blueprint render failed:", error);
        if (error.status === 403 || error.message?.includes("PERMISSION_DENIED")) {
            setHasKey(false);
            setErrorMsg("您的 API Key 权限不足，请确保使用的是已启用结算的付费项目 Key。");
        } else {
            setErrorMsg("生成三视图失败，请重试。");
        }
        setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleGlobalReset = () => {
    // Re-initialize to default state
    // We keep the API key valid since it is global/env
    // We re-select the default gender image
    setState(prev => ({
      ...prev, // Keep hasApiKey status effectively
      currentStep: AppStep.HairSelection,
      gender: Gender.Male,
      ageGroup: AgeGroup.Primary, // Reset to primary
      history: [],
      isGenerating: false,
      isCustomBaseImage: false,
      hairColor: DEFAULT_HAIR_COLOR,
      clothingPrimaryColor: DEFAULT_CLOTHING_PRIMARY,
      clothingSecondaryColor: DEFAULT_CLOTHING_SECONDARY,
      selections: { hair: null, expression: null, feature: null, clothing: null, action: null, accessory: null },
      customAppearanceImg: null,
      customAppearanceWeight: 50,
      customClothingImg: null,
      customClothingWeight: 50,
      customActionImg: null,
      customActionWeight: 50,
      customTextPrompt: ""
    }));
    // Trigger image reload for default gender
    updateBaseCharacter(Gender.Male, AgeGroup.Primary);
  };

  const handleUndo = () => {
      if (state.history.length === 0) {
          handleGlobalReset();
          return;
      }
      const previousImage = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);
      
      setState(prev => ({
          ...prev,
          currentImageBase64: previousImage,
          history: newHistory,
      }));
  };

  const handleDownload = () => {
      if (state.currentImageBase64) {
          const fileName = `my-avatar-${Date.now()}.png`;
          downloadImage(state.currentImageBase64, fileName);
      }
  };

  // Helper to get correct hair list
  const getHairOptions = () => {
      return state.gender === Gender.Male ? MALE_HAIR_OPTIONS : FEMALE_HAIR_OPTIONS;
  };

  // --- Renders ---

  const renderCharacterPreview = () => {
      let loadingText = "AI 正在绘制...";
      if (state.isGenerating) {
          // Random
          if (state.currentStep === AppStep.RandomSelection) loadingText = "正在施展魔法 (随机生成4宫格)...";
          // Custom
          if (state.currentStep === AppStep.Customization) loadingText = "正在进行高级定制 (4宫格生成)...";
          // Standard Generation
          if (state.currentStep >= AppStep.HairSelection && state.currentStep <= AppStep.ActionSelection) {
              loadingText = "正在生成最新造型...";
          }
      }

    const previewSrc = state.currentImageBase64 
        ? getSrcFromBase64(state.currentImageBase64) 
        : getBaseImageUrl(state.gender, state.ageGroup);

    return (
        <div className="relative w-full max-w-full lg:max-w-xl mx-auto aspect-square bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white mb-8 group">
            <div 
                className={`w-full h-full relative cursor-zoom-in ${state.isGenerating ? 'pointer-events-none' : ''}`}
                onClick={() => setZoomedImage(previewSrc)}
            >
                <img 
                src={previewSrc} 
                alt="Character Preview" 
                className={`w-full h-full object-contain bg-slate-50 transition-opacity duration-500 ${state.isGenerating ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                />
            </div>
            
            {!state.isGenerating && (
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                    <label className="bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 p-3 rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110 border border-slate-100 cursor-pointer" title="上传自定义角色图片">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input type="file" className="hidden" accept="image/*" onChange={handlePreviewUpload} />
                    </label>

                    {state.isCustomBaseImage && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeCustomImage();
                            }}
                            className="bg-white/90 hover:bg-red-50 text-red-500 hover:text-red-600 p-3 rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110 border border-slate-100"
                            title="移除自定义图片，恢复默认"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            )}
            
            {!state.isGenerating && (
                 <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
                    {(state.currentStep >= AppStep.HairSelection && state.currentStep <= AppStep.ActionSelection) && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
                            disabled={state.isGenerating || !state.baseImageBase64}
                            className={`flex-1 mr-4 ${(!state.baseImageBase64 && !state.isGenerating) ? 'bg-slate-400 cursor-wait' : 'bg-blue-600/90 hover:bg-blue-700'} text-white font-bold py-3 px-6 rounded-full shadow-xl backdrop-blur-md transition-all transform hover:scale-105 flex items-center justify-center gap-2 border border-blue-400/30`}
                        >
                            <span className="text-xl">{( !state.baseImageBase64 && !state.isGenerating) ? '⏳' : '✨'}</span>
                            {( !state.baseImageBase64 && !state.isGenerating) ? '正在准备基础形象...' : '生成形象 (Generate)'}
                        </button>
                    )}

                    <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                        className="bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 p-3 rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110 border border-slate-100"
                        title="下载当前图片"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                 </div>
            )}

        
        {state.isGenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
                <p className="text-blue-800 font-bold bg-white/80 px-4 py-2 rounded-full shadow-sm">
                    {loadingText}
                </p>
            </div>
        )}
        </div>
    );
  };

  const ResetStepButton = () => (
      <button 
        onClick={handleRestoreDefault}
        disabled={state.isGenerating}
        className="text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-full px-4 py-1.5 transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        title="清空当前选项"
      >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          清空选项
      </button>
  );

  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔑</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">需要配置 API Key</h2>
          <p className="text-slate-600 mb-8">
            为了使用高质量的图像生成功能（Gemini 3.1 Flash Image），您需要选择一个已启用结算的 Google Cloud 项目 API Key。
          </p>
          <div className="space-y-4">
            <button
              onClick={handleOpenKeyDialog}
              className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              选择 API Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-sm text-blue-600 hover:underline"
            >
              了解如何配置结算项目 &rarr;
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 text-slate-800 font-sans pb-12">
      <div ref={topRef}></div>
      
      <ZoomModal isOpen={!!zoomedImage} imageSrc={zoomedImage} onClose={() => setZoomedImage(null)} />

      <header className="p-6 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 mb-2">
            头像设计工作室
        </h1>
        <p className="text-slate-500 mb-6">使用 Generative AI 定制你的专属角色</p>
        
        <div className="flex justify-center items-center gap-4 flex-wrap">
            {/* AGE GROUP TOGGLE */}
            <div className="inline-flex bg-white p-1 rounded-full shadow-md border border-slate-100 relative">
                <div 
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-green-500 rounded-full transition-all duration-300 ease-in-out ${state.ageGroup === AgeGroup.Middle ? 'translate-x-[calc(100%+8px)]' : 'translate-x-0'}`}
                ></div>
                
                <button
                    onClick={() => updateBaseCharacter(state.gender || Gender.Male, AgeGroup.Primary)}
                    disabled={state.isGenerating}
                    className={`relative z-10 px-4 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${state.ageGroup === AgeGroup.Primary ? 'text-white' : 'text-slate-500 hover:text-green-600'}`}
                >
                    🎒 小学生
                </button>
                <button
                    onClick={() => updateBaseCharacter(state.gender || Gender.Male, AgeGroup.Middle)}
                    disabled={state.isGenerating}
                    className={`relative z-10 px-4 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${state.ageGroup === AgeGroup.Middle ? 'text-white' : 'text-slate-500 hover:text-green-600'}`}
                >
                    📚 中学生
                </button>
            </div>

            {/* GENDER TOGGLE */}
            <div className="inline-flex bg-white p-1 rounded-full shadow-md border border-slate-100 relative">
                {/* Slider Background */}
                <div 
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-blue-600 rounded-full transition-all duration-300 ease-in-out ${state.gender === Gender.Female ? 'translate-x-[calc(100%+8px)]' : 'translate-x-0'}`}
                ></div>
                
                <button
                    onClick={() => updateBaseCharacter(Gender.Male, state.ageGroup)}
                    disabled={state.isGenerating}
                    className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${state.gender === Gender.Male ? 'text-white' : 'text-slate-500 hover:text-blue-600'}`}
                >
                    <span>👦</span> 男生
                </button>
                <button
                    onClick={() => updateBaseCharacter(Gender.Female, state.ageGroup)}
                    disabled={state.isGenerating}
                    className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${state.gender === Gender.Female ? 'text-white' : 'text-slate-500 hover:text-blue-600'}`}
                >
                    <span>👧</span> 女生
                </button>
            </div>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <StepWizard 
            currentStep={state.currentStep} 
            onStepClick={handleStepClick}
            isImageReady={!!state.baseImageBase64}
        />

        {errorMsg && (
            <div className="max-w-md mx-auto mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md relative" role="alert">
                <p className="font-bold">错误</p>
                <p>{errorMsg}</p>
                <button onClick={() => setErrorMsg(null)} className="absolute top-2 right-2 font-bold text-red-700">×</button>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto items-start">
          
          <div className="order-1 lg:order-2 sticky top-8 lg:col-span-5">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-slate-700">角色预览</h2>
                 {!state.isGenerating && state.history.length > 0 && (
                     <button 
                        onClick={handleUndo}
                        className="text-sm text-slate-500 hover:text-blue-600 underline"
                     >
                         撤销上一次生成
                     </button>
                 )}
            </div>
            {renderCharacterPreview()}
            
            {state.currentStep === AppStep.Customization && (
                <div className="text-center">
                    <button 
                        onClick={handleGlobalReset}
                        className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
                    >
                        重新开始
                    </button>
                </div>
            )}
          </div>

          <div className="order-2 lg:order-1 lg:col-span-7">
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-white/60">
                
                {/* REMOVED: GenderSelection Block */}

                {state.currentStep === AppStep.HairSelection && (
                <div className="fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-blue-900">第一步：选择发型</h2>
                    </div>
                    
                    <div className="mb-6 p-4 bg-white/70 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                        <label className="font-bold text-slate-700 flex items-center gap-2">
                           <span>🎨</span> 自由选择发色:
                        </label>
                        <div className="flex items-center gap-3">
                            <input 
                                type="color" 
                                value={state.hairColor}
                                onChange={(e) => setState(prev => ({...prev, hairColor: e.target.value}))}
                                className="w-10 h-10 rounded cursor-pointer border-2 border-white shadow-sm"
                            />
                            <span className="text-xs text-slate-500 font-mono bg-gray-100 px-2 py-1 rounded">{state.hairColor}</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-2 custom-scrollbar">
                    <SelectionCard
                        id="default-hair"
                        label="默认发型"
                        description="保持原样 / 清空选项"
                        icon="↩️"
                        selected={state.selections.hair === null}
                        onClick={handleRestoreDefault}
                        disabled={state.isGenerating}
                    />
                    {getHairOptions().map(opt => (
                        <SelectionCard
                        key={opt.id}
                        {...opt}
                        selected={state.selections.hair?.id === opt.id}
                        onClick={() => applyStyle(opt, 'hair')}
                        disabled={state.isGenerating}
                        />
                    ))}
                    </div>
                    
                    <div className="mt-6 text-center">
                         <button 
                            onClick={() => handleStepClick(AppStep.ExpressionSelection)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            disabled={state.isGenerating}
                         >
                             下一步：选择表情 &rarr;
                         </button>
                    </div>
                </div>
                )}

                {state.currentStep === AppStep.ExpressionSelection && (
                <div className="fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-blue-900">第二步：选择表情</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-2 custom-scrollbar">
                    <SelectionCard
                        id="default-expression"
                        label="默认表情"
                        description="保持原样 / 清空选项"
                        icon="😐"
                        selected={state.selections.expression === null}
                        onClick={handleRestoreDefault}
                        disabled={state.isGenerating}
                    />
                    {EXPRESSION_OPTIONS.map(opt => (
                        <SelectionCard
                        key={opt.id}
                        {...opt}
                        selected={state.selections.expression?.id === opt.id}
                        onClick={() => applyStyle(opt, 'expression')}
                        disabled={state.isGenerating}
                        />
                    ))}
                    </div>
                     <div className="mt-6 text-center">
                         <button 
                            onClick={() => handleStepClick(AppStep.FeatureSelection)}
                            className="text-slate-500 hover:text-blue-600 underline"
                         >
                             跳过，下一步 &rarr;
                         </button>
                    </div>
                </div>
                )}

                {state.currentStep === AppStep.FeatureSelection && (
                <div className="fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-blue-900">第三步：面部特征</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-2 custom-scrollbar">
                    <SelectionCard
                        id="default-feature"
                        label="无特征"
                        description="保持原样 / 清空选项"
                        icon="✨"
                        selected={state.selections.feature === null}
                        onClick={handleRestoreDefault}
                        disabled={state.isGenerating}
                    />
                    {FEATURE_OPTIONS.map(opt => (
                        <SelectionCard
                        key={opt.id}
                        {...opt}
                        selected={state.selections.feature?.id === opt.id}
                        onClick={() => applyStyle(opt, 'feature')}
                        disabled={state.isGenerating}
                        />
                    ))}
                    </div>
                     <div className="mt-6 text-center">
                         <button 
                            onClick={() => handleStepClick(AppStep.ClothingSelection)}
                            className="text-slate-500 hover:text-blue-600 underline"
                         >
                             跳过，选择服装 &rarr;
                         </button>
                    </div>
                </div>
                )}

                {state.currentStep === AppStep.ClothingSelection && (
                <div className="fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-blue-900">第四步：选择服装</h2>
                    </div>
                    
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white/70 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                            <label className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <span>👔</span> 主色调:
                            </label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    value={state.clothingPrimaryColor}
                                    onChange={(e) => setState(prev => ({...prev, clothingPrimaryColor: e.target.value}))}
                                    className="w-8 h-8 rounded cursor-pointer border border-white shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-white/70 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                            <label className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <span>✨</span> 点缀色:
                            </label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    value={state.clothingSecondaryColor}
                                    onChange={(e) => setState(prev => ({...prev, clothingSecondaryColor: e.target.value}))}
                                    className="w-8 h-8 rounded cursor-pointer border border-white shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-2 custom-scrollbar">
                    <SelectionCard
                        id="default-clothing"
                        label="默认服装"
                        description="保持原样 / 清空选项"
                        icon="👕"
                        selected={state.selections.clothing === null}
                        onClick={handleRestoreDefault}
                        disabled={state.isGenerating}
                    />
                    {CLOTHING_OPTIONS.map(opt => (
                        <SelectionCard
                        key={opt.id}
                        {...opt}
                        selected={state.selections.clothing?.id === opt.id}
                        onClick={() => applyStyle(opt, 'clothing')}
                        disabled={state.isGenerating}
                        />
                    ))}
                    </div>

                    <div className="mt-6 text-center">
                         <button 
                            onClick={() => handleStepClick(AppStep.AccessorySelection)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            disabled={state.isGenerating || !state.selections.clothing}
                         >
                             下一步：选择配饰 &rarr;
                         </button>
                    </div>
                </div>
                )}

                {state.currentStep === AppStep.AccessorySelection && (
                <div className="fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-blue-900">第五步：选择配饰</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-2 custom-scrollbar">
                    <SelectionCard
                        id="default-accessory"
                        label="无配饰"
                        description="保持原样 / 清空选项"
                        icon="🚫"
                        selected={state.selections.accessory === null}
                        onClick={handleRestoreDefault}
                        disabled={state.isGenerating}
                    />
                    {ACCESSORY_OPTIONS.map(opt => (
                        <SelectionCard
                        key={opt.id}
                        {...opt}
                        selected={state.selections.accessory?.id === opt.id}
                        onClick={() => applyStyle(opt, 'accessory')}
                        disabled={state.isGenerating}
                        />
                    ))}
                    </div>
                    <div className="mt-6 text-center">
                         <button 
                            onClick={() => handleStepClick(AppStep.ActionSelection)}
                            className="text-slate-500 hover:text-blue-600 underline"
                         >
                             跳过，选择动作 &rarr;
                         </button>
                    </div>
                </div>
                )}

                {state.currentStep === AppStep.ActionSelection && (
                <div className="fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-blue-900">第六步：选择动作</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-2 custom-scrollbar">
                    <SelectionCard
                        id="default-action"
                        label="无动作"
                        description="保持原样 / 清空选项"
                        icon="🧍"
                        selected={state.selections.action === null}
                        onClick={handleRestoreDefault}
                        disabled={state.isGenerating}
                    />
                    {ACTION_OPTIONS.map(opt => (
                        <SelectionCard
                        key={opt.id}
                        {...opt}
                        selected={state.selections.action?.id === opt.id}
                        onClick={() => applyStyle(opt, 'action')}
                        disabled={state.isGenerating}
                        />
                    ))}
                    </div>
                    <div className="mt-6 text-center">
                         <button 
                            onClick={() => handleStepClick(AppStep.RandomSelection)}
                            className="text-slate-500 hover:text-blue-600 underline"
                         >
                             跳过，试试手气 &rarr;
                         </button>
                    </div>
                </div>
                )}

                {state.currentStep === AppStep.RandomSelection && (
                    <div className="fade-in flex flex-col items-center justify-center py-10">
                        <h2 className="text-3xl font-bold text-blue-900 mb-6">第七步：随机盲盒</h2>
                        <p className="text-slate-600 mb-8 max-w-md text-center">
                            AI 将从 30+ 种经典校园与二次元人设（如热血体育生、高冷学姐、科技极客等）中随机抽取 4 个，为您生成独一无二的造型！
                        </p>

                        <button
                            onClick={handleRandomize}
                            disabled={state.isGenerating}
                            className={`
                                relative group w-64 h-64 rounded-full flex flex-col items-center justify-center
                                bg-gradient-to-br from-blue-500 via-teal-500 to-emerald-500
                                text-white shadow-2xl transition-all duration-300 transform
                                hover:scale-105 active:scale-95
                                ${state.isGenerating ? 'opacity-70 cursor-wait animate-pulse' : 'hover:shadow-blue-300/50'}
                            `}
                        >
                            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            <span className="text-6xl mb-4 filter drop-shadow-md">🎲</span>
                            <span className="text-2xl font-bold filter drop-shadow-md">
                                {state.isGenerating ? '生成中...' : '抽取人设'}
                            </span>
                            <span className="text-xs mt-2 opacity-80">点击解锁随机身份</span>
                        </button>

                         <div className="mt-12 text-center">
                            <button 
                                onClick={() => handleStepClick(AppStep.Customization)}
                                className="text-slate-500 hover:text-blue-600 underline"
                            >
                                跳过，自定义 &rarr;
                            </button>
                        </div>
                    </div>
                )}
                
                {state.currentStep === AppStep.Customization && (
                    <div className="fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-blue-900">第八步：自定义 (高级)</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Appearance Reference */}
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                                    <div className="flex justify-between mb-2">
                                        <label className="font-bold text-slate-700 flex items-center gap-1 text-xs md:text-sm">
                                            💇‍♀️ 只参考发型
                                        </label>
                                        {state.customAppearanceImg && (
                                            <button 
                                                onClick={() => setState(prev => ({...prev, customAppearanceImg: null}))}
                                                className="text-red-500 text-xs hover:underline"
                                            >
                                                删除
                                            </button>
                                        )}
                                    </div>
                                    
                                    {state.customAppearanceImg ? (
                                        <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden mb-3">
                                            <img src={getSrcFromBase64(state.customAppearanceImg)} className="w-full h-full object-cover" alt="Appearance Ref" />
                                        </div>
                                    ) : (
                                        <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors p-4 md:p-6">
                                            <span className="text-2xl mb-2">📤</span>
                                            <span className="text-xs text-slate-500 text-center">点击上传发型参考图</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'appearance')} />
                                        </label>
                                    )}

                                    <div className="mt-auto pt-3 border-t border-slate-100">
                                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                                            <span>参考: {state.customAppearanceWeight}%</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max="100" 
                                            value={state.customAppearanceWeight}
                                            onChange={(e) => setState(prev => ({...prev, customAppearanceWeight: parseInt(e.target.value)}))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            disabled={!state.customAppearanceImg}
                                        />
                                    </div>
                                </div>

                                {/* Clothing Reference */}
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                                    <div className="flex justify-between mb-2">
                                        <label className="font-bold text-slate-700 flex items-center gap-1 text-xs md:text-sm">
                                            👗 服装配饰
                                        </label>
                                        {state.customClothingImg && (
                                            <button 
                                                onClick={() => setState(prev => ({...prev, customClothingImg: null}))}
                                                className="text-red-500 text-xs hover:underline"
                                            >
                                                删除
                                            </button>
                                        )}
                                    </div>
                                    
                                    {state.customClothingImg ? (
                                        <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden mb-3">
                                            <img src={getSrcFromBase64(state.customClothingImg)} className="w-full h-full object-cover" alt="Clothing Ref" />
                                        </div>
                                    ) : (
                                        <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors p-4 md:p-6">
                                            <span className="text-2xl mb-2">📤</span>
                                            <span className="text-xs text-slate-500 text-center">点击上传衣服参考</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'clothing')} />
                                        </label>
                                    )}

                                    <div className="mt-auto pt-3 border-t border-slate-100">
                                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                                            <span>参考: {state.customClothingWeight}%</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max="100" 
                                            value={state.customClothingWeight}
                                            onChange={(e) => setState(prev => ({...prev, customClothingWeight: parseInt(e.target.value)}))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            disabled={!state.customClothingImg}
                                        />
                                    </div>
                                </div>

                                {/* Action Reference */}
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                                    <div className="flex justify-between mb-2">
                                        <label className="font-bold text-slate-700 flex items-center gap-1 text-xs md:text-sm">
                                            🤸 动作/姿势
                                        </label>
                                        {state.customActionImg && (
                                            <button 
                                                onClick={() => setState(prev => ({...prev, customActionImg: null}))}
                                                className="text-red-500 text-xs hover:underline"
                                            >
                                                删除
                                            </button>
                                        )}
                                    </div>
                                    
                                    {state.customActionImg ? (
                                        <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden mb-3">
                                            <img src={getSrcFromBase64(state.customActionImg)} className="w-full h-full object-cover" alt="Action Ref" />
                                        </div>
                                    ) : (
                                        <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors p-4 md:p-6">
                                            <span className="text-2xl mb-2">📤</span>
                                            <span className="text-xs text-slate-500 text-center">点击上传动作参考</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'action')} />
                                        </label>
                                    )}

                                    <div className="mt-auto pt-3 border-t border-slate-100">
                                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                                            <span>参考: {state.customActionWeight}%</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max="100" 
                                            value={state.customActionWeight}
                                            onChange={(e) => setState(prev => ({...prev, customActionWeight: parseInt(e.target.value)}))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            disabled={!state.customActionImg}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <label className="font-bold text-slate-700 block mb-2 text-sm flex items-center gap-2">
                                    <span>🪄</span> 补充描述 / 咒语 (Prompt):
                                </label>
                                <textarea 
                                    className="w-full h-24 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                    placeholder="例如：把背景改成校园操场，添加一些樱花飘落..."
                                    value={state.customTextPrompt}
                                    onChange={(e) => setState(prev => ({...prev, customTextPrompt: e.target.value}))}
                                />
                                <div className="mt-4 flex justify-end gap-3">
                                    <button 
                                        onClick={handleBlueprintRender}
                                        disabled={state.isGenerating}
                                        className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-6 py-2 rounded-full font-bold transition-colors disabled:opacity-50 text-sm"
                                    >
                                        📐 生成三视图 (Blueprint)
                                    </button>
                                    <button 
                                        onClick={handleCustomGenerate}
                                        disabled={state.isGenerating}
                                        className="bg-blue-600 text-white px-8 py-2 rounded-full font-bold shadow hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                                    >
                                        <span>✨</span> 生成高级定制
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}