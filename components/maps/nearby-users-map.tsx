"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Users, Zap } from "lucide-react"
import { mapsService, type Location } from "@/lib/maps"

interface NearbyUsersMapProps {
  users: any[]
  onUserSelect?: (user: any) => void
  showLiveTracking?: boolean
}

export function NearbyUsersMap({ users, onUserSelect, showLiveTracking = true }: NearbyUsersMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    initializeMap()
    return () => {
      if (showLiveTracking) {
        mapsService.stopLocationTracking()
      }
    }
  }, [])

  useEffect(() => {
    if (mapLoaded && users.length > 0) {
      mapsService.addNearbyUserMarkers(users)
    }
  }, [users, mapLoaded])

  const initializeMap = async () => {
    if (!mapRef.current) return

    try {
      // Get current location
      const location = await mapsService.getCurrentLocation()
      setCurrentLocation(location)

      // Initialize map
      await mapsService.initializeMap(mapRef.current, location)
      setMapLoaded(true)

      // Start live tracking if enabled
      if (showLiveTracking) {
        startLiveTracking()
      }
    } catch (error) {
      console.error("Failed to initialize map:", error)
    }
  }

  const startLiveTracking = () => {
    setIsTracking(true)
    mapsService.startLocationTracking((location) => {
      setCurrentLocation(location)
      // Update user location in database
      updateUserLocation(location)
    })
  }

  const stopLiveTracking = () => {
    setIsTracking(false)
    mapsService.stopLocationTracking()
  }

  const updateUserLocation = async (location: Location) => {
    try {
      await fetch("/api/users/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location }),
      })
    } catch (error) {
      console.error("Failed to update location:", error)
    }
  }

  const centerOnUser = async () => {
    try {
      const location = await mapsService.getCurrentLocation()
      setCurrentLocation(location)
      mapsService.updateUserMarker(location)
    } catch (error) {
      console.error("Failed to get location:", error)
    }
  }

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-purple-600" />
            <span>Nearby Users Map</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-100 text-blue-700">
              <Users className="h-3 w-3 mr-1" />
              {users.length} nearby
            </Badge>
            {isTracking && (
              <Badge className="bg-green-100 text-green-700">
                <Zap className="h-3 w-3 mr-1" />
                Live
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Map Container */}
          <div className="relative">
            <div ref={mapRef} className="w-full h-96 rounded-lg bg-gray-100" />

            {/* Map Controls */}
            <div className="absolute top-4 right-4 space-y-2">
              <Button size="sm" onClick={centerOnUser} className="bg-white hover:bg-gray-50 text-gray-700 shadow-md">
                <Navigation className="h-4 w-4" />
              </Button>

              {showLiveTracking && (
                <Button
                  size="sm"
                  onClick={isTracking ? stopLiveTracking : startLiveTracking}
                  className={`shadow-md ${
                    isTracking ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  <Zap className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Location Info */}
          {currentLocation && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current Location:</span>
                <span className="font-medium">
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </span>
              </div>
              {isTracking && (
                <div className="flex items-center mt-2 text-xs text-green-600">
                  <Zap className="h-3 w-3 mr-1" />
                  Live tracking active
                </div>
              )}
            </div>
          )}

          {/* User List */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => onUserSelect?.(user)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.mood}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{user.distance}m</p>
                  <p className="text-xs text-gray-500">away</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
