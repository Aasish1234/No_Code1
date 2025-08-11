"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Upload,
  MessageCircle,
  Calendar,
  TrendingUp,
  Clock,
  HelpCircle,
  BookOpen,
  MoreHorizontal,
} from "lucide-react"
import Link from "next/link"

interface Document {
  id: string
  title: string
  fileType: string
  uploadDate: Date
  processingStatus: "uploading" | "processing" | "ready" | "error"
  wordCount: number
  summary?: string
}

interface RecentActivity {
  id: string
  type: "upload" | "quiz" | "chat" | "summary"
  title: string
  timestamp: string
  score?: number
  documentTitle?: string
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    // Mock data
    setDocuments([
      {
        id: "1",
        title: "Biology Chapter 5: Photosynthesis",
        fileType: "pdf",
        uploadDate: new Date(Date.now() - 86400000),
        processingStatus: "ready",
        wordCount: 2500,
        summary: "Comprehensive overview of photosynthesis process...",
      },
      {
        id: "2",
        title: "Chemistry Notes - Organic Compounds",
        fileType: "docx",
        uploadDate: new Date(Date.now() - 172800000),
        processingStatus: "ready",
        wordCount: 1800,
      },
      {
        id: "3",
        title: "Physics Lecture 12",
        fileType: "pdf",
        uploadDate: new Date(Date.now() - 3600000),
        processingStatus: "processing",
        wordCount: 0,
      },
    ])

    setRecentActivity([
      {
        id: "1",
        type: "quiz",
        title: "Completed Photosynthesis Quiz",
        timestamp: "2 hours ago",
        score: 85,
        documentTitle: "Biology Chapter 5",
      },
      {
        id: "2",
        type: "upload",
        title: "Uploaded Physics Lecture 12",
        timestamp: "1 hour ago",
      },
      {
        id: "3",
        type: "chat",
        title: "Asked about cellular respiration",
        timestamp: "3 hours ago",
        documentTitle: "Biology Chapter 5",
      },
      {
        id: "4",
        type: "summary",
        title: "Generated summary for Chemistry Notes",
        timestamp: "1 day ago",
        documentTitle: "Chemistry Notes",
      },
    ])
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "uploading":
        return "bg-blue-100 text-blue-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "upload":
        return <Upload className="h-4 w-4" />
      case "quiz":
        return <HelpCircle className="h-4 w-4" />
      case "chat":
        return <MessageCircle className="h-4 w-4" />
      case "summary":
        return <BookOpen className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "upload":
        return "bg-blue-100 text-blue-800"
      case "quiz":
        return "bg-green-100 text-green-800"
      case "chat":
        return "bg-purple-100 text-purple-800"
      case "summary":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">Ready to continue your learning journey?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.studyStreak} days</div>
              <p className="text-xs text-muted-foreground">Keep it up! 🔥</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Average score: 87%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.5h</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into your study session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/upload">
                <Button className="w-full h-20 flex flex-col gap-2 bg-transparent" variant="outline">
                  <Upload className="h-6 w-6" />
                  <span>Upload Document</span>
                </Button>
              </Link>
              <Link href="/chat">
                <Button className="w-full h-20 flex flex-col gap-2 bg-transparent" variant="outline">
                  <MessageCircle className="h-6 w-6" />
                  <span>Start Chat</span>
                </Button>
              </Link>
              <Link href="/study-plan">
                <Button className="w-full h-20 flex flex-col gap-2 bg-transparent" variant="outline">
                  <Calendar className="h-6 w-6" />
                  <span>Study Plan</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Your Documents</CardTitle>
              <CardDescription>Recently uploaded study materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{doc.title}</h3>
                      <p className="text-sm text-gray-500">
                        {doc.fileType.toUpperCase()} • {doc.wordCount > 0 ? `${doc.wordCount} words` : "Processing..."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(doc.processingStatus)}>{doc.processingStatus}</Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/upload">
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Document
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest study sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        {activity.documentTitle && `${activity.documentTitle} • `}
                        {activity.timestamp}
                      </p>
                    </div>
                    {activity.score && <Badge variant="secondary">{activity.score}%</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Study Progress */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Study Progress</CardTitle>
            <CardDescription>Your learning journey this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Weekly Goal</span>
                  <span>8/10 documents</span>
                </div>
                <Progress value={80} className="mb-2" />
                <p className="text-xs text-gray-500">2 more to reach your goal</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Quiz Accuracy</span>
                  <span>87%</span>
                </div>
                <Progress value={87} className="mb-2" />
                <p className="text-xs text-gray-500">Excellent performance!</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Study Time</span>
                  <span>12.5/15 hours</span>
                </div>
                <Progress value={83} className="mb-2" />
                <p className="text-xs text-gray-500">2.5 hours remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
