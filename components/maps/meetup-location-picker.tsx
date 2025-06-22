"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Coffee, TreePine, Building, Star, Shield } from "lucide-react"
import { mapsService, type Location, type NearbyPlace } from "@/lib/maps"

interface MeetupLocationPickerProps {
  onLocationSelect: (place: NearbyPlace) => void
  selectedLocation?: NearbyPlace
}

export function MeetupLocationPicker({ onLocationSelect, selectedLocation }: MeetupLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("cafe")
  const [loading, setLoading] = useState(false)

  const placeTypes = [
    { id: "cafe", name: "Cafes", icon: <Coffee className="h-4 w-4" /> },
    { id: "park", name: "Parks", icon: <TreePine className="h-4 w-4" /> },
    { id: "library", name: "Libraries", icon: <Building className="h-4 w-4" /> },
    { id: "restaurant", name: "Restaurants", icon: <Coffee className="h-4 w-4" /> },
  ]

  useEffect(() => {
    initializeMap()
  }, [])

  useEffect(() => {
    if (currentLocation) {
      searchNearbyPlaces()
    }
  }, [currentLocation, selectedType])

  const initializeMap = async () => {
    if (!mapRef.current) return

    try {
      const location = await mapsService.getCurrentLocation()
      setCurrentLocation(location)
      await mapsService.initializeMap(mapRef.current, location)
    } catch (error) {
      console.error("Failed to initialize map:", error)
    }
  }

  const searchNearbyPlaces = async () => {
    if (!currentLocation) return

    setLoading(true)
    try {
      const places = await mapsService.findNearbyPlaces(currentLocation, selectedType)
      setNearbyPlaces(places.slice(0, 10)) // Limit to 10 results
    } catch (error) {
      console.error("Failed to search places:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceSelect = (place: NearbyPlace) => {
    onLocationSelect(place)
    // Center map on selected place
    mapsService.updateUserMarker(place.location)
  }

  const filteredPlaces = nearbyPlaces.filter(
    (place) =>
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.address.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getSafetyColor = (score: number) => {
    if (score >= 85) return "text-green-600 bg-green-100"
    if (score >= 70) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-purple-600" />
          <span>Choose Meeting Location</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Map */}
        <div ref={mapRef} className="w-full h-64 rounded-lg bg-gray-100" />

        {/* Place Type Filters */}
        <div className="flex space-x-2 overflow-x-auto">
          {placeTypes.map((type) => (
            <Button
              key={type.id}
              variant={selectedType === type.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type.id)}
              className={`flex items-center space-x-2 whitespace-nowrap ${
                selectedType === type.id ? "bg-purple-600 hover:bg-purple-700" : ""
              }`}
            >
              {type.icon}
              <span>{type.name}</span>
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search for a specific place..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Places List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Finding safe places nearby...</p>
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No places found. Try a different search or location type.</p>
            </div>
          ) : (
            filteredPlaces.map((place) => (
              <Card
                key={place.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedLocation?.id === place.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300 hover:shadow-md"
                }`}
                onClick={() => handlePlaceSelect(place)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-800">{place.name}</h3>
                        {place.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400" />
                            <span className="text-sm text-gray-600">{place.rating}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{place.address}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {place.distance}m away
                        </Badge>
                        {place.safetyScore && (
                          <Badge className={`text-xs ${getSafetyColor(place.safetyScore)}`}>
                            <Shield className="h-3 w-3 mr-1" />
                            {place.safetyScore}% safe
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {selectedLocation && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-800 mb-2">Selected Location</h4>
            <p className="text-sm text-purple-700">{selectedLocation.name}</p>
            <p className="text-xs text-purple-600">{selectedLocation.address}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
