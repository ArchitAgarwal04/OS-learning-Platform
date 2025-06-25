
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, Calendar, CreditCard, Gift, Video, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { DatabaseService } from "@/lib/database"
import { StripePayment } from "./stripe-payment"

export function SubscriptionDashboard() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<any>(null)
  const [adProgress, setAdProgress] = useState({ ads_watched: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadSubscriptionData()
    }
  }, [user])

  const loadSubscriptionData = async () => {
    if (!user) return

    try {
      const [subData, adData] = await Promise.all([
        DatabaseService.getUserSubscription(user.id),
        DatabaseService.getAdProgress(user.id)
      ])
      
      setSubscription(subData)
      setAdProgress(adData)
    } catch (error) {
      console.error('Failed to load subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading subscription status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isActive = subscription?.is_active
  const daysLeft = subscription?.expires_at 
    ? Math.ceil((new Date(subscription.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  if (isActive) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-green-700 dark:text-green-300">Premium Active</CardTitle>
          <CardDescription>
            You have full access to all premium features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-semibold">Plan Type</div>
              <div className="text-sm text-muted-foreground">
                {subscription.plan_type === 'monthly' ? 'Monthly Premium' : 'Bonus Premium'}
              </div>
            </div>
            <Badge className="bg-green-500 text-white">
              {subscription.plan_type}
            </Badge>
          </div>

          <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-semibold">Payment Method</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                {subscription.payment_method === 'stripe' && <CreditCard className="h-4 w-4" />}
                {subscription.payment_method === 'referral' && <Gift className="h-4 w-4" />}
                {subscription.payment_method === 'ads' && <Video className="h-4 w-4" />}
                {subscription.payment_method === 'stripe' && 'Stripe Payment'}
                {subscription.payment_method === 'referral' && 'Referral Coupon'}
                {subscription.payment_method === 'ads' && 'Ad Completion'}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-semibold">Expires</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(subscription.expires_at).toLocaleDateString()}
              </div>
            </div>
            <Badge variant={daysLeft <= 7 ? "destructive" : "secondary"}>
              {daysLeft} days left
            </Badge>
          </div>

          {daysLeft <= 7 && (
            <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
              <Calendar className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-orange-700 dark:text-orange-300">
                Your premium subscription expires in {daysLeft} days. Renew now to continue enjoying premium features.
              </AlertDescription>
            </Alert>
          )}

          {daysLeft <= 7 && (
            <Button 
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              onClick={loadSubscriptionData}
            >
              Renew Subscription
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Free Plan</CardTitle>
          <CardDescription>
            Upgrade to premium for unlimited access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="text-sm text-muted-foreground">
              Limited features • Basic visualizations
            </div>
          </div>
          
          {adProgress.ads_watched > 0 && (
            <Alert className="mb-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
              <Video className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Progress: {adProgress.ads_watched}/5 ads watched
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <StripePayment />
    </div>
  )
}
