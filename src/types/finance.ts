export type PaymentStatus = "paid" | "pending" | "overdue"
export type PaymentType = "rent" | "deposit" | "fine" | "other"

export interface Payment {
  id: string
  amount: number
  date: Date
  description: string
  status: PaymentStatus
  type: PaymentType
  createdAt?: Date
  updatedAt?: Date
}

export interface FinancialReport {
  id: string
  userId: string
  tenantCode: string
  reportDate: Date
  reportUrl?: string
  reportData: string
  createdAt: Date
}

export interface StudentFinanceProfile {
  fullName: string
  tenantCode: string
  roomNumber: string
  email: string
  phone: string
  paymentHistory: Payment[]
  outstandingBalance: number
  nextPaymentDue: Date
}

export interface FinanceReport {
  id: string
  reportDate: Date
  reportUrl?: string
  createdAt: Date
}

// Firestore types
export interface FirestorePayment {
  id: string
  amount: number
  date: string | Date
  description: string
  status: string
  type: string
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface FirestoreReport {
  id: string
  reportDate: string | Date
  reportUrl?: string
  createdAt: string | Date
  reportData?: string
} 