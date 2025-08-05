"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { CreditCard } from "lucide-react"

interface BankLogoProps {
  bin: object
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
        // Generate a placeholder logo based on the BIN
        // In production, replace this with your actual BIN lookup API
        const domain = getBankDomain(bin.website)
        console.log(domain)
        const logoUrl = !bin.website ? `https://logo.clearbit.com/www.popularbank.com` : `https://logo.clearbit.com/${domain}`
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
  // useEffect(() => {
  //   console.log(logoUrl)
  // }, [logoUrl])

  if (isLoading) {
    return <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
  }
  // if (error || !logoUrl) {
  //   return (
  //     <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
  //       <CreditCard className="w-4 h-4 text-muted-foreground" />
  //     </div>
  //   )
  // }
  function getBankDomain(bin: string): string {
    // This is just a simulation - in reality you would use a BIN database
    const str = bin.split('/')[2]
    return str;
  }

  return (
    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white">
      <Image
        src={!bin?.website ? `https://logo.clearbit.com/www.popularbank.com` : `https://logo.clearbit.com/${getBankDomain(bin.website)}`}
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

