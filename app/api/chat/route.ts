import { type NextRequest, NextResponse } from "next/server"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  fileId?: string
}

interface FileContext {
  name: string
  summary?: string
  content?: string
}

const estimateTokens = (text: string): number => {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4)
}

const truncateContent = (content: string, maxTokens: number): string => {
  const maxChars = maxTokens * 4
  if (content.length <= maxChars) return content

  return content.substring(0, maxChars - 3) + "..."
}

const generateAIResponse = async (
  message: string,
  files: FileContext[] = [],
  documentContext?: string,
): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return "⚠️ Groq API key not configured. Please add your GROQ_API_KEY environment variable in Project Settings to enable AI responses."
  }

  try {
    const maxContextTokens = 3000 // Leave room for system prompt and user message
    let contextText = ""
    let usedTokens = 0

    for (const file of files) {
      // Prioritize summary over full content
      const summary = file.summary || "No summary available"
      const summaryTokens = estimateTokens(summary)

      let fileContext = `Document: ${file.name}\nSummary: ${summary}`
      let fileTokens = estimateTokens(fileContext)

      // Add content if we have room
      if (file.content && usedTokens + fileTokens < maxContextTokens) {
        const remainingTokens = maxContextTokens - usedTokens - fileTokens
        const truncatedContent = truncateContent(file.content, remainingTokens - 50) // Buffer for formatting

        if (truncatedContent.length > 0) {
          fileContext += `\nContent: ${truncatedContent}`
          fileTokens = estimateTokens(fileContext)
        }
      }

      // Check if adding this file would exceed limits
      if (usedTokens + fileTokens > maxContextTokens) {
        break
      }

      contextText += (contextText ? "\n\n---\n\n" : "") + fileContext
      usedTokens += fileTokens
    }

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
            content: `You are StudySphere, an AI study assistant. Help users understand their study materials by answering questions based on the provided document context. Be helpful, educational, and encouraging.

Document Context:
${contextText}`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }))
      console.error(`Groq API error: ${response.status}`, errorData)

      if (response.status === 413 || response.status === 429) {
        return "⚠️ The document is too large for processing. I've received your question but need a smaller context to provide a good answer. Try asking about specific sections or topics from your document."
      }

      return `I encountered an error while processing your request: ${errorData.error?.message || "Unknown error"}. Please try again with a shorter question or document.`
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again."
  } catch (error) {
    console.error("Groq API error:", error)
    return "I encountered an error while processing your request. Please check your Groq API configuration and try again."
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, files = [], documentContext } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const aiResponse = await generateAIResponse(message, files, documentContext)

    // Create response message
    const responseMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: "assistant",
      content: aiResponse,
      timestamp: Date.now(),
    }

    return NextResponse.json({ message: responseMessage })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Chat processing failed" }, { status: 500 })
  }
}
