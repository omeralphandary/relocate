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
  destinationCity?: string | null;
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

  const destination = input.destinationCity
    ? `${input.destinationCity}, ${input.destinationCountry}`
    : input.destinationCountry;

  const prompt = `You are a relocation expert helping someone move from ${input.originCountry} to ${destination}.

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
  "tips": "One practical insider tip specific to ${destination}"
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
  destinationCity?: string | null;
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

  const destination = input.destinationCity
    ? `${input.destinationCity}, ${input.destinationCountry}`
    : input.destinationCountry;

  const prompt = `You are a relocation expert helping someone move from ${input.originCountry} to ${destination}.

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
  "tips": "One practical insider tip specific to ${destination}"
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

/**
 * Generates 4–5 corridor-specific quick-insight bullets shown on the journey view.
 * Fired once at journey creation time; result is stored on Journey.baselineTips.
 */
export async function generateBaselineTips(profile: {
  nationality: string;
  secondNationality?: string | null;
  originCountry: string;
  destinationCountry: string;
  destinationCity?: string | null;
  employmentStatus: string;
  familyStatus: string;
}): Promise<string[]> {
  const client = getClient();

  const nationalityLine = profile.secondNationality
    ? `${profile.nationality} + ${profile.secondNationality} (dual citizen)`
    : profile.nationality;

  const destination = profile.destinationCity
    ? `${profile.destinationCity}, ${profile.destinationCountry}`
    : profile.destinationCountry;

  const prompt = `You are a senior relocation expert. A ${nationalityLine} person is moving from ${profile.originCountry} to ${destination}. They are ${profile.employmentStatus.replace("_", "-")} and their family status is ${profile.familyStatus.replace("_", " ")}.

Generate exactly 4 short, sharp, corridor-specific insider tips they need to know before diving into their checklist. These should be the kind of things a friend who already made this move would tell you — not generic advice.

Each tip must be:
- 1 sentence, max 20 words
- Specific to this exact corridor (${profile.originCountry} → ${destination})
- Immediately actionable or eye-opening

Respond ONLY with a valid JSON array of 4 strings:
["Tip one.", "Tip two.", "Tip three.", "Tip four."]`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("LLM returned unexpected format for baseline tips");

  return JSON.parse(jsonMatch[0]) as string[];
}

export interface GeneratedTask {
  title: string;
  description: string;
  category: string;
  documents: string[];
  tips: string;
  instructions: string;
  officialUrl?: string | null;
  order: number;
}

/**
 * Generates a full task list for a corridor not covered by seed data.
 * Tasks are created directly as JourneyTask records (taskId: null) — not saved as templates.
 */
export async function generateJourneyTasks(profile: {
  nationality: string;
  secondNationality?: string | null;
  originCountry: string;
  destinationCountry: string;
  destinationCity?: string | null;
  employmentStatus: string;
  familyStatus: string;
}): Promise<GeneratedTask[]> {
  const client = getClient();

  const nationalityLine = profile.secondNationality
    ? `- Nationality: ${profile.nationality} + ${profile.secondNationality} (dual citizen)`
    : `- Nationality: ${profile.nationality}`;

  const destination = profile.destinationCity
    ? `${profile.destinationCity}, ${profile.destinationCountry}`
    : profile.destinationCountry;

  const prompt = `You are a relocation expert. Generate a comprehensive POST-ARRIVAL task list for someone moving from ${profile.originCountry} to ${destination}.

User profile:
${nationalityLine}
- Employment: ${profile.employmentStatus}
- Family status: ${profile.familyStatus}

Generate 12-16 essential post-arrival tasks. You MUST cover ALL of these core categories with at least one task each:
- housing (find accommodation, register address)
- banking (open local bank account, set up local payments)
- legal (residence permit, registration, visa compliance)
- telecom (local SIM card or mobile plan)
- transport (local transport card, driving licence exchange if applicable)
- insurance (health insurance, contents insurance)
- documents (notarise or translate key documents for local use)

Additional categories to include if relevant: education (language courses), general (register with GP/doctor).

Important:
- These are POST-ARRIVAL tasks specific to ${destination}
- Order tasks by urgency (most urgent first)
- Include country-specific details, office names, and realistic timelines for ${destination}
- Each task must be actionable and specific to this destination

Respond ONLY with a valid JSON array:
[
  {
    "title": "Short, clear task title",
    "description": "1-2 sentence overview of what this task involves and why",
    "instructions": "Step-by-step instructions for this user's specific situation (2-4 sentences, mention country-specific offices or processes)",
    "category": "housing|banking|legal|telecom|transport|insurance|documents|education|general",
    "documents": ["Required document 1", "Required document 2"],
    "tips": "One practical insider tip specific to ${destination}",
    "officialUrl": "https://relevant-government-url or null",
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
