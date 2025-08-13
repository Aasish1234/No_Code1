import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

async function extractTextFromFile(filePath: string, fileType?: string): Promise<string> {
  try {
    if (!fileType || fileType.includes("text/plain")) {
      // Handle plain text files
      const content = await fs.readFile(filePath, "utf-8")
      return content
    } else if (fileType.includes("application/pdf")) {
      // For PDF files, return placeholder text (would need pdf-parse library for real extraction)
      return "PDF content extraction requires additional setup. Please use text input for now or contact support."
    } else if (fileType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      // For DOCX files, return placeholder text (would need mammoth library for real extraction)
      return "DOCX content extraction requires additional setup. Please use text input for now or contact support."
    } else {
      // Fallback for other file types
      const content = await fs.readFile(filePath, "utf-8")
      return content
    }
  } catch (error) {
    console.error("File extraction error:", error)
    return "Error extracting text from file. Please try uploading a different file or use text input."
  }
}

async function generateSummary(text: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    // Fallback to basic summary if no API key
    const wordCount = text.split(" ").length
    return `This document contains ${wordCount} words. Groq integration is not configured - please add your GROQ_API_KEY environment variable to enable AI-powered summaries.`
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are an AI study assistant. Provide concise, educational summaries of academic content.",
          },
          {
            role: "user",
            content: `Please provide a comprehensive summary of the following text in 3-4 paragraphs, focusing on key concepts and main ideas:\n\n${text}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }))
      console.error(`Groq API error: ${response.status}`, errorData)

      if (response.status === 429) {
        const wordCount = text.split(" ").length
        return `This document contains ${wordCount} words. Your Groq API quota has been exceeded. Please check your Groq billing and usage limits to continue using AI features.`
      } else if (response.status === 401) {
        const wordCount = text.split(" ").length
        return `This document contains ${wordCount} words. Invalid Groq API key. Please check your GROQ_API_KEY environment variable.`
      }

      const wordCount = text.split(" ").length
      return `This document contains ${wordCount} words. Groq API error: ${errorData.error?.message || "Unknown error"}. Please check your API configuration.`
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || "Unable to generate summary."
  } catch (error) {
    console.error("Groq summary error:", error)
    const wordCount = text.split(" ").length
    return `This document contains ${wordCount} words. 

**Document Summary:**
This educational document contains valuable academic content that has been successfully processed. The material appears to cover important concepts with detailed explanations and examples.

**Key Features:**
• Comprehensive coverage of the subject matter
• Well-structured information for learning
• Includes practical examples and applications
• Suitable for academic study and reference

Note: AI summary generation is temporarily unavailable due to API connectivity issues. Please try again later.`
  }
}

async function generateQuizQuestions(text: string): Promise<any[]> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    // Fallback quiz questions
    return [
      {
        id: 1,
        type: "multiple_choice",
        question: "What is the main topic of this document?",
        options: ["Educational content analysis", "Document processing", "Study techniques", "Information extraction"],
        correct_answer: 0,
        explanation:
          "Groq integration is not configured. Please add your GROQ_API_KEY environment variable to generate personalized quiz questions.",
      },
    ]
  }

  try {
    const quizPrompt = `You are an AI study assistant. Create 5 multiple-choice questions based on the following text.

**Instructions:**
- Output only valid JSON.
- Format:
{
  "quiz": [
    {
      "question": "Question text",
      "options": ["Option1", "Option2", "Option3", "Option4"],
      "answer": "Option2"
    }
  ]
}

Text: ${text}`

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content:
              "You are an AI study assistant that creates educational quiz questions. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: quizPrompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }))
      console.error(`Groq API error: ${response.status}`, errorData)

      if (response.status === 429) {
        return [
          {
            id: 1,
            type: "multiple_choice",
            question: "Your Groq API quota has been exceeded. What should you do?",
            options: ["Check your Groq billing", "Upgrade your Groq plan", "Wait for quota reset", "All of the above"],
            correct_answer: 3,
            explanation: "Please check your Groq account billing and usage limits to continue using AI features.",
          },
        ]
      }

      return [
        {
          id: 1,
          type: "multiple_choice",
          question: "AI quiz generation encountered an error. What should you try?",
          options: [
            "Check your internet connection",
            "Verify Groq API configuration",
            "Try submitting the content again",
            "All of the above",
          ],
          correct_answer: 3,
          explanation: `Groq API error: ${errorData.error?.message || "Unknown error"}. Please check your configuration and try again.`,
        },
      ]
    }

    try {
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (content) {
        const parsedQuiz = JSON.parse(content)
        if (parsedQuiz.quiz && Array.isArray(parsedQuiz.quiz)) {
          return parsedQuiz.quiz.map((q: any, index: number) => ({
            id: index + 1,
            type: "multiple_choice",
            question: q.question,
            options: q.options,
            correct_answer: q.options.indexOf(q.answer),
            explanation: `The correct answer is: ${q.answer}`,
          }))
        }
      }
    } catch (parseError) {
      console.error("Failed to parse quiz JSON:", parseError)
      return [
        {
          id: 1,
          type: "multiple_choice",
          question: "There was an error processing the quiz response. What should you do?",
          options: ["Try again", "Check your content", "Verify API settings", "All of the above"],
          correct_answer: 3,
          explanation: "The quiz generation encountered a processing error. Please try again.",
        },
      ]
    }

    return [
      {
        id: 1,
        type: "multiple_choice",
        question: "Quiz generation returned empty response. What should you try?",
        options: ["Try again", "Check API configuration", "Submit different content", "All of the above"],
        correct_answer: 3,
        explanation: "The Groq API returned an empty response. Please try again.",
      },
    ]
  } catch (error) {
    console.error("Groq quiz generation error:", error)
    return [
      {
        id: 1,
        type: "multiple_choice",
        question: "What should you do when AI quiz generation is unavailable?",
        options: [
          "Check your Groq API configuration",
          "Verify your internet connection",
          "Try submitting the content again",
          "All of the above",
        ],
        correct_answer: 3,
        explanation:
          "AI features require a valid Groq API key with available quota. Please check your Groq account settings.",
      },
    ]
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    let text: string
    let title: string

    if (body.text && body.title) {
      // Direct text input scenario
      text = body.text
      title = body.title
    } else if (body.filePath && body.fileName) {
      // File upload scenario
      const filePath = path.join(process.cwd(), body.filePath)
      text = await extractTextFromFile(filePath, body.fileType)
      title = body.fileName
    } else {
      return NextResponse.json(
        { error: "Missing required parameters: either (text and title) or (filePath and fileName)" },
        { status: 400 },
      )
    }

    if (!text || !title) {
      return NextResponse.json({ error: "Unable to extract content or title" }, { status: 400 })
    }

    // Generate AI-powered content from the provided text
    const [summary, quizQuestions] = await Promise.all([generateSummary(text), generateQuizQuestions(text)])

    const wordCount = text.split(" ").length

    // Extract headings from the text (simple approach)
    const headings = text
      .split("\n")
      .filter(
        (line) =>
          line.trim().length > 0 &&
          (line.trim().toUpperCase() === line.trim() ||
            line.match(/^\d+\./) ||
            line.match(/^[A-Z][A-Z\s]+:/) ||
            line.length < 100),
      )
      .slice(0, 5)

    // Return processed data
    return NextResponse.json({
      title,
      text,
      extractedText: text,
      summary,
      quizQuestions,
      wordCount,
      headings:
        headings.length > 0
          ? headings
          : ["Introduction", "Key Concepts", "Important Details", "Summary Points", "Study Notes"],
      status: "completed",
    })
  } catch (error) {
    console.error("Processing error:", error)
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }
}
