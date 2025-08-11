"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, BookOpen, MessageCircle, Calendar, Upload, Users, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">StudySphere</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Your Study Materials with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">AI Power</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload documents, get instant summaries, create quizzes, and chat with your content. StudySphere makes
            learning more efficient and engaging.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Learning Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Study Smarter</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful AI tools designed to enhance your learning experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Smart Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload PDFs, documents, and images. Our AI processes any format instantly.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Auto Summaries</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Get concise summaries of your documents with key points highlighted.</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>AI Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Ask questions about your documents and get instant, accurate answers.</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Study Planner</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Organize your study schedule with smart recommendations and tracking.</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-4xl font-bold text-gray-900">10K+</span>
              </div>
              <p className="text-gray-600">Active Students</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-green-600 mr-2" />
                <span className="text-4xl font-bold text-gray-900">1M+</span>
              </div>
              <p className="text-gray-600">Documents Processed</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600 mr-2" />
                <span className="text-4xl font-bold text-gray-900">95%</span>
              </div>
              <p className="text-gray-600">Improved Study Efficiency</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Study Experience?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of students who are already studying smarter with StudySphere.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-8 py-3">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <Brain className="h-8 w-8 text-blue-400 mr-2" />
            <span className="text-2xl font-bold">StudySphere</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 StudySphere. All rights reserved.</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Your data is secure and private</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
