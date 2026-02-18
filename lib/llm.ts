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

  const prompt = `You are a relocation expert helping someone move from ${input.originCountry} to ${input.destinationCountry}.

User profile:
- Nationality: ${input.nationality}
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

/**
 * Future: generate a fully custom task list for a user profile,
 * replacing the seeded TaskTemplate approach entirely.
 * Placeholder — not yet implemented.
 */
export async function generateJourneyTasks(_profile: {
  nationality: string;
  originCountry: string;
  destinationCountry: string;
  employmentStatus: string;
  familyStatus: string;
}): Promise<never> {
  throw new Error("generateJourneyTasks is not yet implemented.");
}
