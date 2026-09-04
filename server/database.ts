import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface DBUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  email_verified: boolean;
  verification_token?: string | null;
  verification_token_expires?: number | null;
  reset_token?: string | null;
  reset_token_expires?: number | null;
  created_at: number;
}

export interface DBAnalysisRecord {
  id: string;
  user_id: string;
  image: string;
  fileName: string;
  fileSize?: number;
  fileType: 'image' | 'video';
  result: string;
  ai_probability: number;
  real_probability: number;
  confidence: number;
  summary: string;
  indicators: any[];
  analysis_details: any;
  subject_category?: string;
  identified_subject?: string;
  relevant_features_checked?: string[];
  processing_time_ms?: number;
  created_at: number;
}

interface DatabaseSchema {
  users: DBUser[];
  history: DBAnalysisRecord[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'deepguard.db.json');

class DatabaseEngine {
  private data: DatabaseSchema = {
    users: [],
    history: [],
  };
  private isLoaded = false;

  constructor() {
    this.ensureDataDirectory();
    this.loadDatabase();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Failed to create data directory:', err);
      }
    }
  }

  private loadDatabase() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        this.isLoaded = true;
      } else {
        this.seedInitialData();
        this.persist();
        this.isLoaded = true;
      }
    } catch (err) {
      console.warn('Database load notice, re-initializing:', err);
      this.seedInitialData();
      this.persist();
      this.isLoaded = true;
    }
  }

  private persist() {
    try {
      this.ensureDataDirectory();
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  private seedInitialData() {
    const demoPasswordHash = bcrypt.hashSync('Investigator123!', 10);
    const now = Date.now();

    const alexUser: DBUser = {
      id: 'user-alex-demo-01',
      name: 'Alex Morgan',
      email: 'alex.morgan@deepguard.ai',
      password_hash: demoPasswordHash,
      email_verified: true,
      created_at: now - 86400000 * 7,
    };

    const sarahUser: DBUser = {
      id: 'user-sarah-demo-02',
      name: 'Sarah Connor',
      email: 'sarah.connor@deepguard.ai',
      password_hash: demoPasswordHash,
      email_verified: true,
      created_at: now - 86400000 * 3,
    };

    this.data.users = [alexUser, sarahUser];

    // Seed initial records for Alex Morgan ONLY
    this.data.history = [
      {
        id: 'scan-sample-alex-01',
        user_id: alexUser.id,
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
        fileName: 'ai_portrait_face_01.png',
        fileSize: 1845200,
        fileType: 'image',
        result: 'AI_GENERATED',
        ai_probability: 96,
        real_probability: 4,
        confidence: 96.0,
        summary: 'DeepGuard identified visual characteristics of an AI-generated portrait. Key facial smoothness, hair patterns, and lighting details show clear signs of AI creation.',
        subject_category: 'Person / Portrait',
        identified_subject: 'Photorealistic AI portrait of a woman',
        relevant_features_checked: ['Facial structure', 'Skin micro-pores', 'Hair boundaries', 'Lighting consistency'],
        indicators: [
          {
            id: 'ind-1',
            name: 'Unnatural Facial Details',
            description: 'Facial features look unusually smooth and computer-generated rather than like a natural photo.',
            severity: 'High',
            iconType: 'face',
            locationBox: [280, 320, 680, 680],
          },
          {
            id: 'ind-2',
            name: 'AI-Like Hair & Texture Patterns',
            description: 'The hair strands and surface details have a digital painted texture commonly found in AI diffusion images.',
            severity: 'High',
            iconType: 'texture',
            locationBox: [350, 380, 560, 620],
          },
        ],
        analysis_details: {
          overallResult: 'AI-Generated Image',
          aiProbabilityText: 'AI Probability: 96%',
          realProbabilityText: 'Real Probability: 4%',
          confidenceLevelText: 'High Confidence (96%)',
          detectedFeatures: [
            'Unnatural facial details with computer smoothing',
            'AI-like hair patterns with digital brushwork',
            'Skin texture lacks true camera sensor micro-pores',
          ],
          imageAnalysis: 'When inspecting the image closely, the facial features, skin texture, and hair patterns show computer-generated artistic rendering rather than real camera photography.',
          finalExplanation: 'High chance that this image was made by AI. We recommend treating this media as AI-generated.',
        },
        processing_time_ms: 380,
        created_at: now - 1000 * 60 * 45,
      },
      {
        id: 'scan-sample-alex-02',
        user_id: alexUser.id,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
        fileName: 'camera_capture_street.jpg',
        fileSize: 3410000,
        fileType: 'image',
        result: 'REAL_NATURAL',
        ai_probability: 3,
        real_probability: 97,
        confidence: 97.0,
        summary: 'DeepGuard verified this media as an authentic real-world photograph. Natural camera sensor noise, authentic texture, and consistent lighting were confirmed.',
        subject_category: 'Person / Portrait',
        identified_subject: 'Real camera portrait with natural street lighting',
        relevant_features_checked: ['Camera sensor grain', 'Skin micro-pores', 'Natural eye catchlights'],
        indicators: [
          {
            id: 'ind-3',
            name: 'Natural Camera Sensor Noise',
            description: 'Natural optical camera grain is present evenly across dark and light areas of the photo.',
            severity: 'Normal',
            iconType: 'noise',
            locationBox: null,
          },
        ],
        analysis_details: {
          overallResult: 'Real / Natural Image',
          aiProbabilityText: 'AI Probability: 3%',
          realProbabilityText: 'Real Probability: 97%',
          confidenceLevelText: 'High Confidence (97%)',
          detectedFeatures: [
            'Natural camera optical grain and sensor noise',
            'Real skin pores and organic facial textures',
            'Consistent real-world lighting and shadow direction',
          ],
          imageAnalysis: 'The image displays authentic physical characteristics of a real camera, with natural optical focus and genuine sensor noise.',
          finalExplanation: 'This image appears authentic and shows no signs of AI generation or face swapping.',
        },
        processing_time_ms: 410,
        created_at: now - 1000 * 60 * 180,
      },
      // Seed a record for Sarah Connor to prove complete data separation
      {
        id: 'scan-sample-sarah-01',
        user_id: sarahUser.id,
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
        fileName: 'sarah_private_nature_investigation.png',
        fileSize: 2890000,
        fileType: 'image',
        result: 'REAL_NATURAL',
        ai_probability: 2,
        real_probability: 98,
        confidence: 98.6,
        summary: 'DeepGuard verified this landscape as an authentic photograph with natural water reflection physics.',
        subject_category: 'Landscape / Nature',
        identified_subject: 'Alpine lake landscape with reflection',
        relevant_features_checked: ['Water physics', 'Atmospheric perspective', 'Natural foliage'],
        indicators: [],
        analysis_details: {
          overallResult: 'Real Landscape Photograph',
          aiProbabilityText: '2% AI probability',
          realProbabilityText: '98% real authentic photograph',
          confidenceLevelText: 'Very High Confidence (98.6%)',
          detectedFeatures: ['Natural water ripple physics', 'Authentic atmospheric depth'],
          imageAnalysis: 'Natural optical camera sensor noise and physically accurate light scattering.',
          finalExplanation: 'This landscape photograph is authentic and unaltered.',
        },
        processing_time_ms: 360,
        created_at: now - 1000 * 60 * 60 * 24,
      },
    ];
  }

  // --- USER METHODS ---

  public findUserByEmail(email: string): DBUser | undefined {
    const normalized = email.trim().toLowerCase();
    return this.data.users.find((u) => u.email.toLowerCase() === normalized);
  }

  public findUserById(id: string): DBUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByVerificationToken(email: string, token: string): DBUser | undefined {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();
    return this.data.users.find(
      (u) =>
        u.email.toLowerCase() === normalizedEmail &&
        u.verification_token === cleanToken &&
        (!u.verification_token_expires || u.verification_token_expires > Date.now())
    );
  }

  public findUserByResetToken(token: string): DBUser | undefined {
    const cleanToken = token.trim();
    return this.data.users.find(
      (u) =>
        u.reset_token === cleanToken &&
        u.reset_token_expires &&
        u.reset_token_expires > Date.now()
    );
  }

  public createUser(user: DBUser): DBUser {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  public updateUser(id: string, updates: Partial<DBUser>): DBUser | undefined {
    const index = this.data.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;

    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
    };
    this.persist();
    return this.data.users[index];
  }

  // --- HISTORY METHODS (STRICT USER SEPARATION) ---

  public getHistoryByUserId(userId: string): DBAnalysisRecord[] {
    // STRICT SECURITY: Filters on database level by userId
    return this.data.history
      .filter((record) => record.user_id === userId)
      .sort((a, b) => b.created_at - a.created_at);
  }

  public addHistoryRecord(record: DBAnalysisRecord): DBAnalysisRecord {
    this.data.history.unshift(record);
    this.persist();
    return record;
  }

  public deleteHistoryRecord(id: string, userId: string): boolean {
    // STRICT SECURITY: Verifies that the record belongs to the requesting user
    const index = this.data.history.findIndex(
      (record) => record.id === id && record.user_id === userId
    );
    if (index === -1) {
      return false;
    }
    this.data.history.splice(index, 1);
    this.persist();
    return true;
  }

  public clearHistoryForUser(userId: string): number {
    // STRICT SECURITY: Deletes only records belonging to this user
    const initialCount = this.data.history.length;
    this.data.history = this.data.history.filter((record) => record.user_id !== userId);
    const deletedCount = initialCount - this.data.history.length;
    this.persist();
    return deletedCount;
  }
}

export const db = new DatabaseEngine();
