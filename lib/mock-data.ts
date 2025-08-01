import type { CreditCardData } from "./types"

// Helper function to mask a credit card number
function maskCardNumber(cardNumber: string): string {
  const firstSix = cardNumber.substring(0, 6)
  const lastFour = cardNumber.substring(cardNumber.length - 4)
  const masked = "*".repeat(cardNumber.length - 10)
  return `${firstSix}${masked}${lastFour}`
}

// Parse the sample data
const sampleDataString = `4000222283592972|04/25|755|Rahoul Brown|707 Foxtail Drive|4432059366|Cambridge|MD|21613|brownrahoul@yahoo.com|US
4000222588496689|07/26|823|Zion Gordon|5807 Winkie Ln|+1 843 259 5401|Ravenel|SC|29470|Ziongordon4944@gmail.com|US
4000222769987878|03/27|520|Betty Williams|1435 Holbrook St Ne Apt 4|(202) 549-6009|Washington|DC|20002|slickysexyboo7@yahoo.com|US
4003447779318049|04/26|154|Molly Sullivan|315 E. High Dr.|2066177665|Spokane|WA|99203|mollysully@msn.com|US
4003447780177046|09/27|719|Jacqueline Mack|140 Forrest Way|13154719607|Camillus|NY|13031-1314|jacqueline.mack1@gmail.com|US`

// Bank mapping based on BIN (first 6 digits)
const bankMapping: Record<string, string> = {
  "400022": "Chase Bank",
  "400344": "Bank of America",
  "403744": "Regions Bank",
  "408000": "SunTrust Bank",
  "414709": "Associated Bank",
  "400032": "First Citizens Bank",
}

// Parse the sample data into structured objects
const parseSampleData = (): CreditCardData[] => {
  return sampleDataString.split("\n").map((line) => {
    const [cardNumber, expiry, cvv, cardholderName, address, phone, city, state, zipCode, email, country] =
      line.split("|")

    const bin = cardNumber.substring(0, 6)
    const bank = bankMapping[bin] || "Unknown Bank"

    // Generate random coordinates within the US for the map
    // In a real implementation, you would use geocoding based on the address
    const latitude = 25 + Math.random() * 24 // Roughly US latitudes
    const longitude = -65 - Math.random() * 60 // Roughly US longitudes

    return {
      cardNumber,
      maskedCardNumber: maskCardNumber(cardNumber),
      bin,
      expiry,
      cvv,
      cardholderName,
      address,
      phone,
      city,
      state,
      zipCode,
      email,
      country,
      bank,
      latitude,
      longitude,
    }
  })
}

// Generate more mock data based on the sample
export const mockCardData: CreditCardData[] = (() => {
  const baseData = parseSampleData()
  const expandedData: CreditCardData[] = [...baseData]

  // Generate additional mock data based on the patterns in the sample data
  for (let i = 0; i < 95; i++) {
    const template = baseData[i % baseData.length]

    // Generate a new card number with the same BIN
    const bin = template.cardNumber.substring(0, 6)
    const randomDigits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("")
    const newCardNumber = `${bin}${randomDigits}`

    // Randomize expiry date
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")
    const year = String(Math.floor(Math.random() * 5) + 24).padStart(2, "0")
    const expiry = `${month}/${year}`

    // Create a new record based on the template
    expandedData.push({
      ...template,
      cardNumber: newCardNumber,
      maskedCardNumber: maskCardNumber(newCardNumber),
      expiry,
      cvv: String(Math.floor(Math.random() * 900) + 100),
      // Slightly adjust coordinates for clustering effect
      latitude: template.latitude + (Math.random() - 0.5) * 2,
      longitude: template.longitude + (Math.random() - 0.5) * 2,
    })
  }

  return expandedData
})()
