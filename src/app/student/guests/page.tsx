"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { UserPlus, Clock, X, Check, Plus, Trash, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getCheckoutCode } from "@/lib/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

interface GuestData {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
  roomNumber: string
  purpose: string
  fromDate: string
  checkInTime: string
  date: string
}

interface AdditionalGuest {
  firstName: string
  lastName: string
  phoneNumber: string
}

export default function GuestRegistrationPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeGuests, setActiveGuests] = useState<GuestData[]>([])
  const [multipleGuests, setMultipleGuests] = useState<"yes" | "no">("no")
  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuest[]>([])
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [currentGuest, setCurrentGuest] = useState<GuestData | null>(null)
  const [checkoutCode, setCheckoutCode] = useState<string | null>(null)
  const [checkoutCodeInput, setCheckoutCodeInput] = useState<number | null>(null)

  useEffect(() => {
    fetchCheckoutCode()
  }, [])

  const handleMultipleGuestsChange = (value: "yes" | "no") => {
    setMultipleGuests(value)
    if (value === "no") {
      setAdditionalGuests([])
    }
  }

  const addAdditionalGuest = () => {
    if (additionalGuests.length < 2) {
      setAdditionalGuests([...additionalGuests, { firstName: "", lastName: "", phoneNumber: "" }])
    } else {
      toast.error("Maximum of 3 guests allowed.")
    }
  }

  const removeAdditionalGuest = (index: number) => {
    const newGuests = [...additionalGuests]
    newGuests.splice(index, 1)
    setAdditionalGuests(newGuests)
  }

  const updateAdditionalGuestFirstName = (index: number, firstName: string) => {
    const newGuests = [...additionalGuests]
    newGuests[index].firstName = firstName
    setAdditionalGuests(newGuests)
  }

  const updateAdditionalGuestLastName = (index: number, lastName: string) => {
    const newGuests = [...additionalGuests]
    newGuests[index].lastName = lastName
    setAdditionalGuests(newGuests)
  }

  const updateAdditionalGuestPhone = (index: number, phoneNumber: string) => {
    const newGuests = [...additionalGuests]
    newGuests[index].phoneNumber = phoneNumber
    setAdditionalGuests(newGuests)
  }

  const handleRegisterGuest = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Get form data
    const formData = new FormData(e.target as HTMLFormElement)
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const guestPhoneNumber = formData.get("guestPhoneNumber") as string
    const roomNumber = formData.get("roomNumber") as string
    const purpose = formData.get("purpose") as string
    const fromDate = formData.get("fromDate") as string

    // Create main guest
    const newGuest: GuestData = {
      id: Date.now().toString(),
      firstName,
      lastName,
      phoneNumber: guestPhoneNumber,
      roomNumber,
      purpose,
      fromDate,
      checkInTime: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }

    // Set current guest for confirmation popup
    setCurrentGuest(newGuest)
    setShowConfirmationDialog(true)
    setLoading(false)
  }

  const fetchCheckoutCode = async () => {
    const code = await getCheckoutCode()
    setCheckoutCode(code ? code.code : null)
  }

  const confirmGuest = (): void => {
    if (currentGuest) {
      // Add main guest
      setActiveGuests([...activeGuests, currentGuest])

      // Add additional guests if any
      if (multipleGuests === "yes" && additionalGuests.length > 0) {
        const additionalGuestsData: GuestData[] = additionalGuests.map((guest, index) => ({
          id: `${Date.now()}-${index + 1}`,
          firstName: guest.firstName,
          lastName: guest.lastName,
          phoneNumber: guest.phoneNumber,
          roomNumber: currentGuest.roomNumber,
          purpose: currentGuest.purpose,
          fromDate: currentGuest.fromDate,
          checkInTime: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        }))

        setActiveGuests(prev => [...prev, ...additionalGuestsData])
      }

      // Reset form and state
      const form = document.getElementById("guestForm") as HTMLFormElement
      if (form) form.reset()

      setMultipleGuests("no")
      setAdditionalGuests([])
      setCurrentGuest(null)
      setShowConfirmationDialog(false)

      toast.success("Guest registered successfully")
    }
  }

  const handleCheckoutGuest = (guestId: string) => {
    if (checkoutCode && checkoutCodeInput && checkoutCodeInput.toString() === checkoutCode) {
      setActiveGuests(activeGuests.filter((guest) => guest.id !== guestId))
      toast.success("Your guest has been checked out successfully.")
    } else {
      toast.error("Invalid checkout code.")
    }
  }

  const fetchGuests = async () => {
    // Implement the logic to fetch guests
    // This is a placeholder and should be replaced with the actual implementation
    console.log("Fetching guests...")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Guest Registration</h1>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={fetchGuests}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="register">
        <TabsList className="grid w-full grid-cols-2 bg-white">
          <TabsTrigger value="register" className="text-black">
            Register Guest
          </TabsTrigger>
          <TabsTrigger value="active" className="text-black">
            Active Guests ({activeGuests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="mt-4">
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Register a New Guest</CardTitle>
                  <CardDescription>Fill in the details to register a visitor for today.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <form id="guestForm" onSubmit={handleRegisterGuest}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-black">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Enter guest's first name"
                      required
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-black">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Enter guest's last name"
                      required
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestPhoneNumber" className="text-black">
                    Guest Phone Number
                  </Label>
                  <Input
                    id="guestPhoneNumber"
                    name="guestPhoneNumber"
                    placeholder="Enter guest's phone number"
                    required
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roomNumber" className="text-black">
                    Room Number
                  </Label>
                  <Input
                    id="roomNumber"
                    name="roomNumber"
                    placeholder="Enter room number"
                    required
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose" className="text-black">
                    Purpose of Visit
                  </Label>
                  <Input
                    id="purpose"
                    name="purpose"
                    placeholder="e.g., Study session, Social visit"
                    required
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromDate" className="text-black">
                    Date
                  </Label>
                  <Input id="fromDate" name="fromDate" type="date" required className="bg-white" />
                </div>

                <div className="space-y-2">
                  <Label className="text-black">Would you like to sign in more than one guest?</Label>
                  <RadioGroup
                    value={multipleGuests}
                    onValueChange={handleMultipleGuestsChange}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes" />
                      <Label htmlFor="yes" className="text-black">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no" />
                      <Label htmlFor="no" className="text-black">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                {multipleGuests === "yes" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-black">Additional Guests</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addAdditionalGuest}
                        disabled={additionalGuests.length >= 2}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Guest
                      </Button>
                    </div>

                    {additionalGuests.map((guest, index) => (
                      <div key={index} className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-black">Additional Guest {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAdditionalGuest(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`guestFirstName${index}`} className="text-black">
                              First Name
                            </Label>
                            <Input
                              id={`guestFirstName${index}`}
                              value={guest.firstName}
                              onChange={(e) => updateAdditionalGuestFirstName(index, e.target.value)}
                              placeholder="Enter guest's first name"
                              required
                              className="bg-white"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`guestLastName${index}`} className="text-black">
                              Last Name
                            </Label>
                            <Input
                              id={`guestLastName${index}`}
                              value={guest.lastName}
                              onChange={(e) => updateAdditionalGuestLastName(index, e.target.value)}
                              placeholder="Enter guest's last name"
                              required
                              className="bg-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`guestPhone${index}`} className="text-black">
                            Phone Number
                          </Label>
                          <Input
                            id={`guestPhone${index}`}
                            value={guest.phoneNumber}
                            onChange={(e) => updateAdditionalGuestPhone(index, e.target.value)}
                            placeholder="Enter guest's phone number"
                            required
                            className="bg-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="rounded-md bg-muted p-3 ">
                  <h4 className="mb-2 text-sm font-medium text-black">Guest Policy Reminder</h4>
                  <ul className="text-xs text-black space-y-1">
                    <li>• Guests must leave by 10:00 PM unless a sleepover is approved</li>
                    <li>• You are responsible for your guest's behavior</li>
                    <li>• Guests must be accompanied by you at all times</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="mt-5">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Registering..." : "Register Guest"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Active Guests</CardTitle>
              <CardDescription>Currently registered visitors in the building.</CardDescription>
            </CardHeader>
            <CardContent>
              {activeGuests.length === 0 ? (
                <div className="text-center py-6">
                  <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No active guests at the moment</p>
                  <p className="text-xs text-muted-foreground mt-1">Register a guest using the "Register Guest" tab</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeGuests.map((guest) => (
                    <div key={guest.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium text-black">{guest.firstName} {guest.lastName}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Room: {guest.roomNumber}</span>
                            <span>•</span>
                            <span>Phone: {guest.phoneNumber}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Date of visit: {guest.fromDate}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Enter checkout code"
                            onChange={(e) => setCheckoutCodeInput(Number(e.target.value))}
                            className="bg-white w-32"
                          />
                          <Button variant="ghost" size="sm" className="text-nowrap bg-amber-500" onClick={() => handleCheckoutGuest(guest.id)}>
                            <X className="h-4 w-4 mr-1" />
                            Check-out
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="relative">
            <Image
              src="/my-domain-logo.png"
              alt="My Domain Logo"
              width={200}
              height={100}
              className="absolute top-4 right-4"
              priority
            />
            <DialogHeader className="mb-16 pr-16">
              <DialogTitle>Confirm Guest Registration</DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-3">Primary Guest</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">Full Name:</span> {currentGuest?.firstName} {currentGuest?.lastName}</p>
                <p><span className="font-semibold">Phone Number:</span> {currentGuest?.phoneNumber}</p>
                <p><span className="font-semibold">Room Number:</span> {currentGuest?.roomNumber}</p>
                <p><span className="font-semibold">Duration:</span> {currentGuest?.fromDate ? new Date(currentGuest.fromDate).toLocaleDateString() : 'Not specified'}</p>
                <p><span className="font-semibold">Purpose:</span> {currentGuest?.purpose}</p>
              </div>
            </div>
            
            {multipleGuests === "yes" && additionalGuests.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Additional Guests</h3>
                <div className="space-y-3">
                  {additionalGuests.map((guest, index) => (
                    <div key={index} className="border-b pb-3 last:border-0">
                      <p><span className="font-semibold">Guest {index + 2}:</span></p>
                      <p className="ml-4"><span className="font-medium">Full Name:</span> {guest.firstName} {guest.lastName}</p>
                      <p className="ml-4"><span className="font-medium">Phone Number:</span> {guest.phoneNumber}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmationDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                confirmGuest()
                setShowConfirmationDialog(false)
              }}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

