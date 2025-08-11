"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Target, TrendingUp, Clock, BookOpen, CheckCircle, Circle, Star, Plus, Edit } from "lucide-react"

interface StudyGoal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  deadline: string
  priority: "high" | "medium" | "low"
  category: string
}

interface StudySession {
  id: string
  date: string
  duration: number
  topic: string
  completed: boolean
  score?: number
  documentId?: string
}

interface StudyTask {
  id: string
  title: string
  dueDate: string
  completed: boolean
  priority: "high" | "medium" | "low"
  estimatedTime: number
}

export default function StudyPlanPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [goals, setGoals] = useState<StudyGoal[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<StudySession[]>([])
  const [completedSessions, setCompletedSessions] = useState<StudySession[]>([])
  const [tasks, setTasks] = useState<StudyTask[]>([])
  const [newGoalTitle, setNewGoalTitle] = useState("")
  const [showAddGoal, setShowAddGoal] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    // Mock data
    setGoals([
      {
        id: "1",
        title: "Complete Biology Chapter",
        target: 10,
        current: 7,
        unit: "sections",
        deadline: "2024-01-15",
        priority: "high",
        category: "Biology",
      },
      {
        id: "2",
        title: "Practice Math Problems",
        target: 50,
        current: 32,
        unit: "problems",
        deadline: "2024-01-20",
        priority: "medium",
        category: "Mathematics",
      },
      {
        id: "3",
        title: "Review History Notes",
        target: 5,
        current: 3,
        unit: "chapters",
        deadline: "2024-01-25",
        priority: "low",
        category: "History",
      },
    ])

    setUpcomingSessions([
      {
        id: "1",
        date: "Today",
        duration: 60,
        topic: "Photosynthesis Review",
        completed: false,
      },
      {
        id: "2",
        date: "Tomorrow",
        duration: 45,
        topic: "Algebra Practice",
        completed: false,
      },
      {
        id: "3",
        date: "Jan 12",
        duration: 30,
        topic: "World War II Quiz",
        completed: false,
      },
    ])

    setCompletedSessions([
      {
        id: "4",
        date: "Yesterday",
        duration: 45,
        topic: "Cell Biology Quiz",
        completed: true,
        score: 85,
      },
      {
        id: "5",
        date: "Jan 8",
        duration: 60,
        topic: "Chemistry Notes Review",
        completed: true,
        score: 92,
      },
    ])

    setTasks([
      {
        id: "1",
        title: "Upload Chemistry Lab Report",
        dueDate: "Today",
        completed: false,
        priority: "high",
        estimatedTime: 30,
      },
      {
        id: "2",
        title: "Review Biology Flashcards",
        dueDate: "Tomorrow",
        completed: false,
        priority: "medium",
        estimatedTime: 20,
      },
      {
        id: "3",
        title: "Complete Math Assignment",
        dueDate: "Jan 13",
        completed: false,
        priority: "high",
        estimatedTime: 90,
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

  if (!user) return null

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const toggleTask = (taskId: string) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  const addGoal = () => {
    if (!newGoalTitle.trim()) return

    const newGoal: StudyGoal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      target: 10,
      current: 0,
      unit: "items",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      priority: "medium",
      category: "General",
    }

    setGoals((prev) => [...prev, newGoal])
    setNewGoalTitle("")
    setShowAddGoal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Plan</h1>
            <p className="text-gray-600">Track your progress and stay on top of your learning goals</p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Active Goals</p>
                    <p className="text-2xl font-bold">{goals.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Study Streak</p>
                    <p className="text-2xl font-bold">{user.studyStreak} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">This Week</p>
                    <p className="text-2xl font-bold">12.5h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Score</p>
                    <p className="text-2xl font-bold">87%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Study Goals */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Study Goals
                    </CardTitle>
                    <CardDescription>Track your learning objectives</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowAddGoal(!showAddGoal)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showAddGoal && (
                  <div className="p-4 border rounded-lg bg-blue-50 space-y-3">
                    <Label htmlFor="new-goal">New Goal Title</Label>
                    <Input
                      id="new-goal"
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      placeholder="Enter goal title..."
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addGoal}>
                        Add Goal
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddGoal(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {goals.map((goal) => (
                  <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{goal.title}</h3>
                        <p className="text-sm text-gray-500">
                          {goal.category} • Due: {goal.deadline}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          {goal.current} / {goal.target} {goal.unit}
                        </span>
                        <span>{Math.round(getProgressPercentage(goal.current, goal.target))}%</span>
                      </div>
                      <Progress value={getProgressPercentage(goal.current, goal.target)} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Today's Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Today's Tasks
                </CardTitle>
                <CardDescription>Your scheduled tasks and activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg ${
                      task.completed ? "bg-green-50 border-green-200" : "bg-white"
                    }`}
                  >
                    <button onClick={() => toggleTask(task.id)}>
                      {task.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.completed ? "line-through text-gray-500" : ""}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {task.dueDate} • {task.estimatedTime} min
                      </p>
                    </div>
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  </div>
                ))}

                <Button variant="outline" className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Study Sessions
              </CardTitle>
              <CardDescription>Your scheduled study sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{session.topic}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {session.date} • {session.duration} min
                    </p>
                    <Button size="sm" className="w-full">
                      Start Session
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Study Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Study Calendar
              </CardTitle>
              <CardDescription>Visual overview of your study schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center">
                {/* Calendar Header */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 font-medium text-gray-600">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 6 // Start from previous month
                  const isToday = day === 10
                  const hasSession = [8, 10, 12, 15, 18].includes(day)

                  return (
                    <div
                      key={i}
                      className={`p-2 h-10 flex items-center justify-center rounded cursor-pointer ${
                        day < 1 || day > 31
                          ? "text-gray-300"
                          : isToday
                            ? "bg-blue-600 text-white"
                            : hasSession
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "hover:bg-gray-100"
                      }`}
                    >
                      {day > 0 && day <= 31 ? day : ""}
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                  <span>Study Session</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recent Study Sessions
              </CardTitle>
              <CardDescription>Your completed study activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedSessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <h3 className="font-medium">{session.topic}</h3>
                      <p className="text-sm text-gray-500">
                        {session.date} • {session.duration} min
                      </p>
                    </div>
                    {session.score && <Badge variant="secondary">{session.score}%</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
