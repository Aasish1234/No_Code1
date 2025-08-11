import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Mock response for demonstration when API key is not available
const generateMockResponse = (text: string, options?: any) => {
  // Simple mock based on text length and content
  const words = text.split(" ").length
  const isScience =
    text.toLowerCase().includes("photosynthesis") ||
    text.toLowerCase().includes("biology") ||
    text.toLowerCase().includes("cell")

  if (isScience) {
    return {
      summary: [
        "Photosynthesis is the process by which plants make their own food using sunlight",
        "Plants use carbon dioxide from air and water from soil as raw materials",
        "Chlorophyll in leaves captures light energy to power the process",
        "Oxygen is released as a byproduct of photosynthesis",
        "This process is essential for life on Earth as it produces oxygen and food",
      ],
      quiz: [
        {
          question: "What do plants use to capture light energy for photosynthesis?",
          options: ["Chlorophyll", "Carbon dioxide", "Water", "Oxygen"],
          correctAnswer: "A",
        },
        {
          question: "What gas is released as a byproduct of photosynthesis?",
          options: ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"],
          correctAnswer: "C",
        },
        {
          question: "What are the main raw materials plants need for photosynthesis?",
          options: ["Oxygen and nitrogen", "Carbon dioxide and water", "Hydrogen and helium", "Methane and ammonia"],
          correctAnswer: "B",
        },
        {
          question: "Where does photosynthesis primarily occur in plants?",
          options: ["Roots", "Stems", "Leaves", "Flowers"],
          correctAnswer: "C",
        },
        {
          question: "What is the main source of energy for photosynthesis?",
          options: ["Wind", "Sunlight", "Heat from soil", "Chemical reactions"],
          correctAnswer: "B",
        },
      ],
      explanation:
        "Think of photosynthesis like a kitchen in a plant! Plants are like little chefs that make their own food. They use sunlight as their energy source, just like we use electricity for our kitchen appliances. The plants take in carbon dioxide from the air (like ingredients from the pantry) and water from their roots (like getting water from the tap). Then, using the green stuff in their leaves called chlorophyll (which is like their cooking tools), they mix everything together with sunlight to make sugar, which is their food! As a bonus, they make oxygen and release it into the air for us to breathe. It's like they're cooking dinner and giving us fresh air at the same time!",
    }
  }

  // Generic mock response for other topics
  return {
    summary: [
      "This document contains important study material that has been processed by StudySphere",
      "Key concepts and main ideas have been identified and extracted",
      "The content covers fundamental principles and practical applications",
      "Important definitions and terminology are highlighted throughout",
      "The material is structured to build understanding progressively",
    ],
    quiz: [
      {
        question: "What is the main purpose of this study material?",
        options: ["Entertainment", "Education and learning", "Marketing", "Data collection"],
        correctAnswer: "B",
      },
      {
        question: "How does StudySphere help students learn?",
        options: [
          "By replacing teachers",
          "By providing AI-powered study tools",
          "By giving answers directly",
          "By eliminating homework",
        ],
        correctAnswer: "B",
      },
      {
        question: "What type of content can be uploaded to StudySphere?",
        options: ["Only text files", "Documents, images, and videos", "Only PDFs", "Only handwritten notes"],
        correctAnswer: "B",
      },
      {
        question: "What happens after uploading content to StudySphere?",
        options: ["Nothing", "AI processes and creates study materials", "Content is deleted", "Only storage occurs"],
        correctAnswer: "B",
      },
      {
        question: "What is the benefit of using AI for studying?",
        options: [
          "It's slower than traditional methods",
          "It provides personalized and efficient learning",
          "It's more expensive",
          "It replaces human thinking",
        ],
        correctAnswer: "B",
      },
    ],
    explanation:
      "This study material is designed to help you learn more effectively! Think of StudySphere like having a smart study buddy who never gets tired. When you upload your documents, our AI reads through everything carefully and picks out the most important parts - just like when a friend highlights the key points in your textbook. Then it creates questions to test your knowledge, kind of like having a practice quiz before the real test. The AI also explains difficult concepts in simple words, making it easier to understand complex topics. It's like having a tutor who can break down complicated ideas into bite-sized pieces that make sense!",
  }
}

export async function POST(request: Request) {
  try {
    const { text, options, title } = await request.json()

    if (!text || text.trim().length === 0) {
      return Response.json({ error: "Text is required" }, { status: 400 })
    }

    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.log("OpenAI API key not found, using mock response for demonstration")
      const mockResponse = generateMockResponse(text, options)
      return Response.json(mockResponse)
    }

    const prompt = `You are an AI Study Assistant that helps students learn faster by:
- Summarizing study material clearly and concisely
- Creating engaging quiz questions
- Explaining complex ideas in simpler terms

Given the following input text, perform these tasks in order:

1. SUMMARIZATION
Produce a clear summary in bullet points.
Focus on main ideas, key facts, and important concepts.
Keep it concise but complete — 5–10 bullet points maximum.

2. QUIZ CREATION
Create 5 multiple-choice questions based on the text.
Each question must:
- Be clear and unambiguous
- Have 1 correct answer and 3 plausible distractors

3. SIMPLIFIED EXPLANATION
Rewrite the content in simpler language, as if explaining to a 10-year-old.
Use short sentences and everyday words.
Include examples or analogies if helpful.

CONSTRAINTS:
- Do not invent information not present in the text
- Keep answers factually correct
- Maintain a neutral, academic tone

INPUT TEXT:
${text}

Please respond with a JSON object in this exact format:
{
  "summary": ["bullet point 1", "bullet point 2", ...],
  "quiz": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "A"
    },
    ...
  ],
  "explanation": "Simple explanation text here..."
}`

    const { text: response } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.3,
    })

    // Parse the JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Invalid response format")
    }

    const parsedResponse = JSON.parse(jsonMatch[0])

    // Validate the response structure
    if (!parsedResponse.summary || !parsedResponse.quiz || !parsedResponse.explanation) {
      throw new Error("Incomplete response structure")
    }

    return Response.json(parsedResponse)
  } catch (error) {
    console.error("Error processing study material:", error)

    // If there's an error with the AI service, fall back to mock response
    try {
      const { text } = await request.json()
      const mockResponse = generateMockResponse(text)
      return Response.json(mockResponse)
    } catch {
      return Response.json({ error: "Failed to process study material" }, { status: 500 })
    }
  }
}
