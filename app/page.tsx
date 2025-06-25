import Hero from "@/components/hero"
import FeatureSection from "@/components/feature-section"
import { PageReplacementPreview } from "@/components/page-replacement-preview"
import { CPUSchedulingPreview } from "@/components/cpu-scheduling-preview"
import { DiskSchedulingPreview } from "@/components/disk-scheduling-preview"
import NotesPreview from "@/components/notes-preview"
import { AlgorithmComparison } from "@/components/algorithm-comparison"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, Crown, Check, CreditCard, Gift, Video, Shield, Lock } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <FeatureSection />

      <section className="py-16 px-4 md:px-6 lg:px-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              <span>Interactive Learning</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text">
              Featured Visualizations
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              Explore our interactive visualizations to understand complex OS concepts
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <PageReplacementPreview />
            <CPUSchedulingPreview />
            <DiskSchedulingPreview />
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link href="/comparison" className="flex items-center">
                Compare All Algorithms
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <AlgorithmComparison />
        </div>
      </section>

      <NotesPreview />

      {/* Payment Plans Section - COMMENTED OUT FOR TESTING */}
      {/* {
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="flex flex-col items-center space-y-4 text-center mb-16">
            <div className="inline-flex items-center justify-center rounded-full bg-white/10 px-3 py-1 text-sm text-white">
              <Crown className="h-3.5 w-3.5 mr-1" />
              <span>Premium Access</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
              Choose Your Learning Path
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl/relaxed">
              Unlock unlimited access to advanced features and premium content
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            <Card className="bg-white/5 backdrop-blur-lg border-white/20 text-white relative">
              <CardHeader className="text-center">
                <Badge variant="outline" className="w-fit mx-auto mb-4 border-gray-400 text-gray-300">
                  Free
                </Badge>
                <CardTitle className="text-2xl">Basic Access</CardTitle>
                <CardDescription className="text-gray-300">
                  Perfect for getting started
                </CardDescription>
                <div className="text-4xl font-bold mt-4">$0</div>
                <div className="text-gray-400">forever</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Basic algorithm visualizations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Limited notes access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Community support</span>
                  </li>
                  <li className="flex items-center gap-2 opacity-50">
                    <span className="h-4 w-4 text-gray-500">✕</span>
                    <span className="text-sm text-gray-500">Advanced analytics</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10" asChild>
                  <Link href="/auth/signup">
                    Get Started Free
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-blue-600/20 to-purple-600/20 backdrop-blur-lg border-blue-400/50 text-white relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center">
                <Badge variant="outline" className="w-fit mx-auto mb-4 border-blue-400 text-blue-300">
                  Premium
                </Badge>
                <CardTitle className="text-2xl">Monthly Access</CardTitle>
                <CardDescription className="text-gray-300">
                  Full access to all features
                </CardDescription>
                <div className="text-4xl font-bold mt-4">$10</div>
                <div className="text-gray-400">per month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Unlimited algorithm visualizations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Complete notes library</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Advanced performance analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Export learning progress</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
                  <Link href="/payment">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Start Premium
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-lg border-white/20 text-white">
              <CardHeader className="text-center">
                <Badge variant="outline" className="w-fit mx-auto mb-4 border-green-400 text-green-300">
                  Alternative
                </Badge>
                <CardTitle className="text-2xl">Free Premium</CardTitle>
                <CardDescription className="text-gray-300">
                  Earn premium access for free
                </CardDescription>
                <div className="text-2xl font-bold mt-4">Free*</div>
                <div className="text-gray-400">with conditions</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <Gift className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Use referral coupon</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Video className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">Watch 5 advertisements</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li>• Same features as Premium Monthly</li>
                  <li>• Valid for 30 days</li>
                  <li>• Can be renewed</li>
                </ul>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10" asChild>
                  <Link href="/payment">
                    Explore Options
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm text-white mb-6">
              <Shield className="h-4 w-4 mr-2" />
              <span>Secure & Trusted</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Lock className="h-6 w-6 text-blue-400" />
                </div>
                <span className="text-sm text-gray-300">SSL Encrypted</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-green-400" />
                </div>
                <span className="text-sm text-gray-300">Stripe Secure</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
                <span className="text-sm text-gray-300">Privacy Protected</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-400" />
                </div>
                <span className="text-sm text-gray-300">Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  )
}
