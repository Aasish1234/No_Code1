"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2 } from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  fileId?: string
}

interface ProcessedFile {
  id: string
  name: string
  extractedText?: string
  summary?: string
}

interface ChatInterfaceProps {
  files: ProcessedFile[]
}

export function ChatInterface({ files }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        files.length > 0
          ? `Hello! I'm your AI study assistant from StudySphere. I've analyzed your uploaded documents and I'm ready to help you understand the content, answer questions, or create study materials. What would you like to explore?`
          : `Hello! I'm your AI study assistant from StudySphere. Upload some documents first, and I'll be able to help you understand the content, answer questions, and create personalized study materials.`,
      timestamp: Date.now(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user",
      content: inputMessage.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    try {
      const documentContext = files.map((f) => ({
        name: f.name,
        summary: f.summary,
        content: f.extractedText,
      }))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          files: documentContext, // Send structured file data
          documentContext: files.map((f) => f.extractedText || f.summary).join("\n\n"),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()
      setMessages((prev) => [...prev, data.message])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: "assistant",
        content: "Sorry, I encountered an error processing your message. Please try again.",
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="h-[700px] flex flex-col max-w-4xl mx-auto">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-cyan-600" />
          StudySphere AI Assistant
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Powered by Groq</span>
        </CardTitle>
        {files.length > 0 && (
          <p className="text-sm text-muted-foreground">Chatting about: {files.map((f) => f.name).join(", ")}</p>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 p-4 min-h-0">
        <ScrollArea className="flex-1 w-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-cyan-100">
                      <Bot className="h-4 w-4 text-cyan-600" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    message.role === "user" ? "bg-cyan-600 text-white ml-auto" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.role === "user" ? "text-cyan-100" : "text-gray-500"}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-gray-100">
                      <User className="h-4 w-4 text-gray-600" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                  <AvatarFallback className="bg-cyan-100">
                    <Bot className="h-4 w-4 text-cyan-600" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    <span className="text-sm text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 flex-shrink-0">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              files.length > 0
                ? "Ask me anything about your documents..."
                : "Upload documents first to start chatting..."
            }
            disabled={isTyping || files.length === 0}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping || files.length === 0}
            size="icon"
            className="bg-cyan-600 hover:bg-cyan-700 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {files.length === 0 && (
          <p className="text-xs text-center text-muted-foreground flex-shrink-0">
            Upload and process documents to enable AI chat functionality
          </p>
        )}
      </CardContent>
    </Card>
  )
}
