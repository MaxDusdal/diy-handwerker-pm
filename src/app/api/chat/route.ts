import { NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = process.env.GOOGLE_AI_API_KEY ?? "";

const SYSTEM_INSTRUCTIONS = `
You are a handwerker (DIY/home improvement) expert assistant. 
Your primary role is to help users with questions related to DIY home improvements, repairs, construction, and other physical building or fixing tasks.

ONLY respond to questions that are related to handwerker topics such as:
- Home repairs and maintenance
- Building, construction, and renovation
- Tools and their usage
- Materials and their properties
- Furniture assembly or repair
- Plumbing, electrical work, carpentry
- Gardening and outdoor projects
- Any physical improvements or fixes to homes, buildings, or objects

For ANY questions NOT related to handwerker topics (like cooking, finance, technology support unrelated to tools, etc.):
- Politely explain that you are a specialized handwerker assistant
- Suggest they consult a general-purpose assistant for non-handwerker topics
- Do NOT provide substantive answers to off-topic questions

Always prioritize SAFETY in your advice. Warn users about potentially dangerous tasks that should be done by professionals (electrical work, structural changes, etc.).
Always respond in German.
`;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const { messages } = body as ChatRequest;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 },
      );
    }

    if (!apiKey) {
      console.error("Missing API key");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1024,
      },
    });

    await chat.sendMessage([{ text: `SYSTEM: ${SYSTEM_INSTRUCTIONS}` }]);

    const latestMessage = messages[messages.length - 1];

    if (!latestMessage) {
      return NextResponse.json(
        { error: "No message content provided" },
        { status: 400 },
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream([
            { text: latestMessage.content },
          ]);

          let fullText = "";

          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullText += text;

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    chunk: text,
                    fullText: fullText,
                  })}\n\n`,
                ),
              );
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "AI processing failed", details: errorMessage })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    const errorDetails = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to process the request", details: errorDetails },
      { status: 500 },
    );
  }
}
