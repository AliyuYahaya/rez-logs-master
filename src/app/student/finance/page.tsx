"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import type { StudentFinanceProfile, FirestorePayment, FirestoreReport, PaymentStatus, PaymentType, FinanceReport } from "@/types/finance"
import { getStudentFinanceData, getStudentFinanceReports } from "@/lib/firestore"

const validatePaymentType = (type: string): PaymentType => {
  if (type === "rent" || type === "deposit" || type === "fine" || type === "other") {
    return type
  }
  return "other"
}

const validatePaymentStatus = (status: string): PaymentStatus => {
  if (status === "paid" || status === "pending" || status === "overdue") {
    return status
  }
  return "pending"
}

const convertFirestorePayment = (payment: FirestorePayment) => ({
  ...payment,
  date: payment.date instanceof Date ? payment.date : new Date(payment.date),
  type: validatePaymentType(payment.type),
  status: validatePaymentStatus(payment.status),
  createdAt: payment.createdAt ? (payment.createdAt instanceof Date ? payment.createdAt : new Date(payment.createdAt)) : undefined,
  updatedAt: payment.updatedAt ? (payment.updatedAt instanceof Date ? payment.updatedAt : new Date(payment.updatedAt)) : undefined,
})

const convertFirestoreReport = (report: FirestoreReport): FinanceReport => ({
  id: report.id,
  reportDate: report.reportDate instanceof Date ? report.reportDate : new Date(report.reportDate),
  createdAt: report.createdAt instanceof Date ? report.createdAt : new Date(report.createdAt),
  reportUrl: report.reportUrl
})

export default function StudentFinancePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [financeData, setFinanceData] = useState<StudentFinanceProfile | null>(null)
  const [reports, setReports] = useState<FinanceReport[]>([])

  useEffect(() => {
    if (user) {
      fetchFinanceData()
      fetchReports()
    }
  }, [user])

  const fetchFinanceData = async () => {
    if (!user?.uid) return

    try {
      const firestoreData = await getStudentFinanceData(user.uid)
      const transformedData: StudentFinanceProfile = {
        ...firestoreData,
        nextPaymentDue: firestoreData.nextPaymentDue instanceof Date 
          ? firestoreData.nextPaymentDue 
          : new Date(firestoreData.nextPaymentDue),
        paymentHistory: firestoreData.paymentHistory.map(convertFirestorePayment)
      }
      setFinanceData(transformedData)
    } catch (error) {
      console.error("Error fetching finance data:", error)
      toast.error("Failed to fetch finance data")
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    if (!user?.uid) return

    try {
      const firestoreReports = await getStudentFinanceReports(user.uid)
      const transformedReports = firestoreReports.map(convertFirestoreReport)
      setReports(transformedReports)
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast.error("Failed to fetch reports")
    }
  }

  const downloadReport = async (reportId: string) => {
    if (!user?.uid) return

    try {
      // TODO: Implement report download using Firebase Storage
      toast.info("Report download functionality coming soon")
    } catch (error) {
      console.error("Error downloading report:", error)
      toast.error("Failed to download report")
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

  if (loading) {
    return <div>Loading...</div>
  }

  if (!financeData) {
    return <div>No finance data available</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Finances</h1>
        <p className="text-muted-foreground">
          View your financial information and payment history
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Balance Summary</h3>
              <div className="space-y-2">
                <p>
                  <span className="text-muted-foreground">
                    Outstanding Balance:
                  </span>{" "}
                  ${financeData.outstandingBalance.toFixed(2)}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    Next Payment Due:
                  </span>{" "}
                  {format(financeData.nextPaymentDue, "PPP")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Payment History</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View Statement
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {financeData.paymentHistory.map((payment) => (
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
        </CardContent>
      </Card>

      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">Financial Report</p>
                    <p className="text-sm text-muted-foreground">
                      {format(report.reportDate, "PPP")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => downloadReport(report.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 