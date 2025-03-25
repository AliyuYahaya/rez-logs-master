"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Wrench, Trash, AlertTriangle, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface MaintenanceRequest {
  id: string
  category: string
  roomNumber: string
  description: string
  date: string
  timeSlot: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in_progress" | "completed"
  createdAt: Date
}

export default function MaintenanceRequestPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const newRequest: MaintenanceRequest = {
      id: Date.now().toString(),
      category: formData.get("category") as string,
      roomNumber: formData.get("roomNumber") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      timeSlot: formData.get("timeSlot") as string,
      priority: formData.get("priority") as "low" | "medium" | "high",
      status: "pending",
      createdAt: new Date()
    }

    setRequests([...requests, newRequest])
    const form = document.getElementById("maintenanceForm") as HTMLFormElement
    if (form) form.reset()
    setLoading(false)
    toast.success("Maintenance request submitted successfully")
  }

  const handleDeleteRequest = (id: string) => {
    setRequests(requests.filter(request => request.id !== id))
    toast.success("Maintenance request deleted successfully")
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const fetchRequests = () => {
    // Implementation of fetchRequests function
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Maintenance Requests</h1>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={fetchRequests}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Submit Request</CardTitle>
                <CardDescription>Fill in the details of your maintenance request.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <form id="maintenanceForm" onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-black">Maintenance Category</Label>
                <Select name="category" required>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="bedroom">Bedroom</SelectItem>
                    <SelectItem value="bathroom">Bathroom</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomNumber" className="text-black">Room Number</Label>
                <Input
                  id="roomNumber"
                  name="roomNumber"
                  placeholder="Enter your room number"
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-black">Describe the Issue</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide details about the maintenance request"
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-black">Preferred Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeSlot" className="text-black">Preferred Time Slot</Label>
                <Select name="timeSlot" required>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00-10:30">09:00 - 10:30</SelectItem>
                    <SelectItem value="10:30-12:00">10:30 - 12:00</SelectItem>
                    <SelectItem value="12:00-13:30">12:00 - 13:30</SelectItem>
                    <SelectItem value="13:30-15:00">13:30 - 15:00</SelectItem>
                    <SelectItem value="15:00-16:30">15:00 - 16:30</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-black">Priority Level</Label>
                <RadioGroup name="priority" required className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low" className="text-black">Low</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="text-black">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high" className="text-black">High</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="rounded-md bg-yellow-50 p-3">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <h4 className="text-sm font-medium">Service Availability Notice</h4>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  Service delivery is dependent on staff availability. Weekend requests are subject to change.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Your Requests</CardTitle>
            <CardDescription>View and manage your maintenance requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-6">
                <Wrench className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No maintenance requests submitted</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="flex items-start justify-between border-b pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-black">{request.category}</p>
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">Room: {request.roomNumber}</p>
                      <p className="text-sm text-muted-foreground">Date: {request.date}</p>
                      <p className="text-sm text-muted-foreground">Time: {request.timeSlot}</p>
                      <p className="text-sm text-muted-foreground">{request.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRequest(request.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 