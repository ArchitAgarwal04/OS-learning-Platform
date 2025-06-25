'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  CreditCard, 
  Gift, 
  Video, 
  Check, 
  Star, 
  Crown, 
  Zap,
  ArrowLeft,
  Play,
  Volume2,
  VolumeX,
  Clock,
  Trophy,
  Sparkles
} from "lucide-react"
import { DatabaseService } from "@/lib/database"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PaymentPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [adProgress, setAdProgress] = useState(0)
  const [currentAd, setCurrentAd] = useState(0)
  const [isWatchingAd, setIsWatchingAd] = useState(false)
  const [adTimer, setAdTimer] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)

  // Mock ads data
  const adsData = [
    {
      id: 1,
      title: "Learn Programming with CodeAcademy",
      description: "Master coding skills with interactive lessons",
      duration: 30,
      thumbnail: "https://via.placeholder.com/400x225?text=CodeAcademy+Ad"
    },
    {
      id: 2,
      title: "Cloud Computing with AWS",
      description: "Build scalable applications in the cloud",
      duration: 30,
      thumbnail: "https://via.placeholder.com/400x225?text=AWS+Ad"
    },
    {
      id: 3,
      title: "Design Tools for Developers",
      description: "Create beautiful interfaces with modern tools",
      duration: 30,
      thumbnail: "https://via.placeholder.com/400x225?text=Design+Tools"
    },
    {
      id: 4,
      title: "Data Science Bootcamp",
      description: "Analyze data and build ML models",
      duration: 30,
      thumbnail: "https://via.placeholder.com/400x225?text=Data+Science"
    },
    {
      id: 5,
      title: "DevOps Engineering Course",
      description: "Automate deployments and infrastructure",
      duration: 30,
      thumbnail: "https://via.placeholder.com/400x225?text=DevOps"
    }
  ]

  useEffect(() => {
    if (user) {
      loadUserData()
    } else {
      // Redirect to login if not authenticated
      router.push('/auth/login')
    }
  }, [user, router])

  useEffect(() => {
    // Security: Add rate limiting for payment attempts
    const paymentAttempts = localStorage.getItem('payment_attempts')
    const lastAttempt = localStorage.getItem('last_payment_attempt')

    if (paymentAttempts && lastAttempt) {
      const attempts = parseInt(paymentAttempts)
      const timeDiff = Date.now() - parseInt(lastAttempt)

      // Reset attempts after 1 hour
      if (timeDiff > 3600000) {
        localStorage.removeItem('payment_attempts')
        localStorage.removeItem('last_payment_attempt')
      } else if (attempts >= 5) {
        toast.error('Too many payment attempts. Please try again later.')
        router.push('/dashboard')
      }
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isWatchingAd && adTimer > 0) {
      interval = setInterval(() => {
        setAdTimer(prev => {
          if (prev <= 1) {
            handleAdComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isWatchingAd, adTimer])

  const loadUserData = async () => {
    if (!user) return

    try {
      const [subData, adData] = await Promise.all([
        DatabaseService.getUserSubscription(user.id),
        DatabaseService.getAdProgress(user.id)
      ])

      setSubscription(subData)
      setAdProgress(adData?.ads_watched || 0)
    } catch (error) {
      console.error('Failed to load user data:', error)
    }
  }

  const handleStripePayment = async () => {
    if (!user) {
      toast.error('Please log in to continue')
      router.push('/auth/login')
      return
    }

    // Track payment attempts for security
    const attempts = parseInt(localStorage.getItem('payment_attempts') || '0')
    if (attempts >= 5) {
      toast.error('Too many payment attempts. Please try again later.')
      return
    }

    setIsLoading(true)
    try {
      // Update payment attempt tracking
      localStorage.setItem('payment_attempts', (attempts + 1).toString())
      localStorage.setItem('last_payment_attempt', Date.now().toString())

      // In a real app, you'd call your backend to create a Stripe checkout session
      // For demo purposes, we'll simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 2000))

      await DatabaseService.createSubscription(user.id, 'monthly', 'stripe')

      // Clear payment attempts on success
      localStorage.removeItem('payment_attempts')
      localStorage.removeItem('last_payment_attempt')

      toast.success('Payment successful! Premium access activated.')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Payment failed. Please try again.')
      console.error('Payment error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCouponRedeem = async () => {
    if (!user) {
      toast.error('Please log in to continue')
      router.push('/auth/login')
      return
    }

    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }

    // Basic validation for coupon format
    if (couponCode.trim().length < 4) {
      toast.error('Invalid coupon code format')
      return
    }

    setIsLoading(true)
    try {
      await DatabaseService.redeemReferralCoupon(user.id, couponCode.trim().toUpperCase())
      toast.success('Coupon redeemed successfully! Premium access activated.')
      setCouponCode('')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Invalid or expired coupon code.')
      console.error('Coupon redemption error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWatchAd = (adIndex: number) => {
    setCurrentAd(adIndex)
    setIsWatchingAd(true)
    setAdTimer(adsData[adIndex].duration)
  }

  const handleAdComplete = async () => {
    setIsWatchingAd(false)
    const newProgress = Math.min(adProgress + 1, 5)
    setAdProgress(newProgress)

    try {
      await DatabaseService.updateAdProgress(user!.id, newProgress)

      if (newProgress >= 5) {
        toast.success('Congratulations! You\'ve unlocked premium access!')
        router.push('/dashboard')
      } else {
        toast.success(`Ad completed! ${5 - newProgress} more to unlock premium access.`)
      }
    } catch (error) {
      toast.error('Failed to update progress.')
    }
  }

  const handleSkipAd = () => {
    setIsWatchingAd(false)
    setAdTimer(0)
  }

  if (!user) {
    return null
  }

  // If user already has active subscription, redirect
  if (subscription?.is_active) {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Unlock Premium Access</h1>
            <p className="text-gray-300">Choose your preferred method to access premium features</p>
          </div>
          <div></div>
        </div>

        {/* Ad Watching Modal */}
        {isWatchingAd && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
            <div className="relative w-full max-w-4xl mx-4">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">{adsData[currentAd].title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {adsData[currentAd].description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-white font-mono">
                      {Math.floor(adTimer / 60)}:{(adTimer % 60).toString().padStart(2, '0')}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white border-white/20"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    {adTimer <= 5 && (
                      <Button
                        onClick={handleSkipAd}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Skip Ad
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-4">
                    <img 
                      src={adsData[currentAd].thumbnail} 
                      alt={adsData[currentAd].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <Progress value={((adsData[currentAd].duration - adTimer) / adsData[currentAd].duration) * 100} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <Tabs defaultValue="payment" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 border-white/20">
            <TabsTrigger value="payment" className="text-white data-[state=active]:bg-white/20">
              <CreditCard className="h-4 w-4 mr-2" />
              Stripe Payment
            </TabsTrigger>
            <TabsTrigger value="coupon" className="text-white data-[state=active]:bg-white/20">
              <Gift className="h-4 w-4 mr-2" />
              Coupon Code
            </TabsTrigger>
            <TabsTrigger value="ads" className="text-white data-[state=active]:bg-white/20">
              <Video className="h-4 w-4 mr-2" />
              Watch Ads
            </TabsTrigger>
          </TabsList>

          {/* Stripe Payment Tab */}
          <TabsContent value="payment">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Crown className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Premium Monthly</CardTitle>
                <CardDescription className="text-gray-300">
                  Unlock all features with unlimited access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-white mb-2">$10</div>
                  <div className="text-gray-300">per month</div>
                </div>

                <div className="grid gap-4">
                  {[
                    "Unlimited algorithm visualizations",
                    "Advanced performance analytics",
                    "Priority customer support",
                    "Export learning progress",
                    "Ad-free experience",
                    "Exclusive premium content"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-white">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleStripePayment}
                  disabled={isLoading}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 text-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Pay with Stripe
                    </div>
                  )}
                </Button>

                <div className="text-center text-sm text-gray-400">
                  Secure payment powered by Stripe • Cancel anytime
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coupon Code Tab */}
          <TabsContent value="coupon">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <Gift className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Referral Coupon</CardTitle>
                <CardDescription className="text-gray-300">
                  Have a referral code? Get premium access for free!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="coupon" className="text-white text-lg">Coupon Code</Label>
                  <Input
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter your referral coupon code"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg py-3"
                  />
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-medium mb-1">How to get a coupon?</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Refer friends and earn coupon codes</li>
                        <li>• Participate in community events</li>
                        <li>• Follow our social media for giveaways</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCouponRedeem}
                  disabled={isLoading || !couponCode.trim()}
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 text-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Validating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      Redeem Coupon
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Watch Ads Tab */}
          <TabsContent value="ads">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4">
                  <Video className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Watch Ads for Free Access</CardTitle>
                <CardDescription className="text-gray-300">
                  Watch 5 short ads to unlock premium features for one month
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{adProgress}/5</div>
                  <div className="text-gray-300">Ads completed</div>
                  <Progress value={(adProgress / 5) * 100} className="mt-4" />
                </div>

                {adProgress < 5 ? (
                  <div className="grid gap-4">
                    <h3 className="text-white font-semibold text-lg">Available Ads</h3>
                    {adsData.slice(adProgress).map((ad, index) => (
                      <div 
                        key={ad.id}
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                      >
                        <img 
                          src={ad.thumbnail} 
                          alt={ad.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{ad.title}</h4>
                          <p className="text-gray-400 text-sm">{ad.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-400 text-xs">{ad.duration}s</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleWatchAd(adProgress + index)}
                          disabled={index > 0}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Watch
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-white text-xl font-semibold mb-2">All Done!</h3>
                    <p className="text-gray-300 mb-4">You've completed all ads and unlocked premium access!</p>
                    <Button
                      onClick={() => router.push('/dashboard')}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                )}

                {adProgress > 0 && adProgress < 5 && (
                  <Alert className="border-orange-500/20 bg-orange-500/10">
                    <Video className="h-4 w-4 text-orange-400" />
                    <AlertDescription className="text-orange-200">
                      Great progress! You're {5 - adProgress} ads away from unlocking premium access.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}