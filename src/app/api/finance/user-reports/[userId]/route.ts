import { NextResponse } from "next/server"
import { getStudentFinanceReports } from "@/lib/firestore"

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId
    const reports = await getStudentFinanceReports(userId)
    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
} 