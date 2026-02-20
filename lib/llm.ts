import Anthropic from "@anthropic-ai/sdk";

/**
 * Thin wrapper around the Anthropic SDK.
 * The rest of the app imports from here — never directly from the SDK —
 * so the underlying model/provider can be swapped without touching business logic.
 */

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set. Add it to your .env file.");
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export interface TaskEnrichmentInput {
  taskTitle: string;
  taskDescription: string;
  category: string;
  nationality: string;
  secondNationality?: string | null;
  originCountry: string;
  destinationCountry: string;
  employmentStatus: string;
  familyStatus: string;
  movingDate?: string | null;
}

export interface TaskEnrichmentOutput {
  instructions: string;
  documents: string[];
  tips: string;
}

/**
 * Given a task and a user profile, returns personalised, up-to-date
 * instructions, required documents, and a tip for that specific task.
 */
export async function enrichTask(input: TaskEnrichmentInput): Promise<TaskEnrichmentOutput> {
  const client = getClient();

  const nationalityLine = input.secondNationality
    ? `- Nationality: ${input.nationality} + ${input.secondNationality} (dual citizen)`
    : `- Nationality: ${input.nationality}`;

  const prompt = `You are a relocation expert helping someone move from ${input.originCountry} to ${input.destinationCountry}.

User profile:
${nationalityLine}
- Employment status: ${input.employmentStatus}
- Family status: ${input.familyStatus}
${input.movingDate ? `- Planned moving date: ${input.movingDate}` : ""}

Task: ${input.taskTitle}
Category: ${input.category}
Base description: ${input.taskDescription}

Provide personalised, practical, and up-to-date guidance for this specific task for this user.
Respond ONLY with a valid JSON object in this exact format:
{
  "instructions": "Step-by-step instructions specific to this user's situation (2-4 sentences)",
  "documents": ["Document 1", "Document 2"],
  "tips": "One practical insider tip specific to ${input.destinationCountry}"
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("LLM returned unexpected format");

  return JSON.parse(jsonMatch[0]) as TaskEnrichmentOutput;
}

export interface CustomTaskInput {
  userTitle: string;
  category: string;
  nationality: string;
  secondNationality?: string | null;
  originCountry: string;
  destinationCountry: string;
  employmentStatus: string;
  familyStatus: string;
  movingDate?: string | null;
}

export interface CustomTaskOutput {
  refinedTitle: string;
  description: string;
  instructions: string;
  documents: string[];
  tips: string;
}

/**
 * Given a user-provided task title and profile, generates a refined title,
 * description, instructions, required documents, and a tip for that custom task.
 */
export async function generateCustomTaskOverview(input: CustomTaskInput): Promise<CustomTaskOutput> {
  const client = getClient();

  const nationalityLine = input.secondNationality
    ? `- Nationality: ${input.nationality} + ${input.secondNationality} (dual citizen)`
    : `- Nationality: ${input.nationality}`;

  const prompt = `You are a relocation expert helping someone move from ${input.originCountry} to ${input.destinationCountry}.

User profile:
${nationalityLine}
- Employment status: ${input.employmentStatus}
- Family status: ${input.familyStatus}
${input.movingDate ? `- Planned moving date: ${input.movingDate}` : ""}

The user wants to add a custom relocation task: "${input.userTitle}"
Category: ${input.category}

Provide a refined title, description, step-by-step instructions, required documents, and a practical tip for this task.
Respond ONLY with a valid JSON object in this exact format:
{
  "refinedTitle": "Clear, specific task title",
  "description": "1-2 sentence overview of what this task involves",
  "instructions": "Step-by-step instructions specific to this user's situation (2-4 sentences)",
  "documents": ["Document 1", "Document 2"],
  "tips": "One practical insider tip specific to ${input.destinationCountry}"
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("LLM returned unexpected format");

  return JSON.parse(jsonMatch[0]) as CustomTaskOutput;
}

export interface GeneratedTask {
  title: string;
  description: string;
  category: string;
  documents: string[];
  tips: string;
  officialUrl?: string | null;
  order: number;
}

/**
 * Generates a full task list for a corridor not covered by seed data.
 * Results are saved as TaskTemplate records so subsequent users benefit from them.
 */
export async function generateJourneyTasks(profile: {
  nationality: string;
  secondNationality?: string | null;
  originCountry: string;
  destinationCountry: string;
  employmentStatus: string;
  familyStatus: string;
}): Promise<GeneratedTask[]> {
  const client = getClient();

  const nationalityLine = profile.secondNationality
    ? `- Nationality: ${profile.nationality} + ${profile.secondNationality} (dual citizen)`
    : `- Nationality: ${profile.nationality}`;

  const prompt = `You are a relocation expert. Generate a comprehensive relocation task list for someone moving from ${profile.originCountry} to ${profile.destinationCountry}.

User profile:
${nationalityLine}
- Employment: ${profile.employmentStatus}
- Family status: ${profile.familyStatus}

Generate 12-16 essential relocation tasks covering these categories: housing, telecom, banking, insurance, legal, transport.

Important:
- Order tasks by urgency (most urgent first within each category)
- Include country-specific details for ${profile.destinationCountry}
- Each task should be actionable and specific

Respond ONLY with a valid JSON array:
[
  {
    "title": "Short, clear task title",
    "description": "1-2 sentence description of exactly what to do and why",
    "category": "housing|telecom|banking|insurance|legal|transport",
    "documents": ["Required document 1", "Required document 2"],
    "tips": "One practical insider tip specific to ${profile.destinationCountry}",
    "officialUrl": "https://relevant-government-url.${profile.destinationCountry} or null",
    "order": 1
  }
]`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("LLM returned unexpected format for task generation");

  return JSON.parse(jsonMatch[0]) as GeneratedTask[];
}
