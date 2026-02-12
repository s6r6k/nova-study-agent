import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  const { assignment, deadline } = await req.json();

  const prompt = `
You are an intelligent study planning AI.

Create a realistic weekly execution plan for the following assignment.

Assignment:
${assignment}

Deadline:
${deadline}

Break it into weeks.
Include cognitive load balance.
Keep it structured.
  `;

  try {
    const command = new ConverseCommand({
      modelId: "amazon.nova-lite-v1:0",
      messages: [
        {
          role: "user",
          content: [{ text: prompt }],
        },
      ],
      inferenceConfig: {
        temperature: 0.4,
        maxTokens: 800,
      },
    });

    const response = await client.send(command);

    const text = response.output?.message?.content?.[0]?.text;

    return Response.json({ result: text });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
