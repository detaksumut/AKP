export type UserRole = 'admin' | 'auditor' | 'user';

export interface UserProfile {
  id?: string;
  uid: string;
  phone: string;
  name: string;
  displayName?: string;
  password?: string;
  email?: string;
  role: UserRole;
  status?: 'active' | 'suspended';
  createdAt: string;
  created_at?: string;
}

export type AuditType = 'policy' | 'procurement' | 'integrity' | 'news_investigation' | 'rab';
export type AuditStatus = 'draft' | 'published' | 'archived';

export interface AuditReport {
  id?: string;
  isCustomized?: boolean;
  title: string;
  type: AuditType;
  sourceType: 'manual' | 'url' | 'pdf';
  sourceUrl?: string;
  summary: string;
  fullReport: string; // Detailed markdown report
  score: number;
  marwah_score?: number;
  status: AuditStatus;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  integrity_status?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sections: {
    constitutionalAnalysis: string;
    publicImpact: string;
    conflictOfInterest: string;
    corruptionRisk: string;
    budgetManipulation?: string;
    monopolyRisk?: string;
    uud1945Deviations: string;
    akpRecommendations: string;
    finalConclusion: string;
  };
  authorId: string;
  constitutionReferences: string[];
  investigationLeads?: string[];
  findingsList?: any[];
  image_url?: string;
  createdAt: any;
  created_at?: string;
  updatedAt: any;
}

export interface JournalismArticle {
  id?: string;
  auditId: string;
  type: 'straight' | 'investigative' | 'seo' | 'editorial' | 'legal' | 'rab' | 'academic';
  title: string;
  headline: string;
  content: string;
  thumbnailUrl?: string;
  image_url?: string;
  category: string;
  tags: string[];
  authorId: string;
  status: 'draft' | 'published';
  createdAt: any;
  created_at?: string;
  // Academic Journal metadata
  detectedField?: string;
  journalRecommendation?: string;
  matchPercentage?: number;
  auditScore?: number;
  auditFindings?: string;
  auditImprovements?: string;
}

