
'use client'

import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Gift, Video, Check, Star } from "lucide-react"
import { DatabaseService } from "@/lib/database"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function StripePayment() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [adProgress, setAdProgress] = useState(0)
  const [showCouponInput, setShowCouponInput] = useState(false)

  const handleStripePayment = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // In a real app, you'd call your backend to create a Stripe checkout session
      // For demo purposes, we'll simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      await DatabaseService.createSubscription(user.id, 'monthly', 'stripe')
      toast.success('Payment successful! Premium access activated.')
    } catch (error) {
      toast.error('Payment failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCouponRedeem = async () => {
    if (!user || !couponCode.trim()) return

    setIsLoading(true)
    try {
      await DatabaseService.redeemReferralCoupon(user.id, couponCode.trim())
      toast.success('Coupon redeemed successfully! Premium access activated.')
      setCouponCode('')
      setShowCouponInput(false)
    } catch (error) {
      toast.error('Invalid or expired coupon code.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWatchAd = async () => {
    if (!user) return

    // Simulate watching an ad
    const newProgress = Math.min(adProgress + 1, 5)
    setAdProgress(newProgress)
    
    try {
      await DatabaseService.updateAdProgress(user.id, newProgress)
      
      if (newProgress >= 5) {
        toast.success('Congratulations! You\'ve unlocked premium access by watching 5 ads!')
      } else {
        toast.success(`Ad watched! ${5 - newProgress} more to unlock premium access.`)
      }
    } catch (error) {
      toast.error('Failed to update ad progress.')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-200 dark:border-blue-800">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Premium Access</CardTitle>
          <CardDescription>
            Unlock advanced features and unlimited access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">$10</div>
            <div className="text-sm text-muted-foreground">per month</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Unlimited algorithm visualizations</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Advanced performance analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Priority customer support</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Export learning progress</span>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => window.location.href = '/payment'}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Go to Payment Page
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Gift className="h-4 w-4 text-green-500" />
                    Referral Coupon
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!showCouponInput ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowCouponInput(true)}
                      className="w-full border-green-500 text-green-600 hover:bg-green-50"
                    >
                      Use Coupon Code
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="coupon">Coupon Code</Label>
                      <Input
                        id="coupon"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCouponRedeem}
                          disabled={isLoading || !couponCode.trim()}
                          size="sm"
                          className="flex-1"
                        >
                          Redeem
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowCouponInput(false)}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Video className="h-4 w-4 text-orange-500" />
                    Watch Ads
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{adProgress}/5</div>
                    <div className="text-xs text-muted-foreground">Ads watched</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(adProgress / 5) * 100}%` }}
                    ></div>
                  </div>
                  <Button
                    onClick={handleWatchAd}
                    disabled={adProgress >= 5}
                    variant="outline"
                    className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    {adProgress >= 5 ? 'Completed!' : 'Watch Ad'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {adProgress > 0 && adProgress < 5 && (
        <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
          <Video className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            You've watched {adProgress} out of 5 ads. Watch {5 - adProgress} more to unlock premium access!
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
