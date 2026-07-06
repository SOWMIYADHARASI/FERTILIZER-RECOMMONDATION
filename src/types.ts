export interface Recommendation {
  id: string;
  date: string;
  crop: string;
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  pH: number;
  location: string;
  recommendedFertilizer: string;
  confidence: number;
  reason: string;
  dosage: string;
  instructions: string[];
  safetyTips: string[];
  organicCarbon?: number;
  electricalConductivity?: number;
  zinc?: number;
  iron?: number;
  copper?: number;
  manganese?: number;
  boron?: number;
  soilType?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export interface Feedback {
  id: string;
  name: string;
  email: string;
  message: string;
  rating: number;
  timestamp: string;
}

export interface AdminStats {
  totalRecommendations: number;
  popularFertilizer: string;
  popularCrop: string;
  totalFeedback: number;
  averages: {
    avgN: number;
    avgP: number;
    avgK: number;
    avgPH: number;
  };
  charts: {
    fertilizers: Array<{ name: string; value: number }>;
    crops: Array<{ name: string; count: number }>;
    monthly: Array<{ month: string; predictions: number }>;
  };
  recentPredictions: Recommendation[];
}
