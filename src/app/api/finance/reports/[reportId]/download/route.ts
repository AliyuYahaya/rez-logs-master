import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export async function GET(
  request: Request,
  { params }: { params: { reportId: string } }
) {
  try {
    const reportId = params.reportId

    // Get the report document
    const reportRef = doc(db, "financial_reports", reportId)
    const reportSnap = await getDoc(reportRef)

    if (!reportSnap.exists()) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    const reportData = reportSnap.data()

    // Convert base64 string back to buffer
    const pdfBuffer = Buffer.from(reportData.reportData, 'base64')

    // Return the PDF file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="finance-report-${reportId}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error downloading report:", error)
    return NextResponse.json(
      { error: "Failed to download report" },
      { status: 500 }
    )
  }
} 