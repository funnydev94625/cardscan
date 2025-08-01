import { Suspense } from "react"
import CardDashboard from "@/components/card-dashboard"
import { Loader2 } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Suspense
        // fallback={
        //   <div className="flex h-screen w-full items-center justify-center">
        //     <Loader2 className="h-8 w-8 animate-spin text-primary" />
        //   </div>
        // }
      >
        <CardDashboard />
      </Suspense>
    </main>
  )
}
