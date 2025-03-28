"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Mail, Download } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { getStudentFinanceData, createFinanceReport } from "@/lib/firestore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard } from "lucide-react"
import { RequestActions } from '@/components/admin/RequestActions'
import { RefreshButton } from '@/components/ui/refresh-button'

interface PaymentHistory {
  id: string
  amount: number
  date: Date
  type: string
  status: "paid" | "pending" | "overdue"
  description: string
}

interface StudentFinance {
  fullName: string
  tenantCode: string
  roomNumber: string
  email: string
  phone: string
  paymentHistory: PaymentHistory[]
  outstandingBalance: number
  nextPaymentDue: Date
}

export default function FinancePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [studentData, setStudentData] = useState<StudentFinance | null>(null)
  const [payments, setPayments] = useState([])

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a tenant code")
      return
    }

    try {
      setLoading(true)
      const data = await getStudentFinanceData(searchQuery)
      setStudentData(data)
    } catch (error) {
      console.error("Error fetching student data:", error)
      toast.error("Failed to fetch student data")
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    if (!studentData) return

    try {
      await createFinanceReport(studentData.tenantCode, {
        tenantCode: studentData.tenantCode,
        reportDate: new Date(),
        reportContent: JSON.stringify({
          studentInfo: {
            fullName: studentData.fullName,
            tenantCode: studentData.tenantCode,
            roomNumber: studentData.roomNumber,
            email: studentData.email,
            phone: studentData.phone
          },
          financialSummary: {
            outstandingBalance: studentData.outstandingBalance,
            nextPaymentDue: studentData.nextPaymentDue,
            paymentHistory: studentData.paymentHistory
          }
        })
      })
      toast.success("Report generated successfully")
    } catch (error) {
      console.error("Error generating report:", error)
      toast.error("Failed to generate report")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "overdue":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const requests = await getAllPayments()
      setPayments(requests)
    } catch (error) {
      toast.error('Failed to fetch payments')
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (paymentId, newStatus) => {
    try {
      await updatePaymentStatus(paymentId, newStatus)
      toast.success(`Payment ${newStatus} successfully`)
      fetchPayments()
    } catch (error) {
      toast.error('Failed to update payment status')
      console.error('Error updating payment status:', error)
    }
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance Management</h1>
        <p className="text-muted-foreground">
          Search for students and manage their financial records.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter tenant code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {studentData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Student Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-medium mb-2">Personal Information</h3>
                  <div className="space-y-1">
                    <p>
                      <span className="text-muted-foreground">Full Name:</span>{" "}
                      {studentData.fullName}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Tenant Code:</span>{" "}
                      {studentData.tenantCode}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Room Number:</span>{" "}
                      {studentData.roomNumber}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Contact Details</h3>
                  <div className="space-y-1">
                    <p>
                      <span className="text-muted-foreground">Email:</span>{" "}
                      {studentData.email}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Phone:</span>{" "}
                      {studentData.phone}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Financial Summary</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={generateReport}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Report
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium mb-2">Balance Summary</h3>
                    <div className="space-y-2">
                      <p>
                        <span className="text-muted-foreground">
                          Outstanding Balance:
                        </span>{" "}
                        ${studentData.outstandingBalance.toFixed(2)}
                      </p>
                      <p>
                        <span className="text-muted-foreground">
                          Next Payment Due:
                        </span>{" "}
                        {format(studentData.nextPaymentDue, "PPP")}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Payment History</h3>
                  <div className="space-y-4">
                    {studentData.paymentHistory.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{payment.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(payment.date, "PPP")}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-medium">
                            ${payment.amount.toFixed(2)}
                          </p>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Financial Transactions</CardTitle>
          <RefreshButton onClick={fetchPayments} loading={loading} />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>

            {['all', 'pending', 'processing', 'completed', 'failed'].map((tab) => (
              <TabsContent key={tab} value={tab}>
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                    </div>
                  ) : (
                    payments
                      .filter(payment => 
                        tab === 'all' || 
                        payment.status.toLowerCase() === tab
                      )
                      .map((payment) => (
                        <Card key={payment.id}>
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-lg">
                                    {payment.type}
                                  </h3>
                                  <span className="text-lg font-bold text-green-600">
                                    {formatAmount(payment.amount)}
                                  </span>
                                </div>
                                <p className="text-gray-600 mb-2">
                                  From: Room {payment.roomNumber}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Reference: {payment.reference}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Date: {format(payment.createdAt.toDate(), 'PPp')}
                                </p>
                              </div>
                              <Badge className={getStatusColor(payment.status)}>
                                {payment.status}
                              </Badge>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <RequestActions
                                requestId={payment.id}
                                currentStatus={payment.status}
                                onUpdateStatus={handleStatusUpdate}
                                statusOptions={['Pending', 'Processing', 'Completed', 'Failed']}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 