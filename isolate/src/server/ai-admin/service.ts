import { createAiAdminRecommendation, type AiAdminRecommendation, type AiAdminRecommendationStatus } from '@/domain/ai-admin-assistant';
import { readAiAdminStore, writeAiAdminStore } from './store';

export async function addAiAdminRecommendation(input: Parameters<typeof createAiAdminRecommendation>[0]): Promise<AiAdminRecommendation> {
  const data = await readAiAdminStore();
  const recommendation = createAiAdminRecommendation(input);
  data.recommendations.push(recommendation);
  await writeAiAdminStore(data);
  return recommendation;
}

export async function listAiAdminRecommendations(): Promise<AiAdminRecommendation[]> {
  const data = await readAiAdminStore();
  return data.recommendations.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateAiAdminRecommendationStatus(id: string, status: AiAdminRecommendationStatus): Promise<AiAdminRecommendation | null> {
  const data = await readAiAdminStore();
  const recommendation = data.recommendations.find((item) => item.id === id);
  if (!recommendation) return null;
  recommendation.status = status;
  recommendation.updatedAt = new Date().toISOString();
  await writeAiAdminStore(data);
  return recommendation;
}

export async function runAiAdminFoundationScan(): Promise<AiAdminRecommendation[]> {
  const data = await readAiAdminStore();
  if (!data.recommendations.some((item) => item.area === 'platform-health-monitoring')) {
    data.recommendations.push(createAiAdminRecommendation({
      area: 'platform-health-monitoring',
      priority: 'normal',
      title: 'Platform health scan prepared',
      clearExplanation: 'The AI Admin Assistant foundation is ready to monitor operational signals across PataSpace.',
      reason: 'Master Prompt 21A establishes background administrative intelligence without automatic business-rule changes.',
      suggestedAction: 'Use the upcoming AI Admin Workspace to review operational recommendations.'
    }));
    await writeAiAdminStore(data);
  }
  return data.recommendations;
}
