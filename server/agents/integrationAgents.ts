import { Type } from "@google/genai";
import { callGeminiResilient } from "../lib/gemini";
import { GmailPrefill, CalendarPrefill, DocsPrefill, SlidesPrefill, MeetPrefill } from "../../src/types/plan";

// 1. Email Agent
export async function runEmailAgent(
  context: string,
  planTheme: string,
  customPrompt: string
): Promise<GmailPrefill> {
  const systemPrompt = `You are PrepPilot's specialized Email Agent.
Your job is to compose a highly relevant, professional draft email (To, Subject, and Body) based on the user's specific request/refinement instructions and the general context of their task.
Keep the email body professional, polite, and concise (typically 3-5 sentences).
Return ONLY raw JSON matching the specified response schema.`;

  const userPrompt = `Overall Goal Context: "${context}"
Overall Strategy/Themes: "${planTheme}"
User Refinement Directive: "${customPrompt}"

Generate the prefilled fields. If the recipient email is unknown or not specified in the instructions, set "to" to an empty string.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      to: { type: Type.STRING, description: "Recipient email address if specified, otherwise empty string." },
      subject: { type: Type.STRING, description: "Concise professional email subject line." },
      body: { type: Type.STRING, description: "Professional email body content." }
    },
    required: ["to", "subject", "body"]
  };

  return await callGeminiResilient(systemPrompt, userPrompt, responseSchema);
}

// 2. Calendar Agent
export async function runCalendarAgent(
  context: string,
  daysAvailable: number,
  customPrompt: string
): Promise<CalendarPrefill> {
  const systemPrompt = `You are PrepPilot's specialized Calendar Agent.
Your job is to create a prefilled Google Calendar event (Title, Start Time, End Time, and Description) based on the user's request and task context.
Ensure the start and end times are valid ISO 8601 format timestamps. By default, schedule it for tomorrow or a logical time within the ${daysAvailable} days available.
Return ONLY raw JSON matching the specified response schema.`;

  const userPrompt = `Overall Goal Context: "${context}"
Days Available to complete: ${daysAvailable}
User Refinement Directive: "${customPrompt}"

Determine event title, description, start time, and end time. Make sure start time and end time are valid ISO 8601 strings.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Event title." },
      startTime: { type: Type.STRING, description: "Valid ISO 8601 timestamp for event start." },
      endTime: { type: Type.STRING, description: "Valid ISO 8601 timestamp for event end." },
      description: { type: Type.STRING, description: "Detailed description of what will be covered during this block." }
    },
    required: ["title", "startTime", "endTime", "description"]
  };

  return await callGeminiResilient(systemPrompt, userPrompt, responseSchema);
}

// 3. Docs Agent
export async function runDocsAgent(
  context: string,
  keyTopics: string,
  customPrompt: string
): Promise<DocsPrefill> {
  const systemPrompt = `You are PrepPilot's specialized Document Composition Agent.
Your job is to draft a comprehensive outline, reference cheat-sheet, or summary document (Title and Content) based on the user's instructions and the key topics.
The content should be rich, structured with headers and bullet points, and highly actionable.
Return ONLY raw JSON matching the specified response schema.`;

  const userPrompt = `Overall Goal Context: "${context}"
Key Topics list: "${keyTopics}"
User Refinement Directive: "${customPrompt}"

Generate a title and the full markdown-like plain text content for the Google Document.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Document title." },
      content: { type: Type.STRING, description: "Full document body text." }
    },
    required: ["title", "content"]
  };

  return await callGeminiResilient(systemPrompt, userPrompt, responseSchema);
}

// 4. Slides Agent
export async function runSlidesAgent(
  context: string,
  keyTopics: string,
  customPrompt: string
): Promise<SlidesPrefill> {
  const systemPrompt = `You are PrepPilot's specialized Presentation Design Agent.
Your job is to design a slide deck structure (Presentation Title, and a list of slides, each with a title and bullet points) based on the user's instructions.
Generate exactly 3 to 5 slides detailing different aspects of the execution strategy.
Return ONLY raw JSON matching the specified response schema.`;

  const userPrompt = `Overall Goal Context: "${context}"
Key Topics list: "${keyTopics}"
User Refinement Directive: "${customPrompt}"

Create a slideshow presentation title and slides structure.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Presentation title." },
      slides: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Slide header title." },
            bullets: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 to 4 concise bullet points for this slide." }
          },
          required: ["title", "bullets"]
        }
      }
    },
    required: ["title", "slides"]
  };

  return await callGeminiResilient(systemPrompt, userPrompt, responseSchema);
}

// 5. Meet Agent
export async function runMeetAgent(
  context: string,
  customPrompt: string
): Promise<MeetPrefill> {
  const systemPrompt = `You are PrepPilot's specialized Meet Scheduling Agent.
Your job is to set up a Google Meet conference event (Title, Start Time, Duration in minutes, and Attendee emails) based on the user's specific requests.
Return ONLY raw JSON matching the specified response schema.`;

  const userPrompt = `Overall Goal Context: "${context}"
User Refinement Directive: "${customPrompt}"

Determine title, start time (ISO 8601), duration (in minutes), and attendee emails array (if specified, otherwise empty).`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Meeting title." },
      startTime: { type: Type.STRING, description: "Valid ISO 8601 start time." },
      duration: { type: Type.INTEGER, description: "Meeting duration in minutes (e.g. 30, 45, 60)." },
      attendees: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of invitee emails, or empty array." }
    },
    required: ["title", "startTime", "duration", "attendees"]
  };

  return await callGeminiResilient(systemPrompt, userPrompt, responseSchema);
}
