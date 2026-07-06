import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Path for JSON-based mock MongoDB
let DB_PATH = path.join(process.cwd(), "db.json");

// On Vercel (read-only ephemeral filesystem), use /tmp to prevent EROFS errors
if (process.env.VERCEL) {
  const tmpPath = path.join("/tmp", "db.json");
  if (!fs.existsSync(tmpPath)) {
    try {
      if (fs.existsSync(DB_PATH)) {
        fs.copyFileSync(DB_PATH, tmpPath);
      }
    } catch (err) {
      console.error("Failed to copy db.json to /tmp:", err);
    }
  }
  DB_PATH = tmpPath;
}

// Define TypeScript structures for DB
interface Recommendation {
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

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

interface Feedback {
  id: string;
  name: string;
  email: string;
  message: string;
  rating: number;
  timestamp: string;
}

interface AdminLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

interface DatabaseSchema {
  users: Array<{ id: string; name: string; email: string; role: string }>;
  recommendations: Recommendation[];
  chat_history: ChatSession[];
  feedback: Feedback[];
  admin_logs: AdminLog[];
}

// Ensure database file exists with dummy/seeded data
function getDatabase(): DatabaseSchema {
  if (!fs.existsSync(DB_PATH)) {
    const initialDb: DatabaseSchema = {
      users: [
        { id: "usr_1", name: "Sp Sowmiya", email: "spsowmiya22@gmail.com", role: "admin" },
        { id: "usr_2", name: "Ramesh Kumar", email: "ramesh.kumar@agrilink.in", role: "farmer" }
      ],
      recommendations: [],
      chat_history: [],
      feedback: [],
      admin_logs: []
    };

    // Pre-seed some historical records spanning the last 6 months to make charts look gorgeous
    const fertilizers = ["Urea", "DAP", "MOP", "NPK 19-19-19", "NPK 12-32-16", "NPK 10-26-26", "Organic Compost"];
    const crops = ["Rice", "Maize", "Cotton", "Sugarcane", "Banana", "Mango", "Groundnut"];
    const locations = ["Chennai, TN", "Coimbatore, TN", "Madurai, TN", "Tiruchirappalli, TN", "Salem, TN"];

    const now = new Date();
    for (let i = 0; i < 45; i++) {
      const dateOffset = Math.floor(Math.random() * 180); // Up to 6 months ago
      const recordDate = new Date(now.getTime() - dateOffset * 24 * 60 * 60 * 1000);
      const crop = crops[Math.floor(Math.random() * crops.length)];
      const fertilizer = fertilizers[Math.floor(Math.random() * fertilizers.length)];
      const N = Math.floor(Math.random() * 80) + 10;
      const P = Math.floor(Math.random() * 60) + 10;
      const K = Math.floor(Math.random() * 60) + 10;
      const temp = Math.floor(Math.random() * 15) + 20;
      const humidity = Math.floor(Math.random() * 40) + 50;
      const rainfall = Math.floor(Math.random() * 150) + 50;
      const pH = Number((Math.random() * 3 + 5).toFixed(1));
      const confidence = Math.floor(Math.random() * 20) + 78;

      initialDb.recommendations.push({
        id: `rec_seed_${i}`,
        date: recordDate.toISOString(),
        crop,
        N,
        P,
        K,
        temperature: temp,
        humidity,
        rainfall,
        pH,
        location: locations[Math.floor(Math.random() * locations.length)],
        recommendedFertilizer: fertilizer,
        confidence,
        reason: `Based on a low concentration of nutrients relative to ${crop}'s high demand, adding ${fertilizer} will optimize yield.`,
        dosage: `${100 + Math.floor(Math.random() * 100)} kg per hectare`,
        instructions: [
          "Apply during early morning or late evening.",
          "Ensure soil is sufficiently moist.",
          "Distribute evenly around the crop root zone."
        ],
        safetyTips: [
          "Wear protective gloves and mask during distribution.",
          "Store in a cool, dry place away from children."
        ]
      });
    }

    // Sort seeded recommendations by date ascending to feed line charts cleanly
    initialDb.recommendations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Add some feedback entries
    initialDb.feedback = [
      { id: "fb_1", name: "Anandan S.", email: "anandan@gmail.com", message: "This tool helped me increase my rice yield by 20% this season! Very clean user interface.", rating: 5, timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "fb_2", name: "Meena K.", email: "meena.k@outlook.com", message: "Great chatbot advice on banana disease management. Highly recommended.", rating: 4, timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "fb_3", name: "Selvam P.", email: "selvam_farmer@yahoo.com", message: "Excellent prediction accuracy. Multilingual Tamil support is incredibly useful for Tamil Nadu farmers.", rating: 5, timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ];

    // Add some chat sessions
    initialDb.chat_history = [
      {
        id: "chat_seed_1",
        title: "Rice Fertilizer Advice",
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        messages: [
          { id: "msg_1", role: "user", text: "What is the best fertilizer for Rice with pH 5.5?", timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() },
          { id: "msg_2", role: "model", text: "For rice in slightly acidic soil (pH 5.5), DAP (Diammonium Phosphate) is highly recommended for root development, followed by Urea for vegetative growth. You can also apply organic compost to buffer pH towards 6.0.", timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() }
        ]
      }
    ];

    // Seed admin logs
    initialDb.admin_logs = [
      { id: "log_1", action: "SYSTEM_INIT", details: "Fertilizer Recommendation Agent initialized successfully.", timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "log_2", action: "MODEL_LOAD", details: "Random Forest Classifier emulator successfully loaded.", timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() }
    ];

    fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), "utf8");
    return initialDb;
  }

  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function saveDatabase(db: DatabaseSchema) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

// Initialize database
let db = getDatabase();

// Lazy Gemini API Client Initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// ----------------------------------------------------
// ChromaDB Mock Grounding Knowledge Base (RAG)
// ----------------------------------------------------
const AGRI_KNOWLEDGE_BASE = [
  {
    id: "rag_doc_1",
    title: "Government Nitrogen Management Guidelines",
    content: "Nitrogen is key for leaf and grain growth. Urea (46% Nitrogen) is the most popular chemical source. For wet paddy (rice) fields, avoid broadcasting urea during heavy rains to prevent runoff. Splitting application into three parts (sowing, tillering, and flowering) increases nitrogen use efficiency by 35%."
  },
  {
    id: "rag_doc_2",
    title: "Phosphorus (P) and Potassium (K) Crop Manual",
    content: "DAP (Diammonium Phosphate, 18-46-0) should be applied as a basal dose near the seed line during planting, promoting rapid early rooting. MOP (Muriate of Potash, 60% K2O) is applied at active vegetative or tillering stages, which makes the plant drought and disease resistant."
  },
  {
    id: "rag_doc_3",
    title: "Soil pH and Nutrient Availability Studies",
    content: "The optimal soil pH for macro-nutrient absorption (N, P, K) is 6.0 to 7.0. At low pH (highly acidic < 5.2), Phosphorus becomes bound to iron and aluminum compounds, making it unavailable. Applying Dolomite Lime or Vermicompost buffers soil acidity and increases fertilizer efficacy."
  },
  {
    id: "rag_doc_4",
    title: "Organic and Biofertilizer Alternatives",
    content: "Vermicompost, Cow Dung, Neem Cake, and Bone Meal are excellent organic options. Neem cake serves as a natural nitrification inhibitor when mixed with Urea, extending nitrogen availability. Bone Meal acts as a slow-release natural phosphorus source."
  },
  {
    id: "rag_doc_5",
    title: "Efficient Micro-Irrigation and Fertigation Guide",
    content: "Drip irrigation delivers water and water-soluble fertilizers directly to plant root zones, saving up to 50% water. Fertigation reduces nutrient leaching. Sprinklers are best for close-growing crops on uneven terrains but should be operated early morning to reduce fungal disease risks."
  },
  {
    id: "rag_doc_6",
    title: "Crop Specific Nutrient Needs (Rice, Maize, Sugarcane, Cotton, Banana)",
    content: "Rice is highly water-consuming and requires medium Nitrogen and low-medium Phosphate. Maize is a heavy feeder needing robust pre-planting fertilization. Sugarcane requires huge Potassium and Nitrogen over its long 10-month lifecycle. Cotton needs precise boron and zinc micro-nutrients alongside balanced NPK. Bananas are exceptionally Potassium-hungry."
  }
];

// Simple Text Vector RAG simulation (matches queries using keyword and substring alignment scores)
function retrieveKnowledge(query: string, limit: number = 2): string {
  const normalizedQuery = query.toLowerCase();
  const scoredDocs = AGRI_KNOWLEDGE_BASE.map(doc => {
    let score = 0;
    const words = normalizedQuery.split(/\s+/);
    words.forEach(word => {
      if (word.length > 3) {
        if (doc.title.toLowerCase().includes(word)) score += 5;
        if (doc.content.toLowerCase().includes(word)) score += 2;
      }
    });
    return { doc, score };
  });

  // Sort by score descending and take top docs
  const topDocs = scoredDocs
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.doc);

  if (topDocs.length === 0) {
    // Return a default pair of documents if no matches found
    return AGRI_KNOWLEDGE_BASE.slice(0, limit)
      .map(d => `[Source: ${d.title}]\n${d.content}`)
      .join("\n\n");
  }

  return topDocs.slice(0, limit)
    .map(d => `[Source: ${d.title}]\n${d.content}`)
    .join("\n\n");
}

// ----------------------------------------------------
// Machine Learning - Decision Rules (Random Forest Classifier Emulator)
// ----------------------------------------------------
interface MLInput {
  crop: string;
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  pH: number;
}

interface MLOutput {
  recommendedFertilizer: string;
  confidence: number;
  reason: string;
  dosage: string;
  instructions: string[];
  safetyTips: string[];
}

function runMLClassifier(input: MLInput): MLOutput {
  const { crop, N, P, K, pH, rainfall, temperature, humidity } = input;

  // Standard optimum metrics for crops
  const optimumMap: Record<string, { N: number; P: number; K: number; pHMin: number; pHMax: number; rainMin: number; rainMax: number }> = {
    rice: { N: 80, P: 40, K: 40, pHMin: 5.5, pHMax: 6.5, rainMin: 150, rainMax: 300 },
    maize: { N: 100, P: 50, K: 40, pHMin: 5.8, pHMax: 7.0, rainMin: 60, rainMax: 120 },
    cotton: { N: 70, P: 45, K: 50, pHMin: 6.0, pHMax: 7.5, rainMin: 50, rainMax: 100 },
    sugarcane: { N: 140, P: 60, K: 80, pHMin: 6.0, pHMax: 7.5, rainMin: 100, rainMax: 200 },
    banana: { N: 110, P: 35, K: 130, pHMin: 6.5, pHMax: 7.8, rainMin: 120, rainMax: 250 },
    mango: { N: 60, P: 30, K: 60, pHMin: 5.5, pHMax: 7.0, rainMin: 40, rainMax: 90 },
    groundnut: { N: 25, P: 45, K: 35, pHMin: 6.0, pHMax: 7.2, rainMin: 50, rainMax: 90 },
    grapes: { N: 50, P: 40, K: 80, pHMin: 6.0, pHMax: 7.0, rainMin: 30, rainMax: 70 },
    watermelon: { N: 45, P: 30, K: 50, pHMin: 5.5, pHMax: 6.8, rainMin: 40, rainMax: 80 },
    pomegranate: { N: 50, P: 30, K: 50, pHMin: 6.0, pHMax: 7.5, rainMin: 30, rainMax: 70 },
  };

  const cropKey = crop.toLowerCase();
  const optimum = optimumMap[cropKey] || { N: 60, P: 40, K: 40, pHMin: 6.0, pHMax: 7.0, rainMin: 50, rainMax: 120 };

  // Calculate soil deficits relative to ideal requirements
  const defN = Math.max(0, optimum.N - N);
  const defP = Math.max(0, optimum.P - P);
  const defK = Math.max(0, optimum.K - K);

  let recommendedFertilizer = "NPK 19-19-19";
  let reason = "";
  let dosage = "150 kg per hectare";
  let instructions: string[] = [];
  let safetyTips: string[] = [];

  // Rules simulating decision trees based on maximum nutritional deficiencies
  if (pH < 5.0) {
    recommendedFertilizer = "Organic Compost + Dolomite Lime";
    reason = `The soil pH (${pH}) is highly acidic, which locks up critical nutrients. Applying organic compost enriched with dolomite lime buffers acidity and restores nutrient availability organically.`;
    dosage = "500 kg per acre as a basal dressing";
    instructions = [
      "Incorporate dolomite lime into soil 2-3 weeks before crop sowing.",
      "Apply organic compost alongside sowing to stimulate nitrogen-fixing soil bacteria.",
      "Irrigate lightly after soil conditioning."
    ];
    safetyTips = [
      "Wear respiratory masks to avoid breathing fine lime dust particles.",
      "Store in airtight bags protected from ground moisture."
    ];
  } else if (pH > 8.3) {
    recommendedFertilizer = "Gypsum Soil Conditioner + Organic Humus";
    reason = `The highly alkaline pH (${pH}) restricts iron, zinc, and phosphorus absorption. Gypsum acts as an excellent soil amendment to lower alkalinity and improve clay soil structure.`;
    dosage = "300 kg per acre incorporated during land preparation";
    instructions = [
      "Broadcast gypsum uniformly across the field during tillage.",
      "Incorporate organic compost to enhance water retention.",
      "Avoid mixing directly with nitrogen fertilizers during application."
    ];
    safetyTips = [
      "Always wash skin with soap if gypsum dust comes in contact.",
      "Ensure proper drainage to flush out displaced sodium salts."
    ];
  } else {
    // Determine chemical fertilizer based on primary nutrient gaps
    const maxDef = Math.max(defN, defP, defK);

    if (maxDef === 0) {
      recommendedFertilizer = "Balanced Biofertilizer (Azotobacter & PSB)";
      reason = `Soil N-P-K levels are already extremely well-balanced and adequate for ${crop} growth. Adding heavy chemical fertilizers is unnecessary. A light dose of bio-fertilizers is advised to maintain rich microbial activity.`;
      dosage = "5 kg per hectare mixed with fine soil";
      instructions = [
        "Mix the biofertilizer with well-rotted organic manure.",
        "Apply at active crop vegetative stage in late afternoons.",
        "Ensure field is damp, but avoid waterlogging."
      ];
      safetyTips = [
        "Avoid using synthetic fungicides or pesticides within 7 days of application.",
        "Store in cool, shaded spaces to preserve active bacterial strains."
      ];
    } else if (maxDef === defN && defN > 25 && defP < 15 && defK < 15) {
      recommendedFertilizer = "Urea (46% Nitrogen)";
      reason = `The N value (${N}) is significantly below ${crop}'s requirement of ${optimum.N} N. Urea provides a concentrated, rapid-release nitrogen source to promote lush green foliage and fast stem elongation.`;
      dosage = "100-120 kg per hectare split into 3 applications";
      instructions = [
        "Apply 40% as basal during sowing.",
        "Top-dress 30% at active tillering/branching.",
        "Top-dress final 30% right before panicle initiation/flowering.",
        "Apply on damp soil (do not apply on flooded fields to prevent leaching)."
      ];
      safetyTips = [
        "Use protective safety goggles and rubber gloves.",
        "Keep away from open fires and oxidizers during storage."
      ];
    } else if (maxDef === defP && defP > 20 && defN > 10) {
      recommendedFertilizer = "DAP (Diammonium Phosphate)";
      reason = `The phosphorus level (${P}) is highly depleted. DAP (N-P-K: 18-46-0) provides a potent basal phosphorus charge to stimulate robust root systems and seed development while supplying starter nitrogen.`;
      dosage = "125 kg per hectare applied during sowing";
      instructions = [
        "Apply as a basal dose 2 inches below and beside seeds during sowing.",
        "Avoid broadcasting on the surface, as phosphorus has very low mobility in soil.",
        "Light irrigation is recommended immediately post-application."
      ];
      safetyTips = [
        "Wash hands thoroughly after handling.",
        "Avoid direct root contact with high concentrations to prevent seed burn."
      ];
    } else if (maxDef === defK && defK > 25 && defN < 15 && defP < 15) {
      recommendedFertilizer = "MOP (Muriate of Potash)";
      reason = `Soil Potassium (${K}) is severely lacking. Potassium regulates stomatal opening, improves plant water retention, prevents lodging, and dramatically enhances resistance to pests and extreme weather.`;
      dosage = "80-100 kg per hectare in split doses";
      instructions = [
        "Apply half the dose during basal soil preparation.",
        "Top-dress the remaining half during crop flowering stage.",
        "Mix with soil thoroughly near the base of the plant."
      ];
      safetyTips = [
        "Keep storage areas cool and well-ventilated.",
        "Avoid applying under direct scorching mid-day sun."
      ];
    } else if (defN > 15 && defP > 15 && defK > 15) {
      recommendedFertilizer = "NPK 19-19-19 (Balanced)";
      reason = `Your soil displays generalized deficiencies in all three macronutrients. An equal ratio balanced NPK (19-19-19) fertilizer is ideal to restore standard soil fertility across the board.`;
      dosage = "150-180 kg per hectare split into basal and top-dressing";
      instructions = [
        "Apply 50% at sowing.",
        "Dissolve 2-3 kg in 100 liters of water for foliar spray at tillering.",
        "Apply late in the evening to optimize absorption."
      ];
      safetyTips = [
        "Rinse equipment thoroughly after spraying to avoid corrosive build-up.",
        "Store in a highly dry environment to prevent caking."
      ];
    } else if (defN > 15 && defP > 15) {
      recommendedFertilizer = "NPK 12-32-16 (Complex)";
      reason = `The soil requires heavy phosphorus and nitrogen supplements with less potassium. NPK 12-32-16 delivers a heavy phosphorus ratio, perfect for root establishment and grain filling in crops like Wheat and Maize.`;
      dosage = "150 kg per hectare as basal";
      instructions = [
        "Apply before sowing or transplanting.",
        "Blend into top 4 inches of topsoil.",
        "Ideal for root crops and coarse grain cereals."
      ];
      safetyTips = [
        "Wash clothes immediately if fertilizer dust gets soaked in sweat.",
        "Keep stored packages dry."
      ];
    } else {
      recommendedFertilizer = "NPK 10-26-26 (Complex)";
      reason = `Your soil is rich in Nitrogen but severely deficient in both Phosphorus and Potassium. NPK 10-26-26 provides a high charge of P & K, ideal for tuber development and fruit crops.`;
      dosage = "140 kg per hectare during early vegetative stages";
      instructions = [
        "Apply directly along plant row furrows.",
        "Irrigate immediately to release potassium ions into soil solution.",
        "Do not apply closer than 3 inches to the young plant stem."
      ];
      safetyTips = [
        "Avoid eating or drinking while applying fertilizer.",
        "Use rubber boots during soil broadcasting."
      ];
    }
  }

  // Calculate prediction confidence score with deviations
  let confidence = 95;
  const optimalpHMin = optimum.pHMin;
  const optimalpHMax = optimum.pHMax;

  if (pH < optimalpHMin || pH > optimalpHMax) {
    confidence -= 10;
  }
  if (rainfall < optimum.rainMin || rainfall > optimum.rainMax) {
    confidence -= 8;
  }
  if (temperature < 15 || temperature > 40) {
    confidence -= 7;
  }

  confidence = Math.max(68, Math.min(confidence, 98));

  return {
    recommendedFertilizer,
    confidence,
    reason,
    dosage,
    instructions,
    safetyTips,
  };
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Weather and location simulation
function getDetailedLocationData(locationName: string, cropName: string) {
  const loc = locationName.toLowerCase().trim();
  const crop = cropName.toLowerCase().trim();

  // 1. Establish a base agro-climatic zone default
  let tempBase = 28;
  let humidityBase = 70;
  let rainfallBase = 120;
  let pHBase = 6.5;
  let soilTypeBase = "Loamy";
  
  // Base NPK (mg/kg)
  let nBase = 60;
  let pBase = 45;
  let kBase = 45;

  // Base micronutrients
  let organicCarbonBase = 0.55;
  let electricalConductivityBase = 0.35;
  let zincBase = 1.0;
  let ironBase = 12.0;
  let copperBase = 0.4;
  let manganeseBase = 4.5;
  let boronBase = 0.4;

  // 2. Identify region from keyword matching (comprehensive Indian & global regions)
  if (
    loc.includes("ooty") || 
    loc.includes("nilgiri") || 
    loc.includes("hill") || 
    loc.includes("shimla") || 
    loc.includes("manali") || 
    loc.includes("kashmir") || 
    loc.includes("srinagar") || 
    loc.includes("darjeeling") || 
    loc.includes("himalay") ||
    loc.includes("solan") ||
    loc.includes("kodaikanal")
  ) {
    // Cold Mountain / Highland Zone
    tempBase = 15;
    humidityBase = 85;
    rainfallBase = 180;
    pHBase = 5.2; // Acidic mountain/laterite soils
    soilTypeBase = "Peaty";
    nBase = 110;
    pBase = 25;
    kBase = 70;
    organicCarbonBase = 1.65; // High organic matter
    electricalConductivityBase = 0.15;
    zincBase = 0.5;
    ironBase = 28.0; // High iron in laterite/hills
    copperBase = 0.2;
    manganeseBase = 2.8;
    boronBase = 0.2;
  } else if (
    loc.includes("chennai") || 
    loc.includes("pondicherry") || 
    loc.includes("kochi") || 
    loc.includes("trivandrum") || 
    loc.includes("kerala") || 
    loc.includes("goa") || 
    loc.includes("mumbai") || 
    loc.includes("mangalore") || 
    loc.includes("coastal") || 
    loc.includes("vizag") || 
    loc.includes("visakhapatnam") ||
    loc.includes("kanyakumari") ||
    loc.includes("cuttack") ||
    loc.includes("puri")
  ) {
    // Coastal Tropical / Humid Monsoon Zone
    tempBase = 31;
    humidityBase = 82;
    rainfallBase = 220;
    pHBase = 6.8;
    soilTypeBase = "Alluvial";
    nBase = 85;
    pBase = 35;
    kBase = 85;
    organicCarbonBase = 0.50;
    electricalConductivityBase = 0.85; // High salinity near coasts
    zincBase = 1.2;
    ironBase = 14.0;
    copperBase = 0.5;
    manganeseBase = 5.0;
    boronBase = 0.3;
  } else if (
    loc.includes("pune") || 
    loc.includes("maharashtra") || 
    loc.includes("nagpur") || 
    loc.includes("nashik") || 
    loc.includes("aurangabad") || 
    loc.includes("jalgaon") || 
    loc.includes("solapur") || 
    loc.includes("kolhapur") || 
    loc.includes("amravati") || 
    loc.includes("wardha")
  ) {
    // Black Soil / Deccan Trap Zone
    tempBase = 27;
    humidityBase = 55;
    rainfallBase = 85;
    pHBase = 7.8; // Calcareous alkaline black cotton soil
    soilTypeBase = "Black";
    nBase = 55;
    pBase = 50;
    kBase = 130; // Very rich in potash
    organicCarbonBase = 0.45;
    electricalConductivityBase = 0.28;
    zincBase = 0.7;
    ironBase = 6.5;
    copperBase = 0.6;
    manganeseBase = 8.5;
    boronBase = 0.5;
  } else if (
    loc.includes("jaipur") || 
    loc.includes("jodhpur") || 
    loc.includes("rajasthan") || 
    loc.includes("bikaner") || 
    loc.includes("jaisalmer") || 
    loc.includes("barmer") || 
    loc.includes("desert") || 
    loc.includes("kutch") || 
    loc.includes("bhuj")
  ) {
    // Arid / Desert Zone
    tempBase = 34;
    humidityBase = 38;
    rainfallBase = 45;
    pHBase = 8.4; // Highly alkaline, saline
    soilTypeBase = "Sandy";
    nBase = 35;
    pBase = 25;
    kBase = 120;
    organicCarbonBase = 0.22; // Sandy soils have very poor carbon
    electricalConductivityBase = 1.35; // High EC due to salt build up
    zincBase = 0.4;
    ironBase = 4.0;
    copperBase = 0.15;
    manganeseBase = 1.8;
    boronBase = 0.3;
  } else if (
    loc.includes("bengaluru") || 
    loc.includes("bangalore") || 
    loc.includes("mysore") || 
    loc.includes("karnataka") || 
    loc.includes("kolar") || 
    loc.includes("tumkur") || 
    loc.includes("chittoor") || 
    loc.includes("anantapur") || 
    loc.includes("dharmapuri") || 
    loc.includes("krishnagiri")
  ) {
    // Red Soil / South Deccan Plateau
    tempBase = 25;
    humidityBase = 65;
    rainfallBase = 90;
    pHBase = 6.2; // Slightly acidic Red Soil
    soilTypeBase = "Red";
    nBase = 75;
    pBase = 45;
    kBase = 95;
    organicCarbonBase = 0.58;
    electricalConductivityBase = 0.22;
    zincBase = 0.9;
    ironBase = 16.0; // Red soils are rich in iron oxides
    copperBase = 0.4;
    manganeseBase = 5.5;
    boronBase = 0.4;
  } else if (
    loc.includes("delhi") || 
    loc.includes("punjab") || 
    loc.includes("haryana") || 
    loc.includes("ludhiana") || 
    loc.includes("amritsar") || 
    loc.includes("uttar pradesh") || 
    loc.includes("lucknow") || 
    loc.includes("kanpur") || 
    loc.includes("bihar") || 
    loc.includes("patna") || 
    loc.includes("kolkata") || 
    loc.includes("west bengal") || 
    loc.includes("alluvial") || 
    loc.includes("plains") || 
    loc.includes("ghaziabad") || 
    loc.includes("noida") || 
    loc.includes("agra") || 
    loc.includes("varanasi") || 
    loc.includes("allahabad") || 
    loc.includes("prayagraj")
  ) {
    // Indo-Gangetic Plains / Fertile Alluvial Zone
    tempBase = 29;
    humidityBase = 60;
    rainfallBase = 110;
    pHBase = 7.5;
    soilTypeBase = "Alluvial";
    nBase = 100;
    pBase = 55;
    kBase = 110;
    organicCarbonBase = 0.52;
    electricalConductivityBase = 0.45;
    zincBase = 0.7;
    ironBase = 9.0;
    copperBase = 0.5;
    manganeseBase = 4.0;
    boronBase = 0.5;
  } else if (
    loc.includes("coimbatore") || 
    loc.includes("madurai") || 
    loc.includes("salem") || 
    loc.includes("trichy") || 
    loc.includes("tiruchirappalli") || 
    loc.includes("erode") || 
    loc.includes("tirupur") || 
    loc.includes("karur") || 
    loc.includes("namakkal") || 
    loc.includes("thanjavur") || 
    loc.includes("nellai") || 
    loc.includes("tirunelveli") || 
    loc.includes("tuticorin") || 
    loc.includes("thoothukudi") || 
    loc.includes("vellore")
  ) {
    // Southern Inland Plains / Tamil Nadu Plains
    tempBase = 30;
    humidityBase = 63;
    rainfallBase = 80;
    pHBase = 7.2;
    soilTypeBase = "Loamy";
    nBase = 65;
    pBase = 42;
    kBase = 115;
    organicCarbonBase = 0.52;
    electricalConductivityBase = 0.32;
    zincBase = 0.8;
    ironBase = 8.0;
    copperBase = 0.35;
    manganeseBase = 4.0;
    boronBase = 0.45;
  } else {
    // Fallback: Use string hash to create a deterministic, realistic variation so that ANY city feels highly unique!
    const hash = locationName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    tempBase = 24 + (hash % 10); // 24 to 33 C
    humidityBase = 50 + (hash % 36); // 50 to 85%
    rainfallBase = 60 + (hash % 160); // 60 to 220 mm
    pHBase = Number((5.8 + ((hash % 18) / 10)).toFixed(1)); // 5.8 to 7.5
    
    const soilTypes = ["Loamy", "Clayey", "Sandy", "Silty", "Alluvial", "Red", "Black"];
    soilTypeBase = soilTypes[hash % soilTypes.length];
    
    nBase = 50 + (hash % 61); // 50 to 110
    pBase = 30 + (hash % 41); // 30 to 70
    kBase = 30 + (hash % 91); // 30 to 120
    
    organicCarbonBase = Number((0.35 + ((hash % 85) / 100)).toFixed(2)); // 0.35 to 1.2
    electricalConductivityBase = Number((0.15 + ((hash % 70) / 100)).toFixed(2)); // 0.15 to 0.85
    zincBase = Number((0.4 + ((hash % 15) / 10)).toFixed(2));
    ironBase = Number((3.5 + (hash % 20)).toFixed(1));
    copperBase = Number((0.15 + ((hash % 25) / 100)).toFixed(2));
    manganeseBase = Number((1.5 + ((hash % 80) / 10)).toFixed(1));
    boronBase = Number((0.2 + ((hash % 10) / 10)).toFixed(2));
  }

  // 3. Dynamic adjustment based on the CROP's typical ideal growth microclimate!
  let N = nBase;
  let P = pBase;
  let K = kBase;
  let temp = tempBase;
  let humidity = humidityBase;
  let rainfall = rainfallBase;
  let pH = pHBase;
  let soilType = soilTypeBase;

  switch (crop) {
    case "rice":
      rainfall = Math.max(160, rainfallBase + 40);
      humidity = Math.max(75, humidityBase + 10);
      temp = Math.max(26, Math.min(tempBase + 1, 33));
      pH = Number(Math.max(5.5, Math.min(pHBase - 0.2, 7.0)).toFixed(1));
      if (soilType === "Sandy") soilType = "Clayey";
      N = Math.round(N * 1.2);
      break;

    case "maize":
      rainfall = Math.max(80, Math.min(rainfallBase, 150));
      humidity = Math.max(55, Math.min(humidityBase, 75));
      temp = Math.max(22, Math.min(tempBase, 30));
      N = Math.round(N * 1.1);
      P = Math.round(P * 1.1);
      break;

    case "cotton":
      temp = Math.max(28, tempBase + 2);
      humidity = Math.max(40, Math.min(humidityBase - 10, 65));
      rainfall = Math.max(50, Math.min(rainfallBase - 30, 100));
      if (soilType === "Sandy" || soilType === "Peaty") soilType = "Black";
      K = Math.round(K * 1.2);
      break;

    case "sugarcane":
      temp = Math.max(27, tempBase + 1);
      humidity = Math.max(70, humidityBase + 5);
      rainfall = Math.max(140, rainfallBase + 20);
      N = Math.round(N * 1.3);
      P = Math.round(P * 1.2);
      break;

    case "banana":
      temp = Math.max(26, tempBase);
      humidity = Math.max(75, humidityBase + 5);
      rainfall = Math.max(150, rainfallBase + 30);
      K = Math.round(K * 1.4);
      break;

    case "mango":
      temp = Math.max(28, tempBase + 1);
      humidity = Math.max(45, Math.min(humidityBase - 15, 60));
      rainfall = Math.max(40, Math.min(rainfallBase - 40, 90));
      pH = Number(Math.max(5.8, Math.min(pHBase, 7.2)).toFixed(1));
      if (soilType === "Clayey" || soilType === "Black") soilType = "Red";
      break;

    case "groundnut":
      rainfall = Math.max(50, Math.min(rainfallBase - 20, 95));
      humidity = Math.max(50, Math.min(humidityBase - 5, 70));
      pH = Number(Math.max(6.0, Math.min(pHBase, 7.5)).toFixed(1));
      if (soilType === "Clayey" || soilType === "Black") soilType = "Sandy";
      N = Math.round(N * 0.5);
      P = Math.round(P * 1.3);
      break;

    case "grapes":
      temp = Math.max(24, Math.min(tempBase, 30));
      humidity = Math.max(45, Math.min(humidityBase - 10, 60));
      rainfall = Math.max(40, Math.min(rainfallBase - 50, 80));
      if (soilType === "Clayey") soilType = "Sandy";
      K = Math.round(K * 1.3);
      break;

    case "watermelon":
      temp = Math.max(28, tempBase + 3);
      humidity = Math.max(40, Math.min(humidityBase - 15, 60));
      rainfall = Math.max(45, Math.min(rainfallBase - 30, 85));
      if (soilType === "Clayey" || soilType === "Black") soilType = "Sandy";
      break;

    case "pomegranate":
      temp = Math.max(29, tempBase + 2);
      humidity = Math.max(35, Math.min(humidityBase - 20, 55));
      rainfall = Math.max(35, Math.min(rainfallBase - 50, 75));
      pH = Number(Math.max(6.5, pHBase + 0.3).toFixed(1));
      if (soilType === "Clayey" || soilType === "Peaty") soilType = "Red";
      break;
  }

  // Constrain to acceptable form bounds
  N = Math.max(10, Math.min(N, 140));
  P = Math.max(10, Math.min(P, 130));
  K = Math.max(10, Math.min(K, 140));
  temp = Math.max(12, Math.min(temp, 45));
  humidity = Math.max(20, Math.min(humidity, 95));
  rainfall = Math.max(30, Math.min(rainfall, 280));
  pH = Number(Math.max(4.0, Math.min(pH, 9.0)).toFixed(1));

  return {
    temperature: temp,
    humidity,
    rainfall,
    pH,
    N,
    P,
    K,
    soilType,
    organicCarbon: organicCarbonBase,
    electricalConductivity: electricalConductivityBase,
    zinc: zincBase,
    iron: ironBase,
    copper: copperBase,
    manganese: manganeseBase,
    boron: boronBase,
    success: true
  };
}

app.get("/api/weather", (req, res) => {
  const location = req.query.location?.toString() || "Chennai, TN";
  const crop = req.query.crop?.toString() || "Rice";

  const result = getDetailedLocationData(location, crop);

  res.json({
    location,
    crop,
    ...result,
    conditions: result.temperature > 30 ? "Warm and Sunny" : result.temperature < 24 ? "Cool and Humid" : "Moderate & Clear"
  });
});

// 2. Submit soil inputs and get machine learning recommendation + Gemini AI insights
app.post("/api/predict", async (req, res) => {
  try {
    const { 
      crop, N, P, K, temperature, humidity, rainfall, pH, location,
      organicCarbon, electricalConductivity, zinc, iron, copper, manganese, boron, soilType 
    } = req.body;

    // Validation
    if (!crop || N === undefined || P === undefined || K === undefined || !temperature || !humidity || !rainfall || !pH) {
      return res.status(400).json({ error: "Please fill and validate all soil parameters." });
    }

    const numericN = Number(N);
    const numericP = Number(P);
    const numericK = Number(K);
    const numericTemp = Number(temperature);
    const numericHumid = Number(humidity);
    const numericRain = Number(rainfall);
    const numericPH = Number(pH);

    if (isNaN(numericN) || isNaN(numericP) || isNaN(numericK) || isNaN(numericTemp) || isNaN(numericHumid) || isNaN(numericRain) || isNaN(numericPH)) {
      return res.status(400).json({ error: "All input fields must be valid numeric values." });
    }

    const inputData: MLInput = {
      crop,
      N: numericN,
      P: numericP,
      K: numericK,
      temperature: numericTemp,
      humidity: numericHumid,
      rainfall: numericRain,
      pH: numericPH,
    };

    // Run ML prediction
    const mlOutput = runMLClassifier(inputData);

    // Call Gemini API to expand details (using prompts with agricultural settings)
    const gemini = getGeminiClient();
    let aiExplanation = "";

    const systemPrompt = `You are a professional agricultural scientist and farm extension advisor.
You must analyze the farmer's crop choice, soil nutrient profile, and recommended fertilizer.
Your response MUST be simple, crisp, neat, and highly readable. Avoid long-winded or verbose text.

Provide the advice in this exact markdown structure:
### 📋 **Soil Suitability Verdict**
[State clearly whether the farmer can use this recommended fertilizer or not, highlighting any specific cautions like pH limits, soil type, electrical conductivity (salinity), or micro-nutrient statuses.]

### 🌱 **Agricultural Reason**
- [Provide 1-2 neat, short bullets explaining why this recommended fertilizer is ideal for this crop under these conditions.]

### 💧 **Application Instructions**
- [Provide simple, clear steps on how and when to apply this fertilizer.]

### 🌾 **Organic Alternatives**
- [Mention 1-2 neat organic alternatives for natural farming.]`;

    const userPrompt = `
Farmer Parameters:
Crop Choice: ${crop}
Soil Nutrients: N=${N}, P=${P}, K=${K}
Weather: Temp=${temperature}°C, Humidity=${humidity}%, Rainfall=${rainfall}mm
Soil pH: ${pH}
${soilType ? `Soil Type: ${soilType}` : ""}
${organicCarbon !== undefined && organicCarbon !== "" ? `Organic Carbon: ${organicCarbon}%` : ""}
${electricalConductivity !== undefined && electricalConductivity !== "" ? `Electrical Conductivity (EC): ${electricalConductivity} dS/m` : ""}
${zinc !== undefined && zinc !== "" ? `Zinc: ${zinc} ppm` : ""}
${iron !== undefined && iron !== "" ? `Iron: ${iron} ppm` : ""}
${copper !== undefined && copper !== "" ? `Copper: ${copper} ppm` : ""}
${manganese !== undefined && manganese !== "" ? `Manganese: ${manganese} ppm` : ""}
${boron !== undefined && boron !== "" ? `Boron: ${boron} ppm` : ""}
Recommended Fertilizer: ${mlOutput.recommendedFertilizer}

Provide the response matching the specified template. Determine clearly whether the farmer can or should use ${mlOutput.recommendedFertilizer} under these conditions, and explain the neat agricultural reason in a highly simple, crisp format.`;

    if (gemini) {
      try {
        const response = await gemini.models.generateContent({
          model: "gemini-3.5-flash",
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.5,
          }
        });
        aiExplanation = response.text || "";
      } catch (err: any) {
        console.error("Gemini API call failed:", err.message);
        aiExplanation = `### 📋 **Soil Suitability Verdict**
**YES, you can use ${mlOutput.recommendedFertilizer}.** The soil is suitable, but ensure pH levels are monitored.

### 🌱 **Agricultural Reason**
- Your soil shows a balanced response for ${crop}, and ${mlOutput.recommendedFertilizer} will supply the critical macronutrients needed.

### 💧 **Application Instructions**
- Apply in split doses (basal and top-dressing) to maximize nutrient uptake.

### 🌾 **Organic Alternatives**
- Vermicompost or well-decomposed farmyard manure.

*(Note: Active Gemini service was temporarily unavailable; displaying standard expert analysis).*`;
      }
    } else {
      aiExplanation = `### 📋 **Soil Suitability Verdict**
**YES, you can use ${mlOutput.recommendedFertilizer}.** Your current conditions match the optimal thresholds for ${crop}.

### 🌱 **Agricultural Reason**
- ${mlOutput.reason}

### 💧 **Application Instructions**
- ${mlOutput.instructions.join(" ")}

### 🌾 **Organic Alternatives**
- Use rich compost, bio-fertilizers, or green manures to elevate soil humus naturally.

*(Note: Configure your GEMINI_API_KEY to activate customized real-time dynamic intelligence).*`;
    }

    const newRecommendation: Recommendation = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      date: new Date().toISOString(),
      crop,
      N: numericN,
      P: numericP,
      K: numericK,
      temperature: numericTemp,
      humidity: numericHumid,
      rainfall: numericRain,
      pH: numericPH,
      location: location || "Chennai, TN",
      recommendedFertilizer: mlOutput.recommendedFertilizer,
      confidence: mlOutput.confidence,
      reason: aiExplanation || mlOutput.reason,
      dosage: mlOutput.dosage,
      instructions: mlOutput.instructions,
      safetyTips: mlOutput.safetyTips,
      organicCarbon: organicCarbon !== undefined && organicCarbon !== "" ? Number(organicCarbon) : undefined,
      electricalConductivity: electricalConductivity !== undefined && electricalConductivity !== "" ? Number(electricalConductivity) : undefined,
      zinc: zinc !== undefined && zinc !== "" ? Number(zinc) : undefined,
      iron: iron !== undefined && iron !== "" ? Number(iron) : undefined,
      copper: copper !== undefined && copper !== "" ? Number(copper) : undefined,
      manganese: manganese !== undefined && manganese !== "" ? Number(manganese) : undefined,
      boron: boron !== undefined && boron !== "" ? Number(boron) : undefined,
      soilType: soilType || undefined,
    };

    // Save into database
    db.recommendations.push(newRecommendation);
    saveDatabase(db);

    // Logging activity
    db.admin_logs.push({
      id: `log_${Date.now()}`,
      action: "PREDICTION_CREATED",
      details: `New prediction for ${crop} -> ${mlOutput.recommendedFertilizer}`,
      timestamp: new Date().toISOString()
    });
    saveDatabase(db);

    res.json(newRecommendation);

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. AI Assistant Chatbot API with Retrieval Augmented Generation (RAG)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId, cropContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message content cannot be empty." });
    }

    const sId = sessionId || `session_${Date.now()}`;
    let session = db.chat_history.find(s => s.id === sId);

    if (!session) {
      session = {
        id: sId,
        title: message.substring(0, 30) + (message.length > 30 ? "..." : ""),
        messages: [],
        updatedAt: new Date().toISOString()
      };
      db.chat_history.push(session);
    }

    // Retrieve context from ChromaDB mock
    const retrievedContext = retrieveKnowledge(message);

    const systemInstruction = `You are a friendly and expert Agricultural AI Assistant. 
You answer farming questions, offer irrigation recommendations, diagnose plant diseases, and suggest fertilizer usage based on retrieved crop guidelines and standard scientific manuals.
Translate to Tamil if requested (Tamil: தமிழ்). Keep replies highly structured, engaging, and under 250 words.

[RETRIEVED AGRI-KNOWLEDGE BASE CONTEXT (ChromaDB)]:
${retrievedContext}

${cropContext ? `The farmer is currently analyzing a crop: ${JSON.stringify(cropContext)}` : ""}`;

    // Add user message to session
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      text: message,
      timestamp: new Date().toISOString()
    };
    session.messages.push(userMsg);

    // Call Gemini API
    const gemini = getGeminiClient();
    let modelReply = "";

    if (gemini) {
      try {
        // Construct chat payload mapping history
        const chatParts = session.messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

        const response = await gemini.models.generateContent({
          model: "gemini-3.5-flash",
          contents: message,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        modelReply = response.text || "I was unable to compile an answer. Please rephrase your question.";
      } catch (err: any) {
        console.error("Chat Gemini API failed:", err.message);
        modelReply = `Thank you for your question! Based on my agricultural knowledge pool:
- **Best irrigation:** Depend on your crop. Bananas and sugarcane thrive on drip lines, whereas Rice requires flooded transplanting and monitored soil saturation.
- **Organic alternative:** Consider composting dry crop residues and adding farmyard manure.
*(API offline fallback: Please configure GEMINI_API_KEY inside Settings > Secrets to unlock full live capabilities).*`;
      }
    } else {
      modelReply = `Hello! Based on our agricultural reference guides:
1. **Soil Nutrition:** Always monitor Nitrogen, Phosphorus, and Potassium balance. High Urea can cause nitrogen burns.
2. **Organic Compost:** Excellent for adjusting soil microbial profiles.
3. **Weather advice:** Plan planting around monsoon calendars.

*(Note: Live AI responses require a GEMINI_API_KEY in the secrets menu. Showing compiled database tips).*`;
    }

    const modelMsg: ChatMessage = {
      id: `msg_model_${Date.now()}`,
      role: "model",
      text: modelReply,
      timestamp: new Date().toISOString()
    };
    session.messages.push(modelMsg);
    session.updatedAt = new Date().toISOString();
    saveDatabase(db);

    res.json({
      sessionId: session.id,
      title: session.title,
      messages: session.messages,
      retrievedContext
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Retrieve Recommendation History (with filter, search, sort, and delete)
app.get("/api/history", (req, res) => {
  try {
    let list = [...db.recommendations];
    const { search, crop, fertilizer, sort } = req.query;

    if (search) {
      const q = search.toString().toLowerCase();
      list = list.filter(item =>
        item.crop.toLowerCase().includes(q) ||
        item.recommendedFertilizer.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      );
    }

    if (crop) {
      list = list.filter(item => item.crop.toLowerCase() === crop.toString().toLowerCase());
    }

    if (fertilizer) {
      list = list.filter(item => item.recommendedFertilizer.toLowerCase() === fertilizer.toString().toLowerCase());
    }

    // Sort: default to newest date
    if (sort === "oldest") {
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete item from prediction history
app.delete("/api/history/:id", (req, res) => {
  try {
    const { id } = req.params;
    const initialLen = db.recommendations.length;
    db.recommendations = db.recommendations.filter(r => r.id !== id);

    if (db.recommendations.length === initialLen) {
      return res.status(404).json({ error: "Prediction not found." });
    }

    saveDatabase(db);

    // Logging activity
    db.admin_logs.push({
      id: `log_${Date.now()}`,
      action: "PREDICTION_DELETED",
      details: `Deleted prediction with ID: ${id}`,
      timestamp: new Date().toISOString()
    });
    saveDatabase(db);

    res.json({ success: true, message: "Recommendation deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Retrieve Active Chat Sessions
app.get("/api/chat/sessions", (req, res) => {
  res.json(db.chat_history.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
});

// Delete a chat session
app.delete("/api/chat/sessions/:id", (req, res) => {
  const { id } = req.params;
  db.chat_history = db.chat_history.filter(s => s.id !== id);
  saveDatabase(db);
  res.json({ success: true });
});

// 6. Admin Analytics & Charts Data
app.get("/api/admin/stats", (req, res) => {
  try {
    const list = db.recommendations;
    const total = list.length;

    // Calculate Fertilizer Popularity
    const fertCount: Record<string, number> = {};
    const cropCount: Record<string, number> = {};
    const monthlyCount: Record<string, number> = {};

    list.forEach(item => {
      // Fertilizers
      const f = item.recommendedFertilizer;
      fertCount[f] = (fertCount[f] || 0) + 1;

      // Crops
      const c = item.crop;
      cropCount[c] = (cropCount[c] || 0) + 1;

      // Monthly predicts (e.g. "2026-06")
      try {
        const dateObj = new Date(item.date);
        const yearMonth = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
        monthlyCount[yearMonth] = (monthlyCount[yearMonth] || 0) + 1;
      } catch (e) {}
    });

    // Sort to find popular ones
    const sortedFerts = Object.entries(fertCount).sort((a, b) => b[1] - a[1]);
    const sortedCrops = Object.entries(cropCount).sort((a, b) => b[1] - a[1]);

    const popularFertilizer = sortedFerts[0] ? sortedFerts[0][0] : "None";
    const popularCrop = sortedCrops[0] ? sortedCrops[0][0] : "None";

    // Format fertilizers for Recharts pie chart
    const fertilizerChartData = Object.entries(fertCount).map(([name, value]) => ({
      name,
      value
    }));

    // Format crops for Recharts bar chart
    const cropChartData = Object.entries(cropCount).map(([name, count]) => ({
      name,
      count
    }));

    // Format monthly counts for Recharts line chart (sorted by month)
    const monthlyChartData = Object.entries(monthlyCount)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, predictions]) => {
        const [yr, mo] = month.split("-");
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return {
          month: `${monthNames[Number(mo) - 1]} ${yr}`,
          predictions
        };
      });

    // Average inputs stats
    let avgN = 0, avgP = 0, avgK = 0, avgPH = 0;
    if (total > 0) {
      avgN = Number((list.reduce((sum, item) => sum + item.N, 0) / total).toFixed(1));
      avgP = Number((list.reduce((sum, item) => sum + item.P, 0) / total).toFixed(1));
      avgK = Number((list.reduce((sum, item) => sum + item.K, 0) / total).toFixed(1));
      avgPH = Number((list.reduce((sum, item) => sum + item.pH, 0) / total).toFixed(1));
    }

    res.json({
      totalRecommendations: total,
      popularFertilizer,
      popularCrop,
      totalFeedback: db.feedback.length,
      averages: { avgN, avgP, avgK, avgPH },
      charts: {
        fertilizers: fertilizerChartData,
        crops: cropChartData,
        monthly: monthlyChartData
      },
      recentPredictions: list.slice(-8).reverse() // newest 8
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Contact Feedback Submission
app.post("/api/feedback", (req, res) => {
  try {
    const { name, email, message, rating } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }

    const newFb: Feedback = {
      id: `fb_${Date.now()}`,
      name,
      email,
      message,
      rating: rating || 5,
      timestamp: new Date().toISOString()
    };

    db.feedback.push(newFb);
    saveDatabase(db);

    // Log admin action
    db.admin_logs.push({
      id: `log_${Date.now()}`,
      action: "FEEDBACK_SUBMITTED",
      details: `Feedback received from ${name} (${email})`,
      timestamp: new Date().toISOString()
    });
    saveDatabase(db);

    res.json({ success: true, message: "Thank you for your feedback! It helps us improve farming suggestions." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve feedback list (for Admin)
app.get("/api/feedback", (req, res) => {
  res.json(db.feedback.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
});

// 7.5. Soil Report OCR Extraction using Gemini API
app.post("/api/ocr", async (req, res) => {
  try {
    let { image, mimeType } = req.body;
    if (!image) {
      console.error("[OCR ERROR]: Request received with no image data.");
      return res.status(400).json({ error: "No report image or document data received." });
    }

    // Clean up base64 prefix if present
    let base64Data = image;
    if (base64Data.startsWith("data:")) {
      const parts = base64Data.split(",");
      const header = parts[0];
      base64Data = parts[1];
      const match = header.match(/data:([^;]+);/);
      if (match) {
        mimeType = match[1];
      }
    }

    // Robust MIME type detection from base64 signature in case the frontend/browser provides missing or generic types
    if (!mimeType || mimeType === "application/octet-stream") {
      if (base64Data.startsWith("JVBERi")) {
        mimeType = "application/pdf";
      } else if (base64Data.startsWith("iVBORw0KGgo")) {
        mimeType = "image/png";
      } else if (base64Data.startsWith("/9j/") || base64Data.startsWith("/9j/4")) {
        mimeType = "image/jpeg";
      } else {
        mimeType = "image/jpeg"; // default fallback
      }
    }

    // Map legacy or custom variations (like image/jpg) to standard mimeType
    if (mimeType === "image/jpg") {
      mimeType = "image/jpeg";
    }

    // Validate size (estimate from base64 string length)
    const sizeInBytes = (base64Data.length * 3) / 4;
    const maxSize = 10 * 1024 * 1024; // 10 MB limit
    if (sizeInBytes > maxSize) {
      console.error(`[OCR ERROR]: Uploaded file size (${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB) exceeds 10 MB limit.`);
      return res.status(400).json({ error: "File size exceeds the 10 MB size limit." });
    }

    // Validate MIME type
    const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedMimeTypes.includes(mimeType)) {
      console.error(`[OCR ERROR]: Unsupported MIME type uploaded: ${mimeType}`);
      return res.status(400).json({ error: "Unsupported file format. Please upload an Image (PNG, JPG, JPEG) or PDF report." });
    }

    const gemini = getGeminiClient();
    if (gemini) {
      const systemPrompt = `You are an expert digital agricultural scientist specialized in parsing laboratory soil analysis reports.
Your job is to analyze the provided soil analysis document (image or PDF) and extract the critical parameters.
You must return a valid JSON object matching the requested schema exactly. Do not output any markdown backticks, explanations, or code blocks. Just output the raw JSON.`;

      const userPrompt = `Please parse this soil analysis report. Identify and extract the following parameters:
1. Target Crop (e.g., Rice, Maize, Cotton, Sugarcane, Banana, Mango, Groundnut, etc.) if mentioned; if not, return "Rice".
2. Nitrogen (N) content in mg/kg or ppm (should be an integer or decimal between 0 and 150).
3. Phosphorus (P) content in mg/kg or ppm (should be an integer or decimal between 0 and 150).
4. Potassium (K) content in mg/kg or ppm (should be an integer or decimal between 0 and 150).
5. Soil pH level (should be a decimal between 3.0 and 10.0).
6. Local ambient temperature in °C (if mentioned, otherwise default to a reasonable value like 28).
7. Ambient humidity in % (if mentioned, otherwise default to 75).
8. Regional rainfall in mm (if mentioned, otherwise default to 120).
9. Organic Carbon (%) (e.g., a decimal between 0.1 and 3.0, representing soil organic matter content).
10. Electrical Conductivity (EC) (in dS/m, e.g., a decimal between 0.05 and 4.0).
11. Zinc content (in ppm or mg/kg, e.g., a decimal between 0.1 and 5.0).
12. Iron content (in ppm or mg/kg, e.g., a decimal between 0.5 and 50.0).
13. Copper content (in ppm or mg/kg, e.g., a decimal between 0.1 and 5.0).
14. Manganese content (in ppm or mg/kg, e.g., a decimal between 1.0 and 30.0).
15. Boron content (in ppm or mg/kg, e.g., a decimal between 0.1 and 3.0).
16. Soil Type (must be one of: "Clayey", "Sandy", "Loamy", "Silty", "Peaty", "Chalky", "Saline", "Alluvial", "Red", "Black").

Return ONLY a flat JSON object in this format (no other text, no markdown block):
{
  "crop": "Rice",
  "N": 55,
  "P": 35,
  "K": 40,
  "pH": 6.5,
  "temperature": 27,
  "humidity": 70,
  "rainfall": 110,
  "organicCarbon": 0.65,
  "electricalConductivity": 0.42,
  "zinc": 1.2,
  "iron": 4.5,
  "copper": 0.35,
  "manganese": 2.8,
  "boron": 0.5,
  "soilType": "Loamy"
}`;

      try {
        const docPart = {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        };

        const response = await gemini.models.generateContent({
          model: "gemini-3.5-flash",
          contents: {
            parts: [
              docPart,
              { text: userPrompt }
            ]
          },
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json"
          }
        });

        const textOutput = response.text?.trim() || "";
        
        // Clean markdown code blocks if any
        let cleanJson = textOutput;
        if (cleanJson.startsWith("```json")) {
          cleanJson = cleanJson.substring(7);
        } else if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.substring(3);
        }
        if (cleanJson.endsWith("```")) {
          cleanJson = cleanJson.substring(0, cleanJson.length - 3);
        }
        cleanJson = cleanJson.trim();

        const extractedData = JSON.parse(cleanJson);
        console.log("[OCR SUCCESS]: Soil parameters successfully extracted via Gemini AI API:", extractedData);
        return res.json({
          success: true,
          ...extractedData,
          message: "Soil report parsed successfully by Gemini AI."
        });
      } catch (geminiErr: any) {
        console.error("[OCR EXCEPTION] Gemini API Parsing failed:", geminiErr);
        // Under actual operational error (bad file, parsing failed), return specific error as requested
        return res.status(422).json({ error: "Unable to extract soil data from the uploaded report." });
      }
    } else {
      // No Gemini API client (key missing) - return simulation data for frictionless preview testing
      console.warn("[OCR WARNING]: No GEMINI_API_KEY environment variable configured. Executing sandbox soil parsing simulation.");
      return res.json(getSimulatedOcrData("GEMINI_API_KEY environment variable is not configured."));
    }
  } catch (error: any) {
    console.error("[OCR ROUTE ERROR]: Fatal error inside OCR handler:", error);
    res.status(500).json({ error: "Unable to extract soil data from the uploaded report." });
  }
});

function getSimulatedOcrData(reason: string) {
  const cropList = ["Rice", "Maize", "Cotton", "Sugarcane", "Banana", "Mango", "Groundnut", "Grapes", "Watermelon", "Pomegranate"];
  const soilTypesList = ["Clayey", "Sandy", "Loamy", "Silty", "Peaty", "Chalky", "Saline", "Alluvial", "Red", "Black"];
  return {
    success: true,
    crop: cropList[Math.floor(Math.random() * cropList.length)],
    N: Math.floor(Math.random() * 50) + 35,
    P: Math.floor(Math.random() * 40) + 20,
    K: Math.floor(Math.random() * 40) + 25,
    pH: Number((5.8 + Math.random() * 1.5).toFixed(1)),
    temperature: Math.floor(Math.random() * 8) + 24,
    humidity: Math.floor(Math.random() * 15) + 65,
    rainfall: Math.floor(Math.random() * 80) + 90,
    organicCarbon: Number((0.3 + Math.random() * 1.5).toFixed(2)),
    electricalConductivity: Number((0.1 + Math.random() * 1.2).toFixed(2)),
    zinc: Number((0.2 + Math.random() * 2.0).toFixed(2)),
    iron: Number((1.5 + Math.random() * 15.0).toFixed(2)),
    copper: Number((0.1 + Math.random() * 1.5).toFixed(2)),
    manganese: Number((1.0 + Math.random() * 10.0).toFixed(2)),
    boron: Number((0.1 + Math.random() * 1.2).toFixed(2)),
    soilType: soilTypesList[Math.floor(Math.random() * soilTypesList.length)],
    isSimulated: true,
    message: `Soil report parsed successfully (Demo Simulation Mode: ${reason}).`
  };
}

// 8. Download PDF (or CSV) Reports simulation
app.get("/api/download-csv", (req, res) => {
  try {
    const list = db.recommendations;
    let csv = "Date,Crop,N,P,K,Temperature(C),Humidity(%),Rainfall(mm),pH,Recommended Fertilizer,Confidence(%)\n";
    list.forEach(r => {
      csv += `"${new Date(r.date).toLocaleDateString()}","${r.crop}",${r.N},${r.P},${r.K},${r.temperature},${r.humidity},${r.rainfall},${r.pH},"${r.recommendedFertilizer}",${r.confidence}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=fertilizer_recommendations.csv");
    res.send(csv);
  } catch (err: any) {
    res.status(500).send("Failed to export history as CSV");
  }
});

// ----------------------------------------------------
// BOOTSTRAP VITE OR STATIC ASSETS ROUTING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static files from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
