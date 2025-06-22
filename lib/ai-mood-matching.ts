// AI-powered mood matching algorithm
export interface UserMood {
  userId: string
  mood: string
  intensity: number // 1-10
  tags: string[]
  timestamp: Date
  location?: { lat: number; lng: number }
}

export interface MatchScore {
  userId: string
  score: number
  reasons: string[]
  compatibility: "high" | "medium" | "low"
}

export class MoodMatchingAI {
  // Mood compatibility matrix
  private static moodCompatibility: Record<string, Record<string, number>> = {
    Anxious: {
      Calm: 0.9,
      Supportive: 0.8,
      Understanding: 0.9,
      Anxious: 0.6,
      Happy: 0.4,
      Excited: 0.3,
    },
    Depressed: {
      Supportive: 0.9,
      Understanding: 0.8,
      Calm: 0.7,
      Happy: 0.5,
      Depressed: 0.4,
    },
    Lonely: {
      Friendly: 0.9,
      Social: 0.8,
      Understanding: 0.7,
      Lonely: 0.6,
    },
    Happy: {
      Happy: 0.8,
      Excited: 0.7,
      Social: 0.6,
      Anxious: 0.4,
      Depressed: 0.3,
    },
    Stressed: {
      Calm: 0.9,
      Supportive: 0.8,
      Understanding: 0.7,
      Stressed: 0.5,
    },
  }

  static calculateMoodCompatibility(userMood: string, targetMood: string): number {
    return this.moodCompatibility[userMood]?.[targetMood] || 0.5
  }

  static findBestMatches(currentUser: UserMood, nearbyUsers: UserMood[], maxResults = 10): MatchScore[] {
    const matches: MatchScore[] = []

    for (const user of nearbyUsers) {
      if (user.userId === currentUser.userId) continue

      let score = 0
      const reasons: string[] = []

      // Mood compatibility (40% weight)
      const moodScore = this.calculateMoodCompatibility(currentUser.mood, user.mood)
      score += moodScore * 0.4
      if (moodScore > 0.7) {
        reasons.push(`Great mood compatibility (${currentUser.mood} + ${user.mood})`)
      }

      // Intensity matching (20% weight)
      const intensityDiff = Math.abs(currentUser.intensity - user.intensity)
      const intensityScore = Math.max(0, 1 - intensityDiff / 10)
      score += intensityScore * 0.2
      if (intensityScore > 0.7) {
        reasons.push("Similar emotional intensity")
      }

      // Tag overlap (25% weight)
      const commonTags = currentUser.tags.filter((tag) => user.tags.includes(tag))
      const tagScore = commonTags.length / Math.max(currentUser.tags.length, user.tags.length)
      score += tagScore * 0.25
      if (commonTags.length > 0) {
        reasons.push(`Shared interests: ${commonTags.join(", ")}`)
      }

      // Temporal relevance (15% weight)
      const timeDiff = Math.abs(currentUser.timestamp.getTime() - user.timestamp.getTime())
      const timeScore = Math.max(0, 1 - timeDiff / (1000 * 60 * 60 * 24)) // 24 hours
      score += timeScore * 0.15

      // Determine compatibility level
      let compatibility: "high" | "medium" | "low" = "low"
      if (score > 0.7) compatibility = "high"
      else if (score > 0.5) compatibility = "medium"

      matches.push({
        userId: user.userId,
        score,
        reasons,
        compatibility,
      })
    }

    // Sort by score and return top matches
    return matches.sort((a, b) => b.score - a.score).slice(0, maxResults)
  }

  static generateMoodInsights(userMood: UserMood): string[] {
    const insights: string[] = []

    switch (userMood.mood) {
      case "Anxious":
        insights.push("Consider connecting with someone calm and understanding")
        insights.push("Breathing exercises and grounding techniques might help")
        break
      case "Depressed":
        insights.push("Reaching out for support is a brave first step")
        insights.push("Small social connections can make a big difference")
        break
      case "Lonely":
        insights.push("You're not alone - many people feel this way")
        insights.push("Even brief conversations can help combat loneliness")
        break
      case "Stressed":
        insights.push("Talking through stress can provide new perspectives")
        insights.push("Consider meeting someone in a calm environment")
        break
    }

    return insights
  }
}
