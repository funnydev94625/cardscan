"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { CreditCard } from "lucide-react"

interface BankLogoProps {
  bin: string
}

export default function BankLogo({ bin }: BankLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchBankLogo = async () => {
      if (!bin) {
        setIsLoading(false)
        setError(true)
        return
      }

      try {
        // In a real implementation, you would call your BIN lookup API here
        // For this example, we'll simulate a response with a placeholder

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Generate a placeholder logo based on the BIN
        // In production, replace this with your actual BIN lookup API
        const logoUrl = `https://logo.clearbit.com/${getBankDomain(bin)}`

        setLogoUrl(logoUrl)
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching bank logo:", err)
        setError(true)
        setIsLoading(false)
      }
    }

    fetchBankLogo()
  }, [bin])

  if (isLoading) {
    return <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
  }

  if (error || !logoUrl) {
    return (
      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
        <CreditCard className="w-4 h-4 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-white">
      <Image
        src={logoUrl || "/placeholder.svg"}
        alt="Bank logo"
        fill
        className="object-contain"
        onError={() => setError(true)}
      />
    </div>
  )
}

// Helper function to simulate getting a bank domain from a BIN
// In production, replace this with your actual BIN lookup logic
function getBankDomain(bin: string): string {
  // This is just a simulation - in reality you would use a BIN database
  const firstDigit = bin.charAt(0)

  switch (firstDigit) {
    case "4":
      return "visa.com"
    case "5":
      return "mastercard.com"
    case "3":
      return "americanexpress.com"
    case "6":
      return "discover.com"
    default:
      // Generate a fake bank domain based on the BIN
      const bankId = Number.parseInt(bin.substring(0, 4)) % 10
      const banks = [
        "chase.com",
        "bankofamerica.com",
        "wellsfargo.com",
        "citibank.com",
        "capitalone.com",
        "usbank.com",
        "pnc.com",
        "tdbank.com",
        "suntrust.com",
        "regions.com",
      ]
      return banks[bankId]
  }
}
