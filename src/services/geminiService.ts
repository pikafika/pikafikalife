import { LogEntry, UserSettings } from "../types";
import { InsightStory } from "../data/insights_db";

export class GeminiService {
  private endpoint = "/api/gemini"; // 새로운 프록시 백엔드 엔드포인트

  constructor() {}

  /**
   * 백엔드 API를 통해 오늘의 인사이트 생성
   */
  async generateDailyInsights(logs: LogEntry[], settings: UserSettings): Promise<InsightStory[]> {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "insights", logs, settings })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Server Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data as InsightStory[];
    } catch (error) {
      console.error("Gemini Insight Sync Error:", error);
      throw error;
    }
  }

  /**
   * 백엔드 API를 통해 상세 AI 리포트 생성
   */
  async generateCoachingReport(logs: LogEntry[], history: string[]): Promise<string> {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "coaching", logs, history })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        
        // 서버의 치명적 에러 또는 안전 필터인 경우
        if (response.status === 403) {
          return err.error || "보안 정책으로 인해 리포트를 생성할 수 없습니다.";
        }
        throw new Error(err.error || `Server Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.report;
    } catch (error) {
      console.error("Gemini Coaching Report Sync Error:", error);
      throw error;
    }
  }
}

/**
 * 변경된 구조: 더 이상 API 키를 프론트에서 요구하지 않으므로 초기화 방식 간소화
 */
export const getGeminiService = () => {
  return new GeminiService();
};
