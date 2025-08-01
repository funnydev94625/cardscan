"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import type { CreditCardData } from "@/lib/types"

interface CardMapProps {
  data: CreditCardData[]
}

// Mapbox access token
const MAPBOX_TOKEN = "sk.eyJ1IjoiYWVsaGFkZGFkIiwiYSI6ImNtZG54OXhvcjI1OWsya3EwMnRja2JtemYifQ.jgIvFd38jrpH1UZJgIzjeA"

export default function CardMap({ data }: CardMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mapboxgl, setMapboxgl] = useState<any>(null)
  const { theme } = useTheme()

  useEffect(() => {
    // Import Mapbox GL dynamically to avoid SSR issues
    const loadMapbox = async () => {
      if (typeof window !== "undefined") {
        try {
          // Import Mapbox GL CSS
          const mapboxCSS = document.createElement("link")
          mapboxCSS.rel = "stylesheet"
          mapboxCSS.href = "https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css"
          document.head.appendChild(mapboxCSS)

          // Import Mapbox GL JS
          const mapboxModule = await import("mapbox-gl")
          const mapboxgl = mapboxModule.default

          // Set access token
          mapboxgl.accessToken = MAPBOX_TOKEN

          setMapboxgl(mapboxgl)

          if (!mapInstanceRef.current && mapRef.current) {
            // Initialize the map
            mapInstanceRef.current = new mapboxgl.Map({
              container: mapRef.current,
              style: theme === "dark" ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11",
              center: [-98.5795, 39.8283], // Center of US
              zoom: 3,
              attributionControl: true,
            })

            // Add navigation controls
            mapInstanceRef.current.addControl(
              new mapboxgl.NavigationControl({
                showCompass: true,
                showZoom: true,
              }),
              "top-right",
            )

            // Wait for map to load
            mapInstanceRef.current.on("load", () => {
              setIsLoading(false)
              addMarkersToMap()
            })
          }
        } catch (error) {
          console.error("Error loading Mapbox:", error)
          setIsLoading(false)
        }
      }
    }

    loadMapbox()

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update map style when theme changes
  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      const newStyle = theme === "dark" ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11"

      mapInstanceRef.current.setStyle(newStyle)
    }
  }, [theme, isLoading])

  // Update markers when data changes
  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      addMarkersToMap()
    }
  }, [data, isLoading, theme])

  const addMarkersToMap = () => {
    if (!mapInstanceRef.current || !mapboxgl) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Create a mapping of locations to count for clustering
    const locationCounts: Record<string, { count: number; lat: number; lng: number; cards: CreditCardData[] }> = {}

    // Process data to get coordinates and counts
    data.forEach((card) => {
      if (card.latitude && card.longitude) {
        const key = `${card.latitude.toFixed(2)},${card.longitude.toFixed(2)}`
        if (!locationCounts[key]) {
          locationCounts[key] = {
            count: 0,
            lat: card.latitude,
            lng: card.longitude,
            cards: [],
          }
        }
        locationCounts[key].count++
        locationCounts[key].cards.push(card)
      }
    })

    // Add markers to the map
    Object.values(locationCounts).forEach((location) => {
      const { lat, lng, count, cards } = location

      // Determine marker size based on count
      const baseSize = 24
      const maxSize = 48
      const size = Math.max(baseSize, Math.min(maxSize, baseSize + Math.log(count) * 6))

      // Theme-aware marker colors
      const isDark = theme === "dark"
      const markerColor = isDark ? "#3b82f6" : "#1a56db"
      const shadowColor = isDark ? "rgba(59, 130, 246, 0.4)" : "rgba(26, 86, 219, 0.4)"
      const borderColor = isDark ? "#374151" : "#f3f4f6"

      // Create custom HTML for the marker
      const markerElement = document.createElement("div")
      markerElement.className = "custom-mapbox-marker"
      markerElement.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, ${markerColor} 0%, ${isDark ? "#1d4ed8" : "#3b82f6"} 100%);
        border: 3px solid ${borderColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${count > 99 ? "10px" : count > 9 ? "11px" : "12px"};
        box-shadow: 0 4px 12px ${shadowColor};
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        font-family: system-ui, -apple-system, sans-serif;
      `
      markerElement.textContent = count > 99 ? "99+" : count.toString()

      // Add hover effects
      markerElement.addEventListener("mouseenter", () => {
        markerElement.style.transform = "scale(1.1)"
        markerElement.style.boxShadow = `0 6px 20px ${isDark ? "rgba(59, 130, 246, 0.6)" : "rgba(26, 86, 219, 0.6)"}`
      })

      markerElement.addEventListener("mouseleave", () => {
        markerElement.style.transform = "scale(1)"
        markerElement.style.boxShadow = `0 4px 12px ${shadowColor}`
      })

      // Create popup content
      const popupBg = isDark ? "#1f2937" : "white"
      const textColor = isDark ? "#f9fafb" : "#1f2937"
      const subtextColor = isDark ? "#d1d5db" : "#6b7280"

      const popupContent = `
        <div style="padding: 12px; min-width: 200px; font-family: system-ui, -apple-system, sans-serif; background: ${popupBg}; color: ${textColor}; border-radius: 8px;">
          <h3 style="font-weight: bold; font-size: 18px; margin-bottom: 12px; color: ${textColor};">
            ${count} card${count > 1 ? "s" : ""} in this area
          </h3>
          <div style="max-height: 160px; overflow-y: auto;">
            ${cards
              .slice(0, 5)
              .map(
                (card) => `
              <div style="border-bottom: 1px solid ${borderColor}; padding-bottom: 8px; margin-bottom: 8px;">
                <div style="font-weight: 500; color: ${textColor};">${card.cardholderName}</div>
                <div style="font-size: 14px; color: ${subtextColor};">${card.city}, ${card.state}</div>
                <div style="font-size: 12px; color: ${subtextColor}; opacity: 0.8;">${card.bank || "Unknown Bank"}</div>
              </div>
            `,
              )
              .join("")}
            ${
              count > 5
                ? `<div style="font-size: 12px; color: ${subtextColor}; text-align: center; padding-top: 8px;">
                     ...and ${count - 5} more cards
                   </div>`
                : ""
            }
          </div>
        </div>
      `

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        className: `custom-mapbox-popup ${isDark ? "dark-popup" : "light-popup"}`,
      }).setHTML(popupContent)

      // Create marker and add to map
      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: "center",
      })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapInstanceRef.current)

      markersRef.current.push(marker)
    })
  }

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full rounded-md" />
      <style jsx global>{`
        .custom-mapbox-marker {
          animation: markerPulse 2s infinite;
        }
        
        @keyframes markerPulse {
          0% {
            box-shadow: 0 4px 12px rgba(26, 86, 219, 0.4);
          }
          50% {
            box-shadow: 0 4px 20px rgba(26, 86, 219, 0.6);
          }
          100% {
            box-shadow: 0 4px 12px rgba(26, 86, 219, 0.4);
          }
        }

        .dark .custom-mapbox-marker {
          animation: markerPulseDark 2s infinite;
        }

        @keyframes markerPulseDark {
          0% {
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.6);
          }
          100% {
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          }
        }

        .light-popup .mapboxgl-popup-content {
          background: white !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
          padding: 0 !important;
        }

        .dark-popup .mapboxgl-popup-content {
          background: #1f2937 !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
          padding: 0 !important;
        }

        .light-popup .mapboxgl-popup-tip {
          border-top-color: white !important;
        }

        .dark-popup .mapboxgl-popup-tip {
          border-top-color: #1f2937 !important;
        }

        .mapboxgl-ctrl-group {
          border-radius: 8px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
        }

        .mapboxgl-ctrl-zoom-in,
        .mapboxgl-ctrl-zoom-out,
        .mapboxgl-ctrl-compass {
          background: ${theme === "dark" ? "#374151" : "white"} !important;
          color: ${theme === "dark" ? "white" : "#374151"} !important;
          border: none !important;
        }

        .mapboxgl-ctrl-zoom-in:hover,
        .mapboxgl-ctrl-zoom-out:hover,
        .mapboxgl-ctrl-compass:hover {
          background: ${theme === "dark" ? "#4b5563" : "#f9fafb"} !important;
        }

        .mapboxgl-popup-close-button {
          color: ${theme === "dark" ? "#d1d5db" : "#6b7280"} !important;
          font-size: 18px !important;
          padding: 8px !important;
        }

        .mapboxgl-popup-close-button:hover {
          background: ${theme === "dark" ? "#374151" : "#f3f4f6"} !important;
          color: ${theme === "dark" ? "white" : "#1f2937"} !important;
        }
      `}</style>
    </div>
  )
}
