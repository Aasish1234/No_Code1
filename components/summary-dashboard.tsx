"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileText,
  BookOpen,
  Clock,
  BarChart3,
  MessageSquare,
  HelpCircle,
  ChevronRight,
  Hash,
  FileIcon,
} from "lucide-react"

interface ProcessedFile {
  id: string
  name: string
  summary?: string
  wordCount?: number
  extractedText?: string
  quizQuestions?: any[]
  headings?: string[]
}

interface SummaryDashboardProps {
  files: ProcessedFile[]
  onNavigateToChat: () => void
  onNavigateToQuiz: () => void
}

export function SummaryDashboard({ files, onNavigateToChat, onNavigateToQuiz }: SummaryDashboardProps) {
  const totalWords = files.reduce((sum, file) => sum + (file.wordCount || 0), 0)
  const totalQuestions = files.reduce((sum, file) => sum + (file.quizQuestions?.length || 0), 0)
  const totalHeadings = files.reduce((sum, file) => sum + (file.headings?.length || 0), 0)

  const getReadingTime = (wordCount: number) => {
    // Average reading speed is 200-250 words per minute
    const minutes = Math.ceil(wordCount / 225)
    return minutes === 1 ? "1 min" : `${minutes} mins`
  }

  const getDocumentType = (fileName: string) => {
    if (!fileName) {
      return { type: "FILE", color: "bg-gray-100 text-gray-700" }
    }

    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return { type: "PDF", color: "bg-red-100 text-red-700" }
      case "docx":
      case "doc":
        return { type: "DOC", color: "bg-blue-100 text-blue-700" }
      case "txt":
        return { type: "TXT", color: "bg-gray-100 text-gray-700" }
      default:
        return { type: "FILE", color: "bg-gray-100 text-gray-700" }
    }
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Summaries Available</h3>
          <p className="text-gray-600 mb-4">Upload and process documents first to see AI-generated summaries here.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-gray-900">{files.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Words</p>
                <p className="text-2xl font-bold text-gray-900">{totalWords.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Quiz Questions</p>
                <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Reading Time</p>
                <p className="text-2xl font-bold text-gray-900">{getReadingTime(totalWords)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={onNavigateToChat} variant="outline" className="h-auto p-4 justify-start bg-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-pink-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Ask Questions</p>
                  <p className="text-sm text-gray-600">Chat with AI about your documents</p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </div>
            </Button>

            <Button onClick={onNavigateToQuiz} variant="outline" className="h-auto p-4 justify-start bg-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Take Quiz</p>
                  <p className="text-sm text-gray-600">Test your knowledge with {totalQuestions} questions</p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Summaries */}
      <div className="space-y-4">
        {files.map((file) => {
          const docType = getDocumentType(file.name)

          return (
            <Card key={file.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-5 w-5 text-gray-600" />
                    <div>
                      <CardTitle className="text-lg">{file.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={docType.color}>
                          {docType.type}
                        </Badge>
                        {file.wordCount && (
                          <span className="text-sm text-gray-600">
                            {file.wordCount.toLocaleString()} words • {getReadingTime(file.wordCount)} read
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* AI Summary */}
                {file.summary && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      AI Summary
                    </h4>
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">{file.summary}</p>
                    </div>
                  </div>
                )}

                {/* Document Structure */}
                {file.headings && file.headings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Document Structure
                    </h4>
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {file.headings.map((heading, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-cyan-600 rounded-full flex-shrink-0" />
                            <span className="text-gray-700">{heading}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Document Stats */}
                <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Words</p>
                    <p className="font-semibold text-gray-900">{file.wordCount?.toLocaleString() || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Sections</p>
                    <p className="font-semibold text-gray-900">{file.headings?.length || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Quiz Questions</p>
                    <p className="font-semibold text-gray-900">{file.quizQuestions?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
