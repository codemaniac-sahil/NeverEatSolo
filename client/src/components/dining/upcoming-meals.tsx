import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MessageSquare, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

export default function UpcomingMeals() {
  const { user } = useAuth();
  const [showAll, setShowAll] = useState(false);

  // Fetch upcoming meals
  const { data: upcomingMeals = [], isLoading } = useQuery({
    queryKey: ["/api/meals/upcoming"],
    enabled: !!user
  });

  const displayMeals = showAll ? upcomingMeals : upcomingMeals.slice(0, 2);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Format date/time for display
  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    const isToday = new Date().toDateString() === date.toDateString();
    const isTomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() === date.toDateString();
    
    let dateLabel = format(date, "MMM d");
    if (isToday) dateLabel = "Today";
    if (isTomorrow) dateLabel = "Tomorrow";
    
    return `${dateLabel}, ${timeStr}`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl">Upcoming Meals</h2>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((_, i) => (
              <div key={i} className="h-32 bg-neutral-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : upcomingMeals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-neutral-600">You have no upcoming meals.</p>
            <p className="text-sm text-neutral-500 mt-2">Invite someone to dine with you!</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayMeals.map((meal: any) => (
                <div key={meal.id} className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-neutral-800">
                        {meal.date && meal.time ? `Meal with ${meal.partner.name.split(' ')[0]}` : 'Scheduled Meal'}
                      </h3>
                      <p className="text-xs text-neutral-600 mt-1">
                        {meal.restaurant?.name || 'Restaurant'} • {meal.restaurant?.cuisine || 'Cuisine'}
                      </p>
                    </div>
                    <Badge 
                      variant="outline"
                      className={
                        new Date(meal.date) <= new Date() 
                          ? "bg-primary text-white border-primary" 
                          : "bg-neutral-200 text-neutral-700 border-neutral-300"
                      }
                    >
                      {meal.date && meal.time ? formatDateTime(meal.date, meal.time) : 'Scheduled'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Avatar className="w-8 h-8 border border-neutral-200">
                      <AvatarImage src={meal.partner?.profileImage} alt={meal.partner?.name} />
                      <AvatarFallback>{meal.partner ? getInitials(meal.partner.name) : '?'}</AvatarFallback>
                    </Avatar>
                    
                    <div className="text-sm">
                      <span className="font-medium text-neutral-800">{meal.partner?.name || 'Partner'}</span>
                      <div className="flex items-center text-xs text-neutral-600">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        <span>Verified User</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="flex-1 gap-1"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1"
                    >
                      <MapPin className="h-4 w-4" />
                      Directions
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {upcomingMeals.length > 2 && (
              <Button
                variant="ghost"
                className="w-full mt-3"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show less" : `Show ${upcomingMeals.length - 2} more`}
              </Button>
            )}
            
            <div className="mt-4">
              <Button className="w-full border border-primary text-primary hover:bg-primary hover:text-white">
                Schedule a New Meal
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
