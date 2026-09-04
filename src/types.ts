export type PageType = 
  | 'landing' 
  | 'signup' 
  | 'login' 
  | 'dashboard' 
  | 'upload' 
  | 'results' 
  | 'history';

export type VerdictType = 
  | 'AI_GENERATED' 
  | 'REAL_NATURAL' 
  | 'AUTHENTIC' 
  | 'DEEPFAKE_DETECTED' 
  | 'UNCERTAIN'
  | 'REAL_PHOTOGRAPH' 
  | 'MANIPULATED';

export type MediaType = 'image' | 'video';

export type SeverityLevel = 'High' | 'Medium' | 'Low' | 'Normal';

export type ArtifactSeverity = 'high' | 'medium' | 'low';

export type ArtifactCategory = 
  | 'anatomy' 
  | 'texture' 
  | 'lighting' 
  | 'frequency' 
  | 'geometry' 
  | 'compression' 
  | 'synthetic_blur'
  | 'watermark';

export interface ArtifactFinding {
  id: string;
  title: string;
  category: ArtifactCategory;
  severity: ArtifactSeverity;
  description: string;
  evidence: string;
  boundingBox?: [number, number, number, number] | null;
}

export interface ForensicMetrics {
  aiProbability: number;
  realProbability: number;
  anatomicalConsistency: number;
  textureNaturalness: number;
  lightingPhysicsScore: number;
  frequencyNoiseScore: number;
  compressionSignatureScore: number;
}

export interface TechnicalBreakdown {
  faceAnatomyAssessment?: string;
  textureAndEdgeAssessment?: string;
  lightAndShadowAssessment?: string;
  frequencyAndNoiseAssessment?: string;
  compressionMetadataAssessment?: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  verdict: VerdictType;
  primaryHeadline: string;
  aiPercentage: number;
  realPercentage: number;
  confidenceLevel: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  generatorEstimate: string;
  summary: string;
  detailedFindings: ArtifactFinding[];
  metrics: ForensicMetrics;
  keySignals: string[];
  technicalBreakdown: TechnicalBreakdown;
  imageUrl: string;
  fileName?: string;
  fileSize?: number;
  dimensions?: { width: number; height: number };
  processingTimeMs: number;
}

export interface BenchmarkSample {
  id: string;
  title: string;
  category: 'portraits' | 'hands_limbs' | 'landscapes' | 'hyperrealistic' | 'authentic_dslr' | 'deepfakes' | 'surreal';
  groundTruth: 'AI_GENERATED' | 'REAL_PHOTOGRAPH';
  groundTruthPercentage: number;
  generatorUsed?: string;
  cameraUsed?: string;
  imageUrl: string;
  description: string;
  keyArtifactToLookFor: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extremely Hard';
}

export interface AuditLogItem {
  id: string;
  timestamp: number;
  imageUrl: string;
  fileName: string;
  fileSize?: number;
  verdict: VerdictType;
  aiPercentage: number;
  realPercentage: number;
  confidenceLevel: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  generatorEstimate: string;
  topArtifactsCount: number;
  processingTimeMs: number;
  resultData?: AnalysisResult;
}

export type InspectionViewMode = 'original' | 'heatmap' | 'ela' | 'noise' | 'thermal' | 'split';

export type AnomalyIconType = 
  | 'nature'
  | 'building'
  | 'animal'
  | 'object'
  | 'food'
  | 'art'
  | 'face' 
  | 'texture' 
  | 'lighting' 
  | 'frame' 
  | 'noise' 
  | 'eye'
  | 'water'
  | 'sky';

export interface AnomalyIndicator {
  id: string;
  name: string;
  description: string;
  severity: SeverityLevel;
  iconType?: AnomalyIconType | string;
  locationBox?: [number, number, number, number] | null;
}

export interface ScanResult {
  id: string;
  fileName: string;
  fileSize?: number;
  fileType: MediaType;
  mediaUrl: string;
  timestamp: number;
  subjectCategory?: string;
  identifiedSubject?: string;
  relevantFeaturesChecked?: string[];
  verdict: VerdictType;
  aiPercentage: number;
  realPercentage: number;
  confidenceScore: number;
  summary: string;
  indicators: AnomalyIndicator[];
  analysisDetails: {
    overallResult: string;
    aiProbabilityText: string;
    realProbabilityText: string;
    confidenceLevelText: string;
    detectedFeatures: string[];
    imageAnalysis: string;
    finalExplanation: string;
  };
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  createdAt: number;
}

export interface DashboardStats {
  totalScans: number;
  authenticCount: number;
  deepfakesCount: number;
  averageConfidence: number;
}
