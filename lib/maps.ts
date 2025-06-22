// Google Maps integration utilities
export interface Location {
  lat: number
  lng: number
  address?: string
  name?: string
}

export interface NearbyPlace {
  id: string
  name: string
  address: string
  location: Location
  type: string
  rating?: number
  distance?: number
  safetyScore?: number
}

// Global flag to track if Google Maps is loading
let isGoogleMapsLoading = false
let googleMapsPromise: Promise<void> | null = null

export class MapsService {
  private static instance: MapsService
  private map: google.maps.Map | null = null
  private userMarker: google.maps.Marker | null = null
  private nearbyMarkers: google.maps.Marker[] = []
  private watchId: number | null = null
  private isLoaded = false

  static getInstance(): MapsService {
    if (!MapsService.instance) {
      MapsService.instance = new MapsService()
    }
    return MapsService.instance
  }

  async loadGoogleMaps(): Promise<void> {
    // Return existing promise if already loading
    if (googleMapsPromise) {
      return googleMapsPromise
    }

    // Return immediately if already loaded
    if (this.isLoaded || (typeof window !== "undefined" && window.google && window.google.maps)) {
      this.isLoaded = true
      return Promise.resolve()
    }

    // Prevent multiple loading attempts
    if (isGoogleMapsLoading) {
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (this.isLoaded || (window.google && window.google.maps)) {
            this.isLoaded = true
            resolve()
          } else {
            setTimeout(checkLoaded, 100)
          }
        }
        checkLoaded()
      })
    }

    isGoogleMapsLoading = true

    googleMapsPromise = new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("Window is not defined"))
        return
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        this.isLoaded = true
        isGoogleMapsLoading = false
        resolve()
        return
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.warn("Google Maps API key not found in NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. Using demo mode.")
        this.isLoaded = true
        isGoogleMapsLoading = false
        resolve()
        return
      }

      console.log("Loading Google Maps with API key:", apiKey.substring(0, 10) + "...")

      // Create script element
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`
      script.async = true
      script.defer = true

      // Global callback
      ;(window as any).initGoogleMaps = () => {
        console.log("Google Maps loaded successfully")
        this.isLoaded = true
        isGoogleMapsLoading = false
        resolve()
      }

      script.onerror = () => {
        console.warn("Failed to load Google Maps, using fallback mode")
        isGoogleMapsLoading = false
        this.isLoaded = true
        resolve() // Don't reject, just continue without maps
      }

      document.head.appendChild(script)
    })

    return googleMapsPromise
  }

  async initializeMap(container: HTMLElement, center: Location): Promise<google.maps.Map | null> {
    try {
      await this.loadGoogleMaps()

      if (!window.google || !window.google.maps) {
        console.warn("Google Maps not available, showing placeholder")
        container.innerHTML = `
          <div class="w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center rounded-lg border-2 border-dashed border-purple-200">
            <div class="text-center p-6">
              <div class="text-4xl mb-3">🗺️</div>
              <p class="text-purple-600 font-medium mb-2">Map View</p>
              <p class="text-gray-500 text-sm mb-2">Location services active</p>
              <p class="text-gray-400 text-xs">Lat: ${center.lat.toFixed(4)}, Lng: ${center.lng.toFixed(4)}</p>
              <div class="mt-3 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                Google Maps API key required for full functionality
              </div>
            </div>
          </div>
        `
        return null
      }

      this.map = new window.google.maps.Map(container, {
        zoom: 15,
        center: { lat: center.lat, lng: center.lng },
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      })

      console.log("Google Maps initialized successfully")
      return this.map
    } catch (error) {
      console.error("Failed to initialize map:", error)
      // Show fallback content
      container.innerHTML = `
        <div class="w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center rounded-lg border-2 border-dashed border-purple-200">
          <div class="text-center p-6">
            <div class="text-4xl mb-3">🗺️</div>
            <p class="text-purple-600 font-medium mb-2">Map View</p>
            <p class="text-gray-500 text-sm mb-2">Location services active</p>
            <p class="text-gray-400 text-xs">Lat: ${center.lat.toFixed(4)}, Lng: ${center.lng.toFixed(4)}</p>
            <div class="mt-3 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
              Map temporarily unavailable
            </div>
          </div>
        </div>
      `
      return null
    }
  }

  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.warn("Geolocation not supported, using default location")
        // Fallback to default location
        resolve({ lat: 37.7749, lng: -122.4194 })
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Location obtained:", position.coords.latitude, position.coords.longitude)
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.warn("Geolocation error, using default location:", error.message)
          // Fallback to default location instead of rejecting
          resolve({ lat: 37.7749, lng: -122.4194 })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      )
    })
  }

  startLocationTracking(onLocationUpdate: (location: Location) => void): void {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported")
      return
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        onLocationUpdate(location)
        this.updateUserMarker(location)
      },
      (error) => console.error("Location tracking error:", error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute
      },
    )
  }

  stopLocationTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
  }

  updateUserMarker(location: Location): void {
    if (!this.map || !window.google) return

    if (this.userMarker) {
      this.userMarker.setPosition({ lat: location.lat, lng: location.lng })
    } else {
      this.userMarker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: this.map,
        title: "Your Location",
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#8B5CF6" stroke="#FFFFFF" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="#FFFFFF"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
          anchor: new window.google.maps.Point(12, 12),
        },
      })
    }

    this.map.setCenter({ lat: location.lat, lng: location.lng })
  }

  addNearbyUserMarkers(users: any[]): void {
    if (!this.map || !window.google) return

    // Clear existing markers
    this.nearbyMarkers.forEach((marker) => marker.setMap(null))
    this.nearbyMarkers = []

    users.forEach((user) => {
      if (user.location && user.firstName) {
        const marker = new window.google.maps.Marker({
          position: { lat: user.location.lat, lng: user.location.lng },
          map: this.map,
          title: `${user.firstName} ${user.lastName || ""}`,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#EC4899" stroke="#FFFFFF" stroke-width="2"/>
                <circle cx="16" cy="16" r="6" fill="#FFFFFF"/>
                <text x="16" y="20" text-anchor="middle" fill="#EC4899" font-size="8" font-weight="bold">${user.firstName[0]}</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16),
          },
        })

        // Add click listener
        marker.addListener("click", () => {
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-semibold">${user.firstName} ${user.lastName || ""}</h3>
                <p class="text-sm text-gray-600">${user.currentMood || user.mood}</p>
                <p class="text-xs text-gray-500">${user.distance || "nearby"}</p>
              </div>
            `,
          })
          infoWindow.open(this.map, marker)
        })

        this.nearbyMarkers.push(marker)
      }
    })
  }

  async findNearbyPlaces(location: Location, type = "cafe"): Promise<NearbyPlace[]> {
    try {
      await this.loadGoogleMaps()

      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.warn("Google Places not available, returning mock data")
        return this.getMockPlaces(location, type)
      }

      const { PlacesService } = window.google.maps.places

      return new Promise((resolve, reject) => {
        if (!this.map) {
          resolve(this.getMockPlaces(location, type))
          return
        }

        const service = new PlacesService(this.map)

        service.nearbySearch(
          {
            location: { lat: location.lat, lng: location.lng },
            radius: 2000, // 2km
            type: type as any,
          },
          (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              const places: NearbyPlace[] = results.map((place) => ({
                id: place.place_id || "",
                name: place.name || "",
                address: place.vicinity || "",
                location: {
                  lat: place.geometry?.location?.lat() || 0,
                  lng: place.geometry?.location?.lng() || 0,
                },
                type: place.types?.[0] || type,
                rating: place.rating,
                distance: this.calculateDistance(location, {
                  lat: place.geometry?.location?.lat() || 0,
                  lng: place.geometry?.location?.lng() || 0,
                }),
                safetyScore: this.calculateSafetyScore(place),
              }))
              resolve(places)
            } else {
              resolve(this.getMockPlaces(location, type))
            }
          },
        )
      })
    } catch (error) {
      console.error("Error finding nearby places:", error)
      return this.getMockPlaces(location, type)
    }
  }

  private getMockPlaces(location: Location, type: string): NearbyPlace[] {
    // Return mock places when Google Maps is not available
    return [
      {
        id: "mock-1",
        name: "Local Coffee Shop",
        address: "123 Main St",
        location: { lat: location.lat + 0.001, lng: location.lng + 0.001 },
        type: "cafe",
        rating: 4.5,
        distance: 150,
        safetyScore: 85,
      },
      {
        id: "mock-2",
        name: "Community Center",
        address: "456 Oak Ave",
        location: { lat: location.lat - 0.001, lng: location.lng + 0.001 },
        type: "establishment",
        rating: 4.3,
        distance: 200,
        safetyScore: 90,
      },
      {
        id: "mock-3",
        name: "Public Library",
        address: "789 Library St",
        location: { lat: location.lat + 0.002, lng: location.lng - 0.001 },
        type: "library",
        rating: 4.7,
        distance: 300,
        safetyScore: 95,
      },
    ]
  }

  calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (loc1.lat * Math.PI) / 180
    const φ2 = (loc2.lat * Math.PI) / 180
    const Δφ = ((loc2.lat - loc1.lat) * Math.PI) / 180
    const Δλ = ((loc2.lng - loc1.lng) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return Math.round(R * c)
  }

  private calculateSafetyScore(place: google.maps.places.PlaceResult): number {
    let score = 70 // Base score

    if (place.rating && place.rating > 4) score += 15
    if (place.user_ratings_total && place.user_ratings_total > 100) score += 10
    if (place.types?.includes("cafe") || place.types?.includes("restaurant")) score += 5

    return Math.min(score, 100)
  }
}

export const mapsService = MapsService.getInstance()
