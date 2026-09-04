import { BenchmarkSample } from '../types';

export const BENCHMARK_SAMPLES: BenchmarkSample[] = [
  {
    id: 'sample-ai-portrait-1',
    title: 'Photorealistic Studio Portrait with Iris Discrepancies',
    category: 'portraits',
    groundTruth: 'AI_GENERATED',
    groundTruthPercentage: 96,
    generatorUsed: 'Midjourney v6 Photorealism Pipeline',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80', // High quality portrait for testing
    description: 'Ultra-smooth synthetic skin texture, non-matching catchlights in left vs right pupil, and subtle hair fusion behind the ear.',
    keyArtifactToLookFor: 'Mismatched ocular reflections, unnatural earlobe curvature, plasticized micro-textures on forehead.',
    difficulty: 'Hard'
  },
  {
    id: 'sample-real-camera-1',
    title: 'Authentic Street Photography with Optical Sensor Noise',
    category: 'authentic_dslr',
    groundTruth: 'REAL_PHOTOGRAPH',
    groundTruthPercentage: 99,
    cameraUsed: 'Sony A7R IV · 85mm f/1.4 GM (ISO 400)',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
    description: 'True camera optical depth of field, consistent chromatic aberration on specular highlights, and natural skin pores with authentic Bayer matrix sensor noise.',
    keyArtifactToLookFor: 'Consistent ISO grain distribution, natural epidermal pores, physics-accurate specular light falloff.',
    difficulty: 'Medium'
  },
  {
    id: 'sample-ai-hands-2',
    title: 'Coffee Shop Scene with Anatomical Finger Fusion',
    category: 'hands_limbs',
    groundTruth: 'AI_GENERATED',
    groundTruthPercentage: 94,
    generatorUsed: 'Flux.1 Schnell / Stable Diffusion XL',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    description: 'Subtle extra knuckle creases, distorted mug rim geometry, and incoherent background text signage.',
    keyArtifactToLookFor: 'Anatomical finger joint anomalies, unreadable glyphs on background poster, non-elliptical rim curve.',
    difficulty: 'Easy'
  },
  {
    id: 'sample-real-macro-2',
    title: 'Authentic Nature Macro with True Lens Optics',
    category: 'authentic_dslr',
    groundTruth: 'REAL_PHOTOGRAPH',
    groundTruthPercentage: 100,
    cameraUsed: 'Canon EOS R5 · 100mm f/2.8L Macro IS USM',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
    description: 'Natural focal plane degradation, authentic micro-hairs and organic epidermal texture with zero diffusion blurring.',
    keyArtifactToLookFor: 'Organic surface irregularities, true optical bokeh without segmentation halos, natural specular highlights.',
    difficulty: 'Medium'
  },
  {
    id: 'sample-ai-deepfake-3',
    title: 'Synthetic Face-Swap on Executive Speech',
    category: 'deepfakes',
    groundTruth: 'AI_GENERATED',
    groundTruthPercentage: 91,
    generatorUsed: 'RoOP / SimSwap Deepfake Model',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    description: 'Color temperature boundary mismatch along the jawline, frequency discrepancy between face mask and original neck texture.',
    keyArtifactToLookFor: 'Jawline blending seam, mismatched skin tone saturation between face and ears/neck, resolution boundary.',
    difficulty: 'Extremely Hard'
  },
  {
    id: 'sample-real-landscape-3',
    title: 'RAW Mountain Landscape with True Atmospheric Haze',
    category: 'landscapes',
    groundTruth: 'REAL_PHOTOGRAPH',
    groundTruthPercentage: 98,
    cameraUsed: 'Nikon Z7 II · 24-70mm f/2.8 S',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    description: 'Physically accurate Rayleigh atmospheric scattering, complex fractal foliage geometry with zero repetitive generative hallucination.',
    keyArtifactToLookFor: 'Natural atmospheric depth gradients, organic tree branch fractal distribution, lens flare physics.',
    difficulty: 'Medium'
  },
  {
    id: 'sample-ai-architecture-4',
    title: 'Futuristic Cyberpunk Interior with Impossible Geometry',
    category: 'surreal',
    groundTruth: 'AI_GENERATED',
    groundTruthPercentage: 98,
    generatorUsed: 'Midjourney v6 Architecture Pipeline',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
    description: 'Impossible vanishing points, staircase leading into a solid column, and non-convergent ceiling light beams.',
    keyArtifactToLookFor: 'Perspective point divergence, repeating structural texture artifacts, unphysical reflective caustics.',
    difficulty: 'Easy'
  },
  {
    id: 'sample-real-crowd-4',
    title: 'Authentic Concert Crowd with High ISO Sensor Grain',
    category: 'authentic_dslr',
    groundTruth: 'REAL_PHOTOGRAPH',
    groundTruthPercentage: 97,
    cameraUsed: 'Fujifilm X-T4 · 56mm f/1.2 (ISO 3200)',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
    description: 'Authentic Poisson/Gaussian sensor noise profile, coherent human silhouettes and real legible stage typography.',
    keyArtifactToLookFor: 'Uniform high-ISO digital noise across shadow regions, legitimate typographic signage in background.',
    difficulty: 'Hard'
  }
];
