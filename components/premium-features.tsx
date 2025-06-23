import { Shield, Video, Clock, TrendingUp, Users, Headphones } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const premiumFeatures = [
  {
    icon: Video,
    title: "Video Consultations",
    description: "Face-to-face sessions with verified professionals",
    revenue: "Commission-based",
  },
  {
    icon: Shield,
    title: "Crisis Support",
    description: "24/7 emergency emotional support hotline",
    revenue: "Premium subscription",
  },
  {
    icon: Clock,
    title: "Scheduled Sessions",
    description: "Book recurring appointments with your support person",
    revenue: "Booking fees",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Advanced mood analytics and improvement insights",
    revenue: "Premium feature",
  },
  {
    icon: Users,
    title: "Group Therapy",
    description: "Join specialized support groups with professional moderation",
    revenue: "Group session fees",
  },
  {
    icon: Headphones,
    title: "AI Companion",
    description: "24/7 AI-powered emotional support between human sessions",
    revenue: "AI usage fees",
  },
]

export function PremiumFeatures() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Premium Features</h2>
          <p className="text-xl text-muted-foreground">Advanced tools to enhance your emotional wellbeing journey</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {premiumFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                  {feature.revenue}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
