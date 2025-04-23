import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import food imagery assets
import foodImage1 from "@/assets/food-image1.png";
import foodImage2 from "@/assets/food-image2.png";
import diningCouple1 from "@/assets/dining-couple1.png";
import diningCouple2 from "@/assets/dining-couple2.png";
import diningCouple3 from "@/assets/dining-couple3.png";
import diningFriends1 from "@/assets/dining-friends1.png";
import diningFriends2 from "@/assets/dining-friends2.png";
import diningFriends3 from "@/assets/dining-friends3.png";
import colleaguesDining1 from "@/assets/colleagues-dining1.png"; 
import colleaguesDining2 from "@/assets/colleagues-dining2.png";

interface HeroImage {
  url: string;
  alt: string;
  title: string;
  subtitle: string;
}

const heroImages: HeroImage[] = [
  {
    url: foodImage1,
    alt: "Sushi dish with chopsticks",
    title: "Discover Culinary Connections",
    subtitle: "Find your perfect dining companion and explore new flavors together"
  },
  {
    url: diningCouple1,
    alt: "Couple enjoying dinner together",
    title: "Create Lasting Memories",
    subtitle: "Share intimate dining experiences with compatible companions"
  },
  {
    url: foodImage2,
    alt: "Modern restaurant interior",
    title: "Explore Fine Dining",
    subtitle: "Connect over amazing food in beautiful settings around the city"
  },
  {
    url: diningCouple2,
    alt: "Elegant couple dining with gourmet food",
    title: "Elevate Your Dining Experience",
    subtitle: "Meet people who share your appreciation for culinary excellence"
  },
  {
    url: diningCouple3,
    alt: "Couple sharing tapas and appetizers",
    title: "Taste New Cuisines Together",
    subtitle: "Expand your palate with like-minded food enthusiasts"
  },
  {
    url: diningFriends1,
    alt: "Two friends enjoying pizza",
    title: "Connect With New Friends",
    subtitle: "Turn solo meals into social adventures with interesting companions"
  },
  {
    url: diningFriends2,
    alt: "Group of friends enjoying wine and food",
    title: "Join Social Dining Circles",
    subtitle: "Build your network while enjoying delicious meals in great company"
  },
  {
    url: diningFriends3,
    alt: "Stylish friends enjoying drinks together",
    title: "Experience Vibrant Social Gatherings",
    subtitle: "Meet new people in sophisticated settings and create lasting connections"
  },
  {
    url: colleaguesDining1,
    alt: "Colleagues enjoying lunch in a restaurant",
    title: "Strengthen Workplace Connections",
    subtitle: "Build stronger team relationships by connecting over lunch with colleagues"
  },
  {
    url: colleaguesDining2,
    alt: "Professional team sharing drinks and appetizers",
    title: "Elevate Your Professional Network",
    subtitle: "Turn ordinary work meals into meaningful connections that enhance collaboration"
  }
];

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlaying]);

  // Pause auto-rotation when user interacts
  const handleManualNavigation = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    
    // Resume auto-rotation after 10 seconds of inactivity
    const timeout = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
    
    return () => clearTimeout(timeout);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? heroImages.length - 1 : currentIndex - 1;
    handleManualNavigation(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % heroImages.length;
    handleManualNavigation(newIndex);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg">
      {/* Hero Images */}
      <div className="relative w-full h-full">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white max-w-md">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{image.title}</h2>
              <p className="text-sm md:text-base opacity-90">{image.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-black/30 border-white/20 hover:bg-black/50 text-white"
          onClick={goToPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-black/30 border-white/20 hover:bg-black/50 text-white"
          onClick={goToNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Indicator Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-white w-4"
                : "bg-white/50 hover:bg-white/80"
            }`}
            onClick={() => handleManualNavigation(index)}
            aria-label={`View slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}