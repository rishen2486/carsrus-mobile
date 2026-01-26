import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, Star, Trophy, Crown, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";

interface LoyaltyTier {
  name: string;
  icon: React.ReactNode;
  minPoints: number;
  maxPoints: number;
  color: string;
  benefits: string[];
}

const loyaltyTiers: LoyaltyTier[] = [
  {
    name: "Bronze",
    icon: <Star className="h-6 w-6" />,
    minPoints: 0,
    maxPoints: 499,
    color: "text-amber-600",
    benefits: [
      "5% discount on car rentals",
      "Early access to promotions",
      "Birthday bonus points",
    ],
  },
  {
    name: "Silver",
    icon: <Trophy className="h-6 w-6" />,
    minPoints: 500,
    maxPoints: 1499,
    color: "text-slate-400",
    benefits: [
      "10% discount on car rentals",
      "Free GPS on rentals",
      "Priority customer support",
      "Exclusive member deals",
    ],
  },
  {
    name: "Gold",
    icon: <Crown className="h-6 w-6" />,
    minPoints: 1500,
    maxPoints: 4999,
    color: "text-yellow-500",
    benefits: [
      "15% discount on all bookings",
      "Free vehicle upgrade (when available)",
      "Complimentary airport pickup",
      "24/7 VIP support line",
      "Double points weekends",
    ],
  },
  {
    name: "Platinum",
    icon: <Sparkles className="h-6 w-6" />,
    minPoints: 5000,
    maxPoints: Infinity,
    color: "text-purple-500",
    benefits: [
      "20% discount on everything",
      "Guaranteed vehicle upgrade",
      "Free additional driver",
      "Flexible cancellation",
      "Exclusive event invitations",
      "Personal account manager",
    ],
  },
];

const rewards = [
  {
    id: 1,
    name: "Free Day Rental",
    points: 500,
    description: "Redeem for one free day of car rental",
    icon: "🚗",
  },
  {
    id: 2,
    name: "GPS Navigation",
    points: 100,
    description: "Free GPS for your next rental",
    icon: "🗺️",
  },
  {
    id: 3,
    name: "Premium Upgrade",
    points: 300,
    description: "Upgrade to a premium vehicle",
    icon: "⭐",
  },
  {
    id: 4,
    name: "Airport Transfer",
    points: 200,
    description: "Complimentary airport pickup or drop-off",
    icon: "✈️",
  },
  {
    id: 5,
    name: "Full Tank",
    points: 150,
    description: "Start your journey with a full tank",
    icon: "⛽",
  },
  {
    id: 6,
    name: "Tour Discount",
    points: 250,
    description: "25% off any guided tour",
    icon: "🏝️",
  },
];

export default function LoyaltyRewards() {
  const [userPoints, setUserPoints] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/login");
        return;
      }

      // Fetch user's bookings count to calculate points
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("id, total_amount")
        .eq("user_id", session.user.id);

      if (error) throw error;

      // Calculate points: 1 point per Rs 100 spent
      const totalSpent = bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
      const points = Math.floor(totalSpent / 100);
      
      setUserPoints(points);
      setBookingsCount(bookings?.length || 0);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTier = () => {
    return loyaltyTiers.find(
      (tier) => userPoints >= tier.minPoints && userPoints <= tier.maxPoints
    ) || loyaltyTiers[0];
  };

  const getNextTier = () => {
    const currentTierIndex = loyaltyTiers.findIndex(
      (tier) => userPoints >= tier.minPoints && userPoints <= tier.maxPoints
    );
    return loyaltyTiers[currentTierIndex + 1] || null;
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const progressToNextTier = nextTier
    ? ((userPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="space-y-8">
          {/* Current Status */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-16 w-16 rounded-full bg-background flex items-center justify-center ${currentTier.color}`}>
                    {currentTier.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{currentTier.name} Member</h2>
                    <p className="text-muted-foreground">
                      {bookingsCount} bookings completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{userPoints}</div>
                  <div className="text-sm text-muted-foreground">Points</div>
                </div>
              </div>

              {nextTier && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>{currentTier.name}</span>
                    <span>{nextTier.name}</span>
                  </div>
                  <Progress value={progressToNextTier} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {nextTier.minPoints - userPoints} points to {nextTier.name}
                  </p>
                </div>
              )}
            </div>

            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Your {currentTier.name} Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentTier.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Loyalty Tiers */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Loyalty Tiers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loyaltyTiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={`relative ${
                    tier.name === currentTier.name
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                >
                  {tier.name === currentTier.name && (
                    <Badge className="absolute -top-2 -right-2">Current</Badge>
                  )}
                  <CardHeader className="pb-2">
                    <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center ${tier.color}`}>
                      {tier.icon}
                    </div>
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <CardDescription>
                      {tier.maxPoints === Infinity
                        ? `${tier.minPoints}+ points`
                        : `${tier.minPoints} - ${tier.maxPoints} points`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs space-y-1">
                      {tier.benefits.slice(0, 3).map((benefit, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                      {tier.benefits.length > 3 && (
                        <li className="text-muted-foreground">
                          +{tier.benefits.length - 3} more benefits
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Available Rewards */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Redeem Rewards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <Card key={reward.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{reward.icon}</span>
                      <Badge variant={userPoints >= reward.points ? "default" : "secondary"}>
                        {reward.points} pts
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{reward.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {reward.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      size="sm"
                      className="w-full"
                      variant={userPoints >= reward.points ? "premium" : "outline"}
                      disabled={userPoints < reward.points}
                    >
                      {userPoints >= reward.points ? "Redeem" : "Not Enough Points"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* How to Earn Points */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                How to Earn Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl mb-2">🚗</div>
                  <h4 className="font-medium">Book a Car</h4>
                  <p className="text-sm text-muted-foreground">
                    Earn 1 point for every Rs 100 spent
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl mb-2">🏝️</div>
                  <h4 className="font-medium">Book a Tour</h4>
                  <p className="text-sm text-muted-foreground">
                    Earn 2x points on guided tours
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl mb-2">👥</div>
                  <h4 className="font-medium">Refer a Friend</h4>
                  <p className="text-sm text-muted-foreground">
                    Get 100 bonus points per referral
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
