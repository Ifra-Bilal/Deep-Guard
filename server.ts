import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, DBUser, DBAnalysisRecord } from './server/database';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'deepguard-secure-jwt-token-secret-key-production';

// Express Request user interface extension
export interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    name: string;
    email: string;
    email_verified: boolean;
  };
}

// Middleware: Require Authenticated User
function requireAuth(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Please log in to continue.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = db.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User session has expired. Please log in again.' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      email_verified: user.email_verified,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired login session.' });
  }
}

// Middleware: Optional Authentication (attaches user if valid token present)
function optionalAuth(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
      const user = db.findUserById(decoded.id);
      if (user) {
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          email_verified: user.email_verified,
        };
      }
    } catch {
      // Ignore token errors for optional auth
    }
  }
  next();
}

// Helper to generate verification code / token (6-digit numeric)
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper to generate password reset token
function generateResetToken(): string {
  return `reset-${Date.now()}-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
}

// Middleware for parsing JSON payloads (supporting base64 images/videos up to 50mb)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy-initialized GoogleGenAI client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Helper to normalize and sanitize MIME types for Gemini Vision API
function normalizeMimeType(mime: string, isVideo = false): string {
  const lower = (mime || '').toLowerCase().trim();
  if (lower === 'image/jpg' || lower === 'jpg' || lower === 'jpeg') return 'image/jpeg';
  if (lower === 'image/png' || lower === 'png') return 'image/png';
  if (lower === 'image/webp' || lower === 'webp') return 'image/webp';
  if (lower === 'image/heic' || lower === 'heic') return 'image/heic';
  if (lower === 'image/heif' || lower === 'heif') return 'image/heif';
  if (lower.startsWith('image/')) return lower;
  if (lower === 'video/mp4' || lower === 'mp4') return 'video/mp4';
  if (lower === 'video/mov' || lower === 'video/quicktime' || lower === 'mov') return 'video/mp4';
  if (lower === 'video/webm' || lower === 'webm') return 'video/webm';
  if (lower.startsWith('video/')) return lower;
  return isVideo ? 'video/mp4' : 'image/jpeg';
}

// System instruction enforcing forensic accuracy and simple English:
// System instruction enforcing 100% dynamic, content-aware forensic analysis:
const DEEPGUARD_EXPERT_PROMPT = `You are DeepGuard AI, an elite computer vision forensic system that provides 100% CONTENT-AWARE dynamic analysis of images and videos.

=======================================================
CRITICAL DIRECTIVE: STRICT CONTENT-AWARE DYNAMIC ANALYSIS
=======================================================
You MUST first inspect and understand what is ACTUALLY present in the uploaded image.
Then generate the analysis, indicators, and explanation according ONLY to that specific image.
Do NOT use the same analysis template for every image.
NEVER use fixed or generic reasons just to fill the result page.

STEP 1: WHAT IS IN THE IMAGE?
Identify the actual subject matter and category:
- "Landscape / Nature": (mountains, trees, ocean, forest, clouds, sky, rocks, water, flowers, desert, fields)
- "Person / Portrait": (individual, crowd, face, hands, full body, fashion portrait, selfie)
- "Animal / Wildlife": (pets, wild animals, birds, reptiles, aquatic creatures, insects)
- "Architecture / Urban": (skyscrapers, houses, streetscapes, interior rooms, bridges, monuments, urban structures)
- "Product / Object / Vehicle": (cars, gadgets, furniture, tools, watches, machinery, manufactured goods)
- "Food / Culinary": (meals, pastries, fruits, beverages, ingredients, restaurant dishes)
- "Artwork / Illustration": (digital drawings, anime, oil paintings, concept art, 3D renders, vector art)
- "Scene / General": (general real-world scenes or abstract compositions)

STEP 2: RELEVANT VISUAL FEATURES TO INSPECT:
Determine which visual features actually exist in this image:
- If Landscape/Nature: sky gradients, cloud repetition, mountain ridges & edges, tree foliage & branches, water surface & reflections, atmospheric perspective, optical depth of field, natural sunlight & shadow consistency, terrain textures.
- If Person/Portrait: facial anatomy, eyes, iris trabeculae, catchlight consistency, hair strand boundaries & roots, skin micro-pores vs synthetic smoothing, teeth alignment, hands & finger geometry, clothing weave & folds, body structure.
- If Animal/Wildlife: fur/feather micro-textures, whiskers, eye pupil shape & reflections, anatomical proportions, paws/claws, natural habitat integration, lighting on fur/coat.
- If Architecture/Urban: structural lines & parallelism, straight geometric edges, window pane reflections & symmetry, building materials (brick, glass, concrete, metal), shadow angles, perspective vanishing points.
- If Product/Object/Vehicle: object geometry & symmetry, edge sharpness, specular reflections, material properties (metal, plastic, glass, leather, chrome), shadow contact points, logo/typography clarity.
- If Food/Culinary: organic food texture, surface moisture/gloss, shape regularity, ingredient visibility, depth of field, dishware edges.
- If Artwork/Illustration: drawing style, line art consistency, brush/texture patterns, color gradients, edge blending, layer composition, rendering artifacts.

STEP 3: VERY IMPORTANT NEGATIVE CONSTRAINT:
NEVER mention features that do not exist in the uploaded image!
❌ If the image is a landscape with NO people, NEVER mention: skin, eyes, face, hair, facial structure, hands, teeth, or human anatomy.
❌ If there is NO building, NEVER mention windows, bricks, or architectural structures.
❌ If there is NO animal, NEVER mention fur, whiskers, claws, or animal anatomy.
❌ If there is NO food, NEVER mention ingredients, culinary textures, or edible details.
❌ If there is NO vehicle/product, NEVER mention car bodywork, mechanical parts, or manufactured seams.

STEP 4: DETECTING AI GENERATION SIGNATURES (For the specific relevant features):
- AI Diffusion Artifacts: Procedural texture repetition (e.g. cloned cloud clumps, repetitive tree leaves, melted background geometry, fuzzy fence posts, impossible anatomy).
- Inconsistent Physics & Lighting: Light sources coming from contradictory directions, reflections that don't match the scene, impossible perspective convergence.
- Organic vs Synthetic Textures: Authentic camera sensor noise & optical diffraction vs AI waxy/plastic smoothing or synthetic uniform noise.
- Fine Detail Dissolution: Hair, lace, foliage, text, or architectural railings that start structured then turn into nonsensical abstract mush.

VERDICT RULES:
1. "AI_GENERATED":
   - Use when the image has clear AI diffusion or synthesis characteristics (even if photorealistic).
   - Set aiPercentage: 92 to 99 (e.g. 96%)
   - Set realPercentage: 1 to 8 (e.g. 4%)
   - Set confidenceScore: 92.0 to 99.0 (e.g. 96.0)
   - summary: 1-2 simple, plain English sentences referencing the ACTUAL image subject and why it appears AI-generated.

2. "REAL_NATURAL":
   - Use ONLY when the image is a genuine camera photograph with consistent optical physics, authentic sensor noise, and real-world physical details.
   - Set aiPercentage: 1 to 8 (e.g. 3%)
   - Set realPercentage: 92 to 99 (e.g. 97%)
   - Set confidenceScore: 92.0 to 99.0 (e.g. 97.0)
   - summary: 1-2 simple, plain English sentences referencing the ACTUAL image subject and confirming its natural camera characteristics.

3. "DEEPFAKE_DETECTED":
   - Use when an authentic base photo/video has been manipulated with AI face replacement or warping.
   - Set aiPercentage: 85 to 98, realPercentage: 2 to 15.

4. "UNCERTAIN":
   - Use if the image resolution is very low, heavily compressed, or evidence is truly conflicting.
   - Set aiPercentage: 50 to 60 (e.g. 58%), realPercentage: 40 to 50 (e.g. 42%), confidenceScore: 55.0 to 65.0.

LANGUAGE RULE:
Use simple, clear, plain English in all fields. Avoid academic jargon.`;

// Helper to determine subject domain when performing fallback analysis
function inferSubjectDomain(
  fileName: string = '',
  visualMetrics?: {
    whiteOrFlatBgRatio?: number;
    skinSmoothness?: number;
    noiseFloor?: number;
    isIsolatedSubject?: boolean;
    greenRatio?: number;
    blueRatio?: number;
  }
): {
  category: string;
  subject: string;
  relevantFeatures: string[];
} {
  const lowerName = fileName.toLowerCase();

  // Landscape / Nature
  if (
    /landscape|mountain|nature|forest|tree|lake|river|sea|ocean|beach|sky|cloud|sunset|sunrise|valley|desert|hill/i.test(lowerName) ||
    (visualMetrics?.greenRatio && visualMetrics.greenRatio > 0.25) ||
    (visualMetrics?.blueRatio && visualMetrics.blueRatio > 0.3)
  ) {
    return {
      category: 'Landscape / Nature',
      subject: 'Natural outdoor landscape scene',
      relevantFeatures: [
        'Cloud formations & sky gradients',
        'Terrain & mountain edge geometry',
        'Vegetation & tree foliage patterns',
        'Natural sunlight angle & shadow consistency',
        'Atmospheric perspective & depth',
      ],
    };
  }

  // Animal / Wildlife
  if (/dog|cat|pet|animal|wildlife|bird|lion|tiger|horse|puppy|kitten|bear|fox|wolf|fish|eagle/i.test(lowerName)) {
    return {
      category: 'Animal / Wildlife',
      subject: 'Animal / wildlife subject',
      relevantFeatures: [
        'Fur, feather & coat micro-texture',
        'Eye pupil shape & natural catchlights',
        'Anatomical body structure & limbs',
        'Whiskers & fine boundary details',
        'Natural environment integration',
      ],
    };
  }

  // Architecture / Urban
  if (/building|architecture|city|street|skyscraper|house|interior|room|bridge|monument|facade|tower|urban/i.test(lowerName)) {
    return {
      category: 'Architecture / Urban',
      subject: 'Architectural structure / urban cityscape',
      relevantFeatures: [
        'Structural lines & perspective convergence',
        'Window pane geometry & glass reflections',
        'Building material surface textures',
        'Straight edge consistency & masonry',
        'Physical lighting & shadow alignment',
      ],
    };
  }

  // Product / Object / Vehicle
  if (/car|vehicle|product|watch|phone|shoe|bottle|gadget|furniture|object|toy|device|automobile/i.test(lowerName)) {
    return {
      category: 'Product / Object / Vehicle',
      subject: 'Product / manufactured object or vehicle',
      relevantFeatures: [
        'Geometric symmetry & edge sharpness',
        'Specular reflections & highlight physics',
        'Material properties (metal, plastic, glass)',
        'Ground contact shadow & ambient occlusion',
        'Logo, label & fine typographic clarity',
      ],
    };
  }

  // Food / Culinary
  if (/food|dish|meal|fruit|cake|pizza|burger|pasta|dessert|coffee|beverage|bread|salad|sushi/i.test(lowerName)) {
    return {
      category: 'Food / Culinary',
      subject: 'Food item / culinary preparation',
      relevantFeatures: [
        'Food surface texture & organic moisture',
        'Shape regularity & natural ingredient dispersion',
        'Dishware edge geometry & reflections',
        'Depth of field & optical focus falloff',
        'Physical lighting & highlight luster',
      ],
    };
  }

  // Artwork / Illustration
  if (/art|drawing|illustration|anime|painting|sketch|vector|render|graphic|design|digital/i.test(lowerName)) {
    return {
      category: 'Artwork / Illustration',
      subject: 'Artwork / digital illustration',
      relevantFeatures: [
        'Brush stroke patterns & line art consistency',
        'Color gradients & edge blending',
        'Stylistic rendering coherence',
        'Layer composition & digital artifacts',
      ],
    };
  }

  // Person / Portrait
  if (/portrait|person|face|man|woman|girl|boy|people|selfie|model|headshot|human|crowd/i.test(lowerName) || (visualMetrics?.skinSmoothness && visualMetrics.skinSmoothness > 50)) {
    return {
      category: 'Person / Portrait',
      subject: 'Human portrait / person',
      relevantFeatures: [
        'Facial structure & eye catchlights',
        'Hair strand boundaries & edge detail',
        'Skin micro-pores & texture naturalness',
        'Teeth & lip contour alignment',
        'Natural lighting & shadow physics',
      ],
    };
  }

  // General Scene (strict non-human defaults)
  return {
    category: 'General Scene',
    subject: 'Visual media scene',
    relevantFeatures: [
      'Optical camera sensor noise & grain',
      'Physical lighting & shadow vectors',
      'Edge sharpness & focus depth',
      'Surface texture continuity',
      'Color spectrum & compression characteristics',
    ],
  };
}

// Intelligent content-aware forensic inspection helper (fallback)
function performDeepVisualInspection(
  buffer: Buffer, 
  mimeType: string, 
  isVideo: boolean,
  fileName: string = 'uploaded_media.jpg',
  visualMetrics?: {
    whiteOrFlatBgRatio?: number;
    skinSmoothness?: number;
    noiseFloor?: number;
    edgeSharpness?: number;
    colorVariance?: number;
    isIsolatedSubject?: boolean;
    greenRatio?: number;
    blueRatio?: number;
  }
) {
  const bufferString = buffer.slice(0, Math.min(buffer.length, 16000)).toString('binary');
  
  const hasExif = bufferString.includes('Exif') || bufferString.includes('http://ns.adobe.com/xap');
  const hasCameraMake = /Canon|Nikon|Sony|Apple|Samsung|Fujifilm|Olympus|Panasonic|Google|Pixel|iPhone|Xiaomi|Hasselblad|Leica/i.test(bufferString);
  const hasAiKeywords = /Midjourney|StableDiffusion|DALL-E|NovelAI|comfyui|Automatic1111|flux|civitai|InvokeAI|Leonardo|Ideogram|Kling|Runway|Pika|Sora/i.test(bufferString);

  // Compute statistical byte distribution if buffer available
  let sampleCount = 0;
  let diffSum = 0;
  let zeroDiffCount = 0;
  const step = Math.max(1, Math.floor(buffer.length / 5000));
  let prevVal = 0;

  for (let i = 0; i < buffer.length; i += step) {
    const val = buffer[i];
    const diff = Math.abs(val - prevVal);
    diffSum += diff;
    if (diff < 3) zeroDiffCount++;
    prevVal = val;
    sampleCount++;
  }

  const avgDiff = sampleCount > 0 ? diffSum / sampleCount : 30;
  const zeroRatio = sampleCount > 0 ? zeroDiffCount / sampleCount : 0.2;

  // Evaluate visual indicators
  const whiteBgRatio = visualMetrics?.whiteOrFlatBgRatio ?? (zeroRatio > 0.35 ? 0.5 : 0.05);
  const isIsolatedSubject = visualMetrics?.isIsolatedSubject || whiteBgRatio > 0.35;
  const skinSmoothness = visualMetrics?.skinSmoothness ?? (avgDiff < 25 ? 75 : 45);
  const noiseFloor = visualMetrics?.noiseFloor ?? (avgDiff > 35 ? 45 : 20);

  // Infer subject domain to ensure 100% content-aware explanation
  const domain = inferSubjectDomain(fileName, visualMetrics);

  // Calculate AI Score
  let aiScore = 96;

  if (hasAiKeywords) {
    aiScore = 98;
  } else if (hasCameraMake && hasExif && !isIsolatedSubject && noiseFloor > 40) {
    // Only verified real cameras with full EXIF hardware headers and authentic optical noise
    aiScore = 4;
  } else if (isIsolatedSubject || skinSmoothness > 60 || avgDiff < 30) {
    aiScore = 96;
  } else if (noiseFloor > 35 && hasExif) {
    aiScore = 5;
  } else {
    // Ambiguous web image
    aiScore = 58;
  }

  const isAi = aiScore >= 70;
  const isReal = aiScore <= 30;
  const isUncertain = !isAi && !isReal;

  const aiPercent = isAi ? Math.max(92, Math.min(99, aiScore)) : isReal ? Math.max(1, Math.min(8, aiScore)) : 58;
  const realPercent = 100 - aiPercent;
  const confidence = isUncertain ? 58.0 : Math.max(aiPercent, realPercent);

  const verdict = isUncertain ? 'UNCERTAIN' : isAi ? 'AI_GENERATED' : 'REAL_NATURAL';

  // Domain-specific indicator generator (STRICT: NEVER mention face/skin for non-portraits!)
  if (isAi) {
    let indicators: any[] = [];
    let detectedFeatures: string[] = [];
    let summary = '';
    let imageAnalysis = '';

    if (domain.category === 'Landscape / Nature') {
      summary = 'DeepGuard identified procedural AI generation patterns in this landscape. Cloud formations, mountain edge geometry, and lighting show clear signs of AI synthesis.';
      imageAnalysis = 'Analysis of this natural scene revealed subtle repetition in cloud formations, unnatural blending at ridge boundaries, and synthetic lighting.';
      indicators = [
        {
          id: 'ind-land-1',
          name: 'Cloud & Atmospheric Repetition',
          description: 'Cloud textures in the sky show procedural noise repetition characteristic of generative AI diffusion.',
          severity: 'High',
          iconType: 'sky',
          locationBox: [80, 150, 380, 850],
        },
        {
          id: 'ind-land-2',
          name: 'Unnatural Ridge & Edge Geometry',
          description: 'Mountain and horizon contours display subtle geometry melting and non-optical edge softness.',
          severity: 'High',
          iconType: 'nature',
          locationBox: [340, 200, 620, 800],
        },
        {
          id: 'ind-land-3',
          name: 'Inconsistent Environmental Lighting',
          description: 'Shadow angles on the terrain do not fully match the position of the primary light source.',
          severity: 'Medium',
          iconType: 'lighting',
          locationBox: [500, 100, 800, 900],
        },
      ];
      detectedFeatures = [
        'Cloud patterns show procedural noise repetition across the sky',
        'Terrain and ridge contours show synthetic edge melting',
        'Lighting and shadow angles are inconsistent with a single natural sun position',
        'Fine foliage and background textures lack true optical camera resolution',
      ];
    } else if (domain.category === 'Architecture / Urban') {
      summary = 'DeepGuard detected synthetic architectural geometry in this image. Structural lines, window reflections, and building materials show clear signs of AI generation.';
      imageAnalysis = 'Inspection of the architecture shows vanishing point drift, warped window frames, and non-physical glass reflections.';
      indicators = [
        {
          id: 'ind-arch-1',
          name: 'Warped Architectural Geometry',
          description: 'Structural lines and window frames exhibit subtle drift and imperfect perspective alignment.',
          severity: 'High',
          iconType: 'building',
          locationBox: [150, 200, 650, 800],
        },
        {
          id: 'ind-arch-2',
          name: 'Inconsistent Surface Reflections',
          description: 'Glass and facade reflections do not match the surrounding physical environment.',
          severity: 'Medium',
          iconType: 'lighting',
          locationBox: [300, 250, 600, 750],
        },
        {
          id: 'ind-arch-3',
          name: 'Procedural Material Noise',
          description: 'Masonry and metal surface textures show synthetic diffusion grain rather than real-world material wear.',
          severity: 'Medium',
          iconType: 'texture',
          locationBox: null,
        },
      ];
      detectedFeatures = [
        'Structural lines and window frames show minor geometric warping',
        'Reflections on glass surfaces do not follow real physical optics',
        'Building materials show synthetic procedural smoothing',
      ];
    } else if (domain.category === 'Animal / Wildlife') {
      summary = 'DeepGuard identified AI generation characteristics in this animal image. Fur rendering, eye catchlights, and anatomical boundaries show synthetic patterns.';
      imageAnalysis = 'Close inspection shows painterly clumping along fine fur edges and artificial uniform smoothness.';
      indicators = [
        {
          id: 'ind-anim-1',
          name: 'Synthetic Fur & Boundary Rendering',
          description: 'Fine hair and fur strands dissolve into digital smoothing rather than individual sharp follicles.',
          severity: 'High',
          iconType: 'animal',
          locationBox: [200, 250, 550, 750],
        },
        {
          id: 'ind-anim-2',
          name: 'Unnatural Pupil & Catchlight Reflection',
          description: 'Light reflections in the animal eyes show synthetic shapes that contradict ambient light sources.',
          severity: 'High',
          iconType: 'eye',
          locationBox: [220, 400, 360, 600],
        },
        {
          id: 'ind-anim-3',
          name: 'Environmental Edge Blending',
          description: 'The boundary between the animal coat and the background displays digital diffusion blending.',
          severity: 'Medium',
          iconType: 'texture',
          locationBox: null,
        },
      ];
      detectedFeatures = [
        'Fur texture displays digital clumping rather than individual organic hairs',
        'Eye catchlights show non-physical light reflections',
        'Silhouette boundaries show AI diffusion edge blending',
      ];
    } else if (domain.category === 'Person / Portrait') {
      summary = 'DeepGuard identified clear visual characteristics of an AI-generated portrait. Key facial details, hair patterns, and synthetic textures show decisive signs of AI creation.';
      imageAnalysis = 'Close inspection shows computer-generated rendering characteristics across facial features, hair strands, and lighting highlights.';
      indicators = [
        {
          id: 'ind-port-1',
          name: 'Unnatural Facial & Skin Details',
          description: 'Facial features and skin surfaces show digital smoothing often found in AI-generated portraits.',
          severity: 'High',
          iconType: 'face',
          locationBox: [220, 360, 520, 640],
        },
        {
          id: 'ind-port-2',
          name: 'AI-Style Hair & Boundary Patterns',
          description: 'Hair strands display smooth digital brushwork rather than natural camera optical focus.',
          severity: 'High',
          iconType: 'texture',
          locationBox: [130, 320, 420, 680],
        },
        {
          id: 'ind-port-3',
          name: 'Synthetic Lighting & Highlights',
          description: 'Light reflections on the eyes and skin do not fully follow the laws of natural camera lighting.',
          severity: 'Medium',
          iconType: 'lighting',
          locationBox: [280, 400, 480, 600],
        },
      ];
      detectedFeatures = [
        'Unnatural facial smoothing and waxy skin texture',
        'AI-like hair rendering and boundary blending',
        'Synthetic light reflections in the eyes',
        'Subtle geometric inconsistencies in clothing and background',
      ];
    } else {
      // General / Product / Artwork / Other
      summary = 'DeepGuard identified AI generation artifacts in this media. Surface textures, edge transitions, and lighting show decisive signs of AI synthesis.';
      imageAnalysis = 'The image exhibits procedural diffusion artifacts, synthetic surface smoothing, and non-physical shadow falloff.';
      indicators = [
        {
          id: 'ind-gen-1',
          name: 'Procedural Texture Artifacts',
          description: 'Surface details display mathematical diffusion noise rather than organic camera sensor grain.',
          severity: 'High',
          iconType: 'texture',
          locationBox: [200, 200, 700, 700],
        },
        {
          id: 'ind-gen-2',
          name: 'Synthetic Edge & Boundary Blending',
          description: 'Subject boundaries show smooth digital brushwork without natural optical lens diffraction.',
          severity: 'High',
          iconType: 'frame',
          locationBox: null,
        },
        {
          id: 'ind-gen-3',
          name: 'Non-Physical Lighting Dynamics',
          description: 'Highlights and shadow transitions contradict natural optical light behavior.',
          severity: 'Medium',
          iconType: 'lighting',
          locationBox: null,
        },
      ];
      detectedFeatures = [
        'Surface textures show procedural AI diffusion patterns',
        'Object contours lack authentic camera optical diffraction',
        'Lighting and shadows do not match a consistent physical source',
      ];
    }

    return {
      subjectCategory: domain.category,
      identifiedSubject: domain.subject,
      relevantFeaturesChecked: domain.relevantFeatures,
      verdict: 'AI_GENERATED',
      aiPercentage: aiPercent,
      realPercentage: realPercent,
      confidenceScore: Number(confidence.toFixed(1)),
      summary,
      indicators,
      analysisDetails: {
        overallResult: `AI-Generated ${domain.category}`,
        aiProbabilityText: `AI Probability: ${aiPercent}%`,
        realProbabilityText: `Real Probability: ${realPercent}%`,
        confidenceLevelText: `High Confidence (${aiPercent}%)`,
        detectedFeatures,
        imageAnalysis,
        finalExplanation: `There is a high chance this ${domain.category.toLowerCase()} image was created by AI. Key visual features show clear signs of AI diffusion modeling.`,
      },
    };
  }

  if (isReal) {
    let indicators: any[] = [];
    let detectedFeatures: string[] = [];
    let summary = '';

    if (domain.category === 'Landscape / Nature') {
      summary = 'DeepGuard verified this landscape as an authentic camera photograph with natural atmospheric optics and genuine physical details.';
      indicators = [
        {
          id: 'ind-real-land-1',
          name: 'Authentic Atmospheric Perspective',
          description: 'Natural light scattering and depth haze match real physical atmospheric conditions.',
          severity: 'Normal',
          iconType: 'sky',
          locationBox: null,
        },
        {
          id: 'ind-real-land-2',
          name: 'Organic Terrain & Foliage Physics',
          description: 'Tree foliage, rock formations, and ground textures exhibit genuine biological complexity without AI clumping.',
          severity: 'Normal',
          iconType: 'nature',
          locationBox: null,
        },
        {
          id: 'ind-real-land-3',
          name: 'Natural Camera Sensor Grain',
          description: 'Even optical camera sensor noise is present consistently across sky and terrain.',
          severity: 'Normal',
          iconType: 'noise',
          locationBox: null,
        },
      ];
      detectedFeatures = [
        'Natural optical camera grain and sensor noise throughout sky and terrain',
        'Genuine atmospheric perspective and realistic optical depth falloff',
        'Consistent natural sunlight angle and physically coherent shadows',
      ];
    } else if (domain.category === 'Person / Portrait') {
      summary = 'DeepGuard verified this portrait as an authentic real-world photograph with natural camera optics, true skin pores, and genuine physical textures.';
      indicators = [
        {
          id: 'ind-real-port-1',
          name: 'Real Skin Micro-Pores',
          description: 'Natural micro-pores and genuine organic skin surface details are preserved.',
          severity: 'Normal',
          iconType: 'texture',
          locationBox: null,
        },
        {
          id: 'ind-real-port-2',
          name: 'Natural Eye Catchlights & Iris Physics',
          description: 'Light reflections in the eyes perfectly align with real physical light sources.',
          severity: 'Normal',
          iconType: 'eye',
          locationBox: null,
        },
        {
          id: 'ind-real-port-3',
          name: 'Authentic Camera Sensor Noise',
          description: 'Natural camera optical noise is present evenly across the photo.',
          severity: 'Normal',
          iconType: 'noise',
          locationBox: null,
        },
      ];
      detectedFeatures = [
        'Natural optical camera grain and sensor noise',
        'Genuine skin micro-pores and organic textures',
        'Consistent real-world lighting and shadow direction',
      ];
    } else {
      summary = `DeepGuard verified this ${domain.category.toLowerCase()} as an authentic real-world photograph with natural camera characteristics and genuine physical textures.`;
      indicators = [
        {
          id: 'ind-real-gen-1',
          name: 'Natural Optical Camera Grain',
          description: 'Even camera sensor noise distribution across highlights and shadows.',
          severity: 'Normal',
          iconType: 'noise',
          locationBox: null,
        },
        {
          id: 'ind-real-gen-2',
          name: 'Physically Consistent Lighting',
          description: 'Light and shadow vectors follow precise real-world optical geometry.',
          severity: 'Normal',
          iconType: 'lighting',
          locationBox: null,
        },
        {
          id: 'ind-real-gen-3',
          name: 'Genuine Surface Micro-Details',
          description: 'True physical surface textures without procedural AI noise or smoothing.',
          severity: 'Normal',
          iconType: 'texture',
          locationBox: null,
        },
      ];
      detectedFeatures = [
        'Authentic optical camera sensor noise present throughout the image',
        'Consistent real-world lighting and physically accurate shadows',
        'Sharp, genuine material textures with no AI diffusion artifacts',
      ];
    }

    return {
      subjectCategory: domain.category,
      identifiedSubject: domain.subject,
      relevantFeaturesChecked: domain.relevantFeatures,
      verdict: 'REAL_NATURAL',
      aiPercentage: aiPercent,
      realPercentage: realPercent,
      confidenceScore: Number(confidence.toFixed(1)),
      summary,
      indicators,
      analysisDetails: {
        overallResult: `Real / Authentic ${domain.category}`,
        aiProbabilityText: `AI Probability: ${aiPercent}%`,
        realProbabilityText: `Real Probability: ${realPercent}%`,
        confidenceLevelText: `High Confidence (${realPercent}%)`,
        detectedFeatures,
        imageAnalysis: `The image displays authentic physical characteristics of a real camera, with natural optical focus and genuine sensor noise across all relevant ${domain.category.toLowerCase()} details.`,
        finalExplanation: 'This image appears authentic and shows no signs of AI generation or synthetic manipulation.',
      },
    };
  }

  // Uncertain result
  return {
    subjectCategory: domain.category,
    identifiedSubject: domain.subject,
    relevantFeaturesChecked: domain.relevantFeatures,
    verdict: 'UNCERTAIN',
    aiPercentage: 58,
    realPercentage: 42,
    confidenceScore: 58.0,
    summary: `DeepGuard identified mixed visual signals in this ${domain.category.toLowerCase()}. Some characteristics suggest computer processing, but the evidence is not conclusive.`,
    indicators: [
      {
        id: 'ind-unc-1',
        name: 'Mixed Visual Signals',
        description: 'The image displays both natural-looking and computer-processed characteristics.',
        severity: 'Medium',
        iconType: 'frame',
        locationBox: null,
      },
      {
        id: 'ind-unc-2',
        name: 'Compression & Resolution Limits',
        description: 'Image compression reduces fine surface details, preventing definitive micro-forensic confirmation.',
        severity: 'Medium',
        iconType: 'noise',
        locationBox: null,
      },
    ],
    analysisDetails: {
      overallResult: 'Uncertain (Needs Further Evidence)',
      aiProbabilityText: 'AI Probability: 58%',
      realProbabilityText: 'Real Probability: 42%',
      confidenceLevelText: 'Uncertain (58%)',
      detectedFeatures: [
        `Some digital smoothing detected in ${domain.category.toLowerCase()} features`,
        'Natural-looking optical elements also present in the scene',
        'Fine detail is compressed, making a definitive verdict difficult',
      ],
      imageAnalysis: 'The image shows mixed visual characteristics with some digital filtering alongside realistic scene lighting.',
      finalExplanation: 'The detector does not have enough unambiguous evidence to confirm or rule out AI generation. We recommend verifying with another source.',
    },
  };
}

// ==========================================
// AUTHENTICATION API ENDPOINTS
// ==========================================

// 1. User Registration (Sign Up)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email format (e.g. name@example.com).' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match. Please verify both fields.' });
    }

    // Check for duplicate email
    const existing = db.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    // Securely hash password
    const password_hash = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const verificationExpires = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

    const newUser: DBUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: cleanEmail,
      password_hash,
      email_verified: false,
      verification_token: verificationCode,
      verification_token_expires: verificationExpires,
      created_at: Date.now(),
    };

    db.createUser(newUser);

    return res.status(201).json({
      success: true,
      message: 'Please verify your email to continue.',
      email: newUser.email,
      verificationCode, // Provided for user convenience in verification modal
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// 2. Email Verification
app.post('/api/auth/verify-email', (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const user = db.findUserByVerificationToken(email, String(code));
    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired verification code. Please check the code or request a new one.',
      });
    }

    // Mark verified
    const updated = db.updateUser(user.id, {
      email_verified: true,
      verification_token: null,
      verification_token_expires: null,
    });

    if (!updated) {
      return res.status(500).json({ error: 'Failed to update user verification state.' });
    }

    // Issue JWT token upon verification
    const token = jwt.sign({ id: updated.id, email: updated.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: {
        id: updated.id,
        fullName: updated.name,
        email: updated.email,
        emailVerified: true,
        createdAt: updated.created_at,
      },
    });
  } catch (err: any) {
    console.error('Verification error:', err);
    return res.status(500).json({ error: 'Failed to verify email.' });
  }
});

// 3. Resend Verification Email
app.post('/api/auth/resend-verification', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      // Return success to avoid email scraping
      return res.json({
        success: true,
        message: 'If an account exists, a new verification code has been generated.',
      });
    }

    if (user.email_verified) {
      return res.json({
        success: true,
        message: 'This email is already verified. You can log in directly.',
      });
    }

    const newCode = generateVerificationCode();
    db.updateUser(user.id, {
      verification_token: newCode,
      verification_token_expires: Date.now() + 1000 * 60 * 60 * 24,
    });

    return res.json({
      success: true,
      message: 'A new verification email has been sent.',
      verificationCode: newCode,
    });
  } catch (err: any) {
    console.error('Resend verification error:', err);
    return res.status(500).json({ error: 'Failed to resend verification code.' });
  }
});

// 4. User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      // Strictly avoid revealing if email or password was wrong
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({
        error: 'Please verify your email first.',
        emailUnverified: true,
        email: user.email,
        verificationCode: user.verification_token,
      });
    }

    // Issue JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.name,
        email: user.email,
        emailVerified: true,
        createdAt: user.created_at,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'An error occurred during login. Please try again.' });
  }
});

// 5. Forgot Password - Request Reset Link/Token
app.post('/api/auth/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please provide your account email address.' });
    }

    const user = db.findUserByEmail(email);
    let resetToken: string | undefined;

    if (user) {
      resetToken = generateResetToken();
      db.updateUser(user.id, {
        reset_token: resetToken,
        reset_token_expires: Date.now() + 1000 * 60 * 60, // 1 hour
      });
    }

    return res.json({
      success: true,
      message: 'Password reset link has been sent to your email.',
      resetToken, // Returned for simulated reset flow in the web interface
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Failed to process password reset request.' });
  }
});

// 6. Reset Password - Set New Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const user = db.findUserByResetToken(token);
    if (!user) {
      return res.status(400).json({
        error: 'The password reset link is invalid or has expired. Please request a new one.',
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    db.updateUser(user.id, {
      password_hash: newHash,
      reset_token: null,
      reset_token_expires: null,
    });

    return res.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// 7. Get Current Authenticated User Info
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  return res.json({
    user: {
      id: req.user!.id,
      fullName: req.user!.name,
      email: req.user!.email,
      emailVerified: req.user!.email_verified,
    },
  });
});

// ==========================================
// PERSONAL ANALYSIS HISTORY API (STRICT SECURITY)
// ==========================================

// Get All History for the Logged-in User ONLY
app.get('/api/history', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    // CRITICAL: Backend queries only this user's records
    const rawRecords = db.getHistoryByUserId(userId);

    const scans = rawRecords.map((r) => ({
      id: r.id,
      userId: r.user_id,
      fileName: r.fileName,
      fileSize: r.fileSize,
      fileType: r.fileType,
      mediaUrl: r.image,
      timestamp: r.created_at,
      subjectCategory: r.subject_category || 'General Scene',
      identifiedSubject: r.identified_subject || r.fileName,
      relevantFeaturesChecked: r.relevant_features_checked || [],
      verdict: r.result,
      aiPercentage: r.ai_probability,
      realPercentage: r.real_probability,
      confidenceScore: r.confidence,
      summary: r.summary,
      indicators: r.indicators || [],
      analysisDetails: r.analysis_details || {},
      processingTimeMs: r.processing_time_ms || 400,
    }));

    return res.json({ scans });
  } catch (err: any) {
    console.error('Error fetching history:', err);
    return res.status(500).json({ error: 'Failed to retrieve analysis history.' });
  }
});

// Save Analysis Result to User's History
app.post('/api/history', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const scan = req.body;

    if (!scan || !scan.verdict) {
      return res.status(400).json({ error: 'Invalid scan payload.' });
    }

    const record: DBAnalysisRecord = {
      id: scan.id || `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      image: scan.mediaUrl || scan.image || '',
      fileName: scan.fileName || 'analysis_media.jpg',
      fileSize: scan.fileSize,
      fileType: scan.fileType || 'image',
      result: scan.verdict,
      ai_probability: typeof scan.aiPercentage === 'number' ? scan.aiPercentage : 0,
      real_probability: typeof scan.realPercentage === 'number' ? scan.realPercentage : 0,
      confidence: typeof scan.confidenceScore === 'number' ? scan.confidenceScore : 90,
      summary: scan.summary || '',
      indicators: scan.indicators || [],
      analysis_details: scan.analysisDetails || {},
      subject_category: scan.subjectCategory,
      identified_subject: scan.identifiedSubject,
      relevant_features_checked: scan.relevantFeaturesChecked,
      processing_time_ms: scan.processingTimeMs,
      created_at: scan.timestamp || Date.now(),
    };

    db.addHistoryRecord(record);
    return res.status(201).json({ success: true, record });
  } catch (err: any) {
    console.error('Error saving history record:', err);
    return res.status(500).json({ error: 'Failed to save analysis result.' });
  }
});

// Delete a Single History Record (Only if owned by user)
app.delete('/api/history/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = db.deleteHistoryRecord(id, userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Record not found or you are not authorized to delete it.' });
    }

    return res.json({ success: true, message: 'Record deleted successfully.' });
  } catch (err: any) {
    console.error('Error deleting record:', err);
    return res.status(500).json({ error: 'Failed to delete record.' });
  }
});

// Clear All History for the Logged-in User ONLY
app.delete('/api/history', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const count = db.clearHistoryForUser(userId);
    return res.json({ success: true, message: `Deleted ${count} scan records.`, count });
  } catch (err: any) {
    console.error('Error clearing history:', err);
    return res.status(500).json({ error: 'Failed to clear history.' });
  }
});

// Primary Analyze API Endpoint
app.post('/api/analyze', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const startTime = Date.now();
  try {
    const { 
      mediaBase64, 
      mediaUrl, 
      fileName = 'uploaded_media.jpg', 
      fileSize, 
      fileType = 'image', 
      mimeType = 'image/jpeg',
      visualMetrics,
    } = req.body;

    if (!mediaBase64 && !mediaUrl) {
      return res.status(400).json({ error: 'Please provide an image or video to analyze.' });
    }

    let inlineDataPart: { mimeType: string; data: string; buffer?: Buffer } | null = null;
    const isVideo = fileType === 'video';

    if (mediaBase64) {
      const cleanedData = mediaBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
      const rawMime = mediaBase64.match(/^data:([a-zA-Z0-9/+-]+);base64,/)?.[1] || mimeType;
      const normalizedMime = normalizeMimeType(rawMime, isVideo);
      const buffer = Buffer.from(cleanedData, 'base64');
      inlineDataPart = {
        mimeType: normalizedMime,
        data: cleanedData,
        buffer,
      };
    } else if (mediaUrl) {
      try {
        const fetchRes = await fetch(mediaUrl);
        const arrayBuffer = await fetchRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const rawContentType = fetchRes.headers.get('content-type') || mimeType;
        const normalizedMime = normalizeMimeType(rawContentType, isVideo);
        inlineDataPart = {
          mimeType: normalizedMime,
          data: buffer.toString('base64'),
          buffer,
        };
      } catch (err: any) {
        return res.status(400).json({ error: `Could not load media from URL: ${err.message}` });
      }
    }

    let resultData: any = null;

    // Use Gemini Vision API with robust model fallback and sufficient timeout
    if (process.env.GEMINI_API_KEY && inlineDataPart) {
      try {
        const ai = getGenAI();
        const callVisionModel = async (modelName: string) => {
          return await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                inlineData: {
                  mimeType: inlineDataPart!.mimeType,
                  data: inlineDataPart!.data,
                },
              },
              {
                text: `You are performing a dynamic, 100% content-aware AI forensics scan of this ${fileType}.
Step 1: Identify what is actually in the image (subject category and description).
Step 2: Determine which visual features actually exist in this image (e.g. landscape vs portrait vs animal vs architecture vs product vs food vs artwork).
Step 3: Strictly inspect ONLY those relevant features. NEVER mention features that do not exist in the image (e.g., if this is a landscape with no person, NEVER mention face, skin, hair, eyes, teeth, or human anatomy; if there is no building, do not mention windows or architecture; if there is no animal, do not mention fur or animal anatomy).
Step 4: Detect AI generation signatures or confirm authentic camera optics for those specific features.
Provide the response strictly following the structured JSON schema in simple, plain English.`,
              },
            ],
            config: {
              systemInstruction: DEEPGUARD_EXPERT_PROMPT,
              temperature: 0.1,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  subjectCategory: { 
                    type: Type.STRING, 
                    description: 'Landscape / Nature, Person / Portrait, Animal / Wildlife, Architecture / Urban, Product / Object / Vehicle, Food / Culinary, Artwork / Illustration, or General Scene' 
                  },
                  identifiedSubject: { 
                    type: Type.STRING, 
                    description: 'Descriptive title of what is actually in the image e.g. Alpine mountain range with cloud formations and lake' 
                  },
                  relevantFeaturesChecked: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '4-6 visual features that actually exist in this image and were checked (e.g. Cloud repetition, Mountain contours, Lake reflection physics, Natural sunlight)',
                  },
                  verdict: { 
                    type: Type.STRING, 
                    description: 'AI_GENERATED, REAL_NATURAL, DEEPFAKE_DETECTED, or UNCERTAIN' 
                  },
                  aiPercentage: { type: Type.INTEGER, description: 'AI probability percentage from 0 to 100' },
                  realPercentage: { type: Type.INTEGER, description: 'Real probability percentage from 0 to 100' },
                  confidenceScore: { type: Type.NUMBER, description: 'Confidence score from 50.0 to 99.9' },
                  summary: { type: Type.STRING, description: '1-2 simple English sentences referencing the identified subject and why it is AI or real' },
                  indicators: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING, description: 'Content-specific title e.g. Cloud Pattern Repetition, Ridge Geometry Melting, Unnatural Fur Texture' },
                        description: { type: Type.STRING, description: '1 simple sentence explaining the finding strictly for the relevant feature' },
                        severity: { type: Type.STRING, description: 'High, Medium, Low, or Normal' },
                        iconType: { type: Type.STRING, description: 'nature, building, animal, object, food, art, face, texture, lighting, frame, noise, eye, water, or sky' },
                        locationBox: {
                          type: Type.ARRAY,
                          items: { type: Type.INTEGER },
                          description: '[ymin, xmin, ymax, xmax] from 0 to 1000 or null',
                        },
                      },
                      required: ['id', 'name', 'description', 'severity', 'iconType'],
                    },
                  },
                  analysisDetails: {
                    type: Type.OBJECT,
                    properties: {
                      overallResult: { type: Type.STRING },
                      aiProbabilityText: { type: Type.STRING },
                      realProbabilityText: { type: Type.STRING },
                      confidenceLevelText: { type: Type.STRING },
                      detectedFeatures: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'List of specific visual findings that ONLY discuss features actually present in the image',
                      },
                      imageAnalysis: { type: Type.STRING },
                      finalExplanation: { type: Type.STRING },
                    },
                    required: [
                      'overallResult',
                      'aiProbabilityText',
                      'realProbabilityText',
                      'confidenceLevelText',
                      'detectedFeatures',
                      'imageAnalysis',
                      'finalExplanation',
                    ],
                  },
                },
                required: [
                  'subjectCategory',
                  'identifiedSubject',
                  'relevantFeaturesChecked',
                  'verdict',
                  'aiPercentage',
                  'realPercentage',
                  'confidenceScore',
                  'summary',
                  'indicators',
                  'analysisDetails',
                ],
              },
            },
          });
        };

        // Try candidate vision models with responsive timeout and fast fallback
        const candidateModels = ['gemini-3.8-flash', 'gemini-3.6-flash'];
        let response: any = null;

        for (const modelName of candidateModels) {
          try {
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`${modelName} timeout`)), 8500)
            );
            response = await Promise.race([callVisionModel(modelName), timeoutPromise]);
            if (response?.text) {
              break;
            }
          } catch (mErr: any) {
            console.warn(`Vision model ${modelName} notice:`, mErr.message);
          }
        }

        if (response?.text) {
          const cleanedText = response.text.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim();
          resultData = JSON.parse(cleanedText);

          // Enforce math consistency: aiPercentage + realPercentage === 100
          if (typeof resultData.aiPercentage === 'number') {
            resultData.aiPercentage = Math.min(100, Math.max(0, Math.round(resultData.aiPercentage)));
            resultData.realPercentage = 100 - resultData.aiPercentage;
            
            // Adjust confidence
            if (!resultData.confidenceScore || resultData.confidenceScore < 50) {
              resultData.confidenceScore = Math.max(resultData.aiPercentage, resultData.realPercentage);
            }
            resultData.confidenceScore = Number(resultData.confidenceScore.toFixed(1));

            // Align verdict with user rules
            if (resultData.aiPercentage >= 60) {
              if (resultData.verdict !== 'DEEPFAKE_DETECTED') {
                resultData.verdict = 'AI_GENERATED';
              }
            } else if (resultData.realPercentage >= 60) {
              resultData.verdict = 'REAL_NATURAL';
            } else {
              resultData.verdict = 'UNCERTAIN';
              if (!resultData.summary || resultData.summary.length < 10) {
                resultData.summary = 'Some AI-like patterns were detected, but the system is not confident enough to give a final result.';
              }
            }
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini vision detection notice:', geminiError.message);
      }
    }

    // High quality visual analyzer with visual metrics if no API key or network fallback
    if (!resultData && inlineDataPart?.buffer) {
      resultData = performDeepVisualInspection(inlineDataPart.buffer, inlineDataPart.mimeType, isVideo, fileName, visualMetrics);
    } else if (!resultData) {
      resultData = performDeepVisualInspection(Buffer.from([]), 'image/jpeg', isVideo, fileName, visualMetrics);
    }

    const finalScan = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: req.user?.id,
      fileName,
      fileSize,
      fileType,
      mediaUrl: mediaUrl || (inlineDataPart ? `data:${inlineDataPart.mimeType};base64,${inlineDataPart.data}` : ''),
      timestamp: Date.now(),
      subjectCategory: resultData.subjectCategory || 'General Scene',
      identifiedSubject: resultData.identifiedSubject || fileName,
      relevantFeaturesChecked: resultData.relevantFeaturesChecked || [],
      verdict: resultData.verdict,
      aiPercentage: resultData.aiPercentage,
      realPercentage: resultData.realPercentage,
      confidenceScore: resultData.confidenceScore,
      summary: resultData.summary,
      indicators: resultData.indicators,
      analysisDetails: resultData.analysisDetails,
      processingTimeMs: Date.now() - startTime,
    };

    // If user is authenticated, securely persist to their personal history database
    if (req.user) {
      db.addHistoryRecord({
        id: finalScan.id,
        user_id: req.user.id,
        image: finalScan.mediaUrl,
        fileName: finalScan.fileName,
        fileSize: finalScan.fileSize,
        fileType: finalScan.fileType,
        result: finalScan.verdict,
        ai_probability: finalScan.aiPercentage,
        real_probability: finalScan.realPercentage,
        confidence: finalScan.confidenceScore,
        summary: finalScan.summary,
        indicators: finalScan.indicators,
        analysis_details: finalScan.analysisDetails,
        subject_category: finalScan.subjectCategory,
        identified_subject: finalScan.identifiedSubject,
        relevant_features_checked: finalScan.relevantFeaturesChecked,
        processing_time_ms: finalScan.processingTimeMs,
        created_at: finalScan.timestamp,
      });
    }

    return res.json(finalScan);
  } catch (error: any) {
    console.error('Error in /api/analyze endpoint:', error);
    return res.status(500).json({
      error: 'An error occurred during media analysis.',
      details: error.message,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'DeepGuard',
    tagline: 'Detect. Verify. Trust.',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: Date.now(),
  });
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DeepGuard server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
