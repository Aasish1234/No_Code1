"use client"

import { useState, useEffect, useCallback } from "react"

interface ProcessingUpdate {
  type: string
  fileId?: string
  status?: string
  progress?: number
  data?: any
  timestamp?: number
}

export function useRealTimeProcessing() {
  const [isConnected, setIsConnected] = useState(false)
  const [updates, setUpdates] = useState<ProcessingUpdate[]>([])

  useEffect(() => {
    const eventSource = new EventSource("/api/events")

    eventSource.onopen = () => {
      setIsConnected(true)
    }

    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data) as ProcessingUpdate
        setUpdates((prev) => [...prev, update])
      } catch (error) {
        console.error("Error parsing SSE data:", error)
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
    }

    return () => {
      eventSource.close()
      setIsConnected(false)
    }
  }, [])

  const uploadAndProcessFile = useCallback(async (file: File) => {
    try {
      // Upload file
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Upload failed")
      }

      const uploadData = await uploadResponse.json()

      // Process file
      const processResponse = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadData),
      })

      if (!processResponse.ok) {
        throw new Error("Processing failed")
      }

      const processedData = await processResponse.json()
      return processedData
    } catch (error) {
      console.error("File processing error:", error)
      throw error
    }
  }, [])

  return {
    isConnected,
    updates,
    uploadAndProcessFile,
  }
}
