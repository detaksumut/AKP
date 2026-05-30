import { ApiService } from "../services/api.service";

export async function auditPolicyOrProcurement(
  input: string,
  type: 'policy' | 'procurement' | 'integrity' | 'news_investigation'
) {
  try {
    return await ApiService.audit(input, type);
  } catch (error) {
    console.error("Backend Audit Error:", error);
    throw error;
  }
}

export async function generateJournalismArticle(
  auditData: any,
  articleType: 'straight' | 'investigative' | 'seo' | 'editorial' | 'legal' | 'rab'
) {
  try {
    return await ApiService.generateArticle(auditData, articleType);
  } catch (error) {
    console.error("Journalism AKP Error:", error);
    throw error;
  }
}
