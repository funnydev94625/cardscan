import { NextResponse } from "next/server"

// This is a simplified BIN lookup API
// In a real implementation, you would connect to a BIN database or third-party API

// Sample BIN database (in production, this would be much more comprehensive)
const binDatabase: Record<
  string,
  {
    bank: string
    type: string
    category: string
    country: string
  }
> = {
  "400022": {
    bank: "Chase Bank",
    type: "Credit",
    category: "Visa",
    country: "US",
  },
  "400344": {
    bank: "Bank of America",
    type: "Credit",
    category: "Visa",
    country: "US",
  },
  "403744": {
    bank: "Regions Bank",
    type: "Debit",
    category: "Visa",
    country: "US",
  },
  "408000": {
    bank: "SunTrust Bank",
    type: "Credit",
    category: "Visa",
    country: "US",
  },
  "414709": {
    bank: "Associated Bank",
    type: "Credit",
    category: "Visa",
    country: "US",
  },
  "400032": {
    bank: "First Citizens Bank",
    type: "Debit",
    category: "Visa",
    country: "US",
  },
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bin = searchParams.get("bin")

  if (!bin) {
    return NextResponse.json({ error: "BIN parameter is required" }, { status: 400 })
  }

  // Look up the BIN in our database
  const binInfo = binDatabase[bin] || null

  if (!binInfo) {
    return NextResponse.json({
      bin,
      bank: "Unknown Bank",
      type: "Unknown",
      category: "Unknown",
      country: "Unknown",
    })
  }

  // Return the BIN information
  return NextResponse.json({
    bin,
    ...binInfo,
    logoUrl: `https://logo.clearbit.com/${binInfo.bank.toLowerCase().replace(/\s+/g, "")}.com`,
  })
}
