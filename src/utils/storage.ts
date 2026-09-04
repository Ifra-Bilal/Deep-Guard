import { ScanResult, UserProfile, DashboardStats } from '../types';

const USER_STORAGE_KEY = 'deepguard_current_user';
const SCANS_STORAGE_KEY = 'deepguard_scan_history';

// Initial realistic default scan records
export const INITIAL_DEMO_SCANS: ScanResult[] = [
  {
    id: 'scan-sample-01',
    fileName: 'ai_portrait_face_01.png',
    fileSize: 1845200,
    fileType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
    timestamp: Date.now() - 1000 * 60 * 35, // 35 mins ago
    verdict: 'AI_GENERATED',
    aiPercentage: 96,
    realPercentage: 4,
    confidenceScore: 96.0,
    summary: 'DeepGuard identified visual characteristics of an AI-generated image. The facial smoothness, hair patterns, and lighting details show clear signs of AI creation.',
    indicators: [
      {
        id: 'ind-1',
        name: 'Unnatural Facial Details',
        description: 'Some facial features look unusually smooth and computer-generated rather than like a real photo.',
        severity: 'High',
        iconType: 'face',
        locationBox: [280, 320, 680, 680]
      },
      {
        id: 'ind-2',
        name: 'AI-Like Hair & Texture Patterns',
        description: 'The hair strands and surface details have a digital painted texture commonly seen in AI images.',
        severity: 'High',
        iconType: 'texture',
        locationBox: [350, 380, 560, 620]
      },
      {
        id: 'ind-3',
        name: 'Inconsistent Lighting',
        description: 'The direction of the light and soft glow does not follow the physical laws of natural camera lighting.',
        severity: 'Medium',
        iconType: 'lighting',
        locationBox: [310, 410, 380, 590]
      }
    ],
    analysisDetails: {
      overallResult: 'AI-Generated Image',
      aiProbabilityText: 'AI Probability: 96%',
      realProbabilityText: 'Real Probability: 4%',
      confidenceLevelText: 'High Confidence (96%)',
      detectedFeatures: [
        'Unnatural facial details with computer smoothing',
        'AI-like hair patterns with digital brushwork',
        'Unusual smooth skin texture lacking true camera pores',
        'Inconsistent lighting and soft artificial glow'
      ],
      imageAnalysis: 'When inspecting the image closely, the facial features, skin texture, and hair patterns show computer-generated artistic rendering rather than real camera photography.',
      finalExplanation: 'High chance that this image was made by AI. We recommend treating this media as AI-generated.'
    }
  },
  {
    id: 'scan-sample-02',
    fileName: 'camera_capture_street.jpg',
    fileSize: 3410000,
    fileType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    verdict: 'REAL_NATURAL',
    aiPercentage: 3,
    realPercentage: 97,
    confidenceScore: 97.0,
    summary: 'DeepGuard verified this media as an authentic real-world photograph. Natural camera sensor noise, authentic texture, and consistent lighting were confirmed.',
    indicators: [
      {
        id: 'ind-4',
        name: 'Natural Camera Sensor Noise',
        description: 'Natural optical camera grain is present evenly across dark and light areas of the photo.',
        severity: 'Normal',
        iconType: 'noise',
        locationBox: null
      },
      {
        id: 'ind-5',
        name: 'Real Skin Pores & Textures',
        description: 'Fine natural skin details, true surface texture, and organic variations are visible.',
        severity: 'Normal',
        iconType: 'texture',
        locationBox: null
      },
      {
        id: 'ind-6',
        name: 'Consistent Natural Lighting',
        description: 'Light and shadow fall naturally across the subject and the background.',
        severity: 'Normal',
        iconType: 'lighting',
        locationBox: null
      }
    ],
    analysisDetails: {
      overallResult: 'Real / Natural Image',
      aiProbabilityText: 'AI Probability: 3%',
      realProbabilityText: 'Real Probability: 97%',
      confidenceLevelText: 'High Confidence (97%)',
      detectedFeatures: [
        'Natural camera optical grain and sensor noise',
        'Real skin pores and organic facial textures',
        'Consistent real-world lighting and shadow direction'
      ],
      imageAnalysis: 'The image displays authentic physical characteristics of a real camera, with natural optical focus and genuine sensor noise.',
      finalExplanation: 'This image appears authentic and shows no signs of AI generation or face swapping.'
    }
  },
  {
    id: 'scan-sample-03',
    fileName: 'interview_video_clip.mp4',
    fileSize: 14200000,
    fileType: 'video',
    mediaUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    verdict: 'DEEPFAKE_DETECTED',
    aiPercentage: 93,
    realPercentage: 7,
    confidenceScore: 96.2,
    summary: 'DeepGuard detected synthetic face replacement artifacts across video frames. Facial movement does not align naturally with head rotation.',
    indicators: [
      {
        id: 'ind-7',
        name: 'Temporal Frame Consistency',
        description: 'Minor flickering and boundary warping detected when the speaker turns their head.',
        severity: 'High',
        iconType: 'frame',
        locationBox: [220, 300, 650, 700]
      },
      {
        id: 'ind-8',
        name: 'Mouth & Speech Synchronization',
        description: 'Lip shapes and inner mouth textures show unnatural blurring during speech.',
        severity: 'High',
        iconType: 'face',
        locationBox: [480, 430, 620, 580]
      },
      {
        id: 'ind-9',
        name: 'Lighting Boundary Discontinuity',
        description: 'Face lighting tone differs from the neck and background ambient light.',
        severity: 'Medium',
        iconType: 'lighting',
        locationBox: [260, 320, 600, 680]
      }
    ],
    analysisDetails: {
      overallResult: 'Deepfake Video (Face Swap)',
      aiProbabilityText: '93% chance of synthetic manipulation.',
      realProbabilityText: '7% real media confidence.',
      confidenceLevelText: 'Very High Confidence (96.2%)',
      detectedFeatures: [
        'Frame-to-frame face warping around jawline',
        'Mouth interior textures lack natural teeth definition',
        'Unnatural blinking frequency'
      ],
      imageAnalysis: 'Our video frame inspector analyzed multiple frames across the video and identified that the face was digitally swapped onto another person body.',
      finalExplanation: 'This video displays clear indicators of a deepfake face swap. Do not trust statements made in this clip without independent secondary verification.'
    }
  },
  {
    id: 'scan-sample-04',
    fileName: 'nature_landscape_view.png',
    fileSize: 2890000,
    fileType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
    verdict: 'AUTHENTIC',
    aiPercentage: 2,
    realPercentage: 98,
    confidenceScore: 98.6,
    summary: 'DeepGuard verified this landscape as an authentic photograph. Real water reflections, authentic tree foliage, and camera lens optics were verified.',
    indicators: [
      {
        id: 'ind-10',
        name: 'Natural Water Reflection',
        description: 'Water ripple physics match the mountain contours above perfectly.',
        severity: 'Normal',
        iconType: 'lighting',
        locationBox: null
      },
      {
        id: 'ind-11',
        name: 'Organic Foliage Detail',
        description: 'Leaves and branches show organic randomness without repeating AI tiles.',
        severity: 'Normal',
        iconType: 'texture',
        locationBox: null
      }
    ],
    analysisDetails: {
      overallResult: 'Real Landscape Photograph',
      aiProbabilityText: '2% AI probability.',
      realProbabilityText: '98% real authentic photograph.',
      confidenceLevelText: 'Very High Confidence (98.6%)',
      detectedFeatures: [
        'Physically accurate light scattering across clouds',
        'Organic tree branch distribution',
        'Genuine lens depth characteristics'
      ],
      imageAnalysis: 'All natural elements obey real-world optical physics with no repeating generative diffusion textures.',
      finalExplanation: 'This landscape photograph is authentic and unaltered.'
    }
  }
];

// Helper functions for Local Storage & Session State

export function getStoredUser(): UserProfile | null {
  try {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveStoredUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save user in storage:', e);
  }
}

export function getScanHistory(): ScanResult[] {
  try {
    const data = localStorage.getItem(SCANS_STORAGE_KEY);
    if (!data) {
      // Seed with initial demos
      localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_SCANS));
      return INITIAL_DEMO_SCANS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_DEMO_SCANS;
  }
}

export function saveScanToHistory(newScan: ScanResult): void {
  try {
    const history = getScanHistory();
    // Prepend new scan to top
    const updated = [newScan, ...history.filter(s => s.id !== newScan.id)];
    localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save scan to history:', e);
  }
}

export function deleteScanFromHistory(scanId: string): void {
  try {
    const history = getScanHistory();
    const updated = history.filter(s => s.id !== scanId);
    localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete scan:', e);
  }
}

export function clearAllScanHistory(): void {
  try {
    localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to clear scan history:', e);
  }
}

export function calculateDashboardStats(scans: ScanResult[]): DashboardStats {
  if (scans.length === 0) {
    return {
      totalScans: 0,
      authenticCount: 0,
      deepfakesCount: 0,
      averageConfidence: 0,
    };
  }

  const totalScans = scans.length;
  const authenticCount = scans.filter(s => s.verdict === 'AUTHENTIC').length;
  const deepfakesCount = scans.filter(s => s.verdict === 'DEEPFAKE_DETECTED').length;
  const sumConfidence = scans.reduce((acc, curr) => acc + (curr.confidenceScore || 90), 0);
  const averageConfidence = Number((sumConfidence / totalScans).toFixed(1));

  return {
    totalScans,
    authenticCount,
    deepfakesCount,
    averageConfidence,
  };
}
