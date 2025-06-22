"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Zap, Navigation, Users, AlertCircle } from "lucide-react"
import { mapsService, type Location } from "@/lib/maps"

interface LiveLocationTrackerProps {
  onLocationUpdate?: (location: Location) => void
  showNearbyCount?: boolean
}

export function LiveLocationTracker({ onLocationUpdate, showNearbyCount = true }: LiveLocationTrackerProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [nearbyCount, setNearbyCount] = useState(0)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    return () => {
      if (isTracking) {
        mapsService.stopLocationTracking()
      }
    }
  }, [isTracking])

  const startTracking = async () => {
    try {
      // Get initial location
      const location = await mapsService.getCurrentLocation()
      setCurrentLocation(location)
      setLastUpdate(new Date())

      // Start continuous tracking
      mapsService.startLocationTracking((newLocation) => {
        setCurrentLocation(newLocation)
        setLastUpdate(new Date())
        onLocationUpdate?.(newLocation)

        // Update nearby users count
        if (showNearbyCount) {
          fetchNearbyCount(newLocation)
        }
      })

      setIsTracking(true)
    } catch (error) {
      console.error("Failed to start location tracking:", error)
      alert("Unable to access location. Please enable location services.")
    }
  }

  const stopTracking = () => {
    mapsService.stopLocationTracking()
    setIsTracking(false)
  }

  const fetchNearbyCount = async (location: Location) => {
    try {
      const response = await fetch(`/api/users/location?lat=${location.lat}&lng=${location.lng}&radius=2000`)
      const data = await response.json()
      setNearbyCount(data.users?.length || 0)
    } catch (error) {
      console.error("Failed to fetch nearby count:", error)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-800">Live Location</h3>
            </div>
            <Button
              size="sm"
              onClick={isTracking ? stopTracking : startTracking}
              className={`${
                isTracking ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              <Zap className="h-4 w-4 mr-2" />
              {isTracking ? "Stop" : "Start"} Tracking
            </Button>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            {isTracking ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Badge className="bg-green-100 text-green-700">Live Tracking Active</Badge>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <Badge className="bg-gray-100 text-gray-700">Tracking Stopped</Badge>
              </>
            )}
          </div>

          {/* Location Info */}
          {currentLocation && (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Latitude:</span>
                    <p className="font-mono">{currentLocation.lat.toFixed(6)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Longitude:</span>
                    <p className="font-mono">{currentLocation.lng.toFixed(6)}</p>
                  </div>
                </div>
              </div>

              {lastUpdate && (
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last updated: {formatTime(lastUpdate)}</span>
                  {accuracy && <span>±{accuracy}m accuracy</span>}
                </div>
              )}

              {/* Nearby Users Count */}
              {showNearbyCount && isTracking && (
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Nearby Users</span>
                  </div>
                  <Badge className="bg-purple-600 text-white">{nearbyCount}</Badge>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(`https://maps.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`)
                  }
                  className="flex-1"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  View on Maps
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(`${currentLocation.lat}, ${currentLocation.lng}`)}
                  className="flex-1"
                >
                  Copy Coords
                </Button>
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs text-blue-800 font-medium">Privacy Notice</p>
                <p className="text-xs text-blue-600">
                  Your location is only shared with nearby users and is not stored permanently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
