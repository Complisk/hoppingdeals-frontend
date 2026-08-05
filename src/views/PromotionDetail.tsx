"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from 'framer-motion';
import { MapPin, Clock, Calendar, ArrowLeft, Share2, QrCode } from 'lucide-react';
import { format, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { promotions, categories } from '@/data/mockData';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import Seo from "@/components/seo/Seo";
import { SITE_URL } from "@/lib/seo";

const PromotionDetail = () => {
  const { id } = useParams();
  const promotion = promotions.find(p => p.id === id);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!promotion) return;

    const updateCountdown = () => {
      const end = new Date(promotion.endDate);
      const now = new Date();
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [promotion]);

  if (!promotion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Promotion Not Found</h1>
          <Button asChild>
            <Link href="/">Go Back Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const category = categories.find(c => c.id === promotion.category);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Seo
        title={promotion.title}
        description={promotion.description}
        pathname={`/promotion/${promotion.id}`}
        image={promotion.bannerImage}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Offer",
          name: promotion.title,
          description: promotion.description,
          url: `${SITE_URL}/promotion/${promotion.id}`,
          image: `${SITE_URL}${promotion.bannerImage}`,
          seller: {
            "@type": "Organization",
            name: promotion.businessName,
          },
          areaServed: `${promotion.city}, ${promotion.state}`,
          availabilityStarts: promotion.startDate,
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "USD",
            price: "0",
          },
        }}
      />
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Promotions
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Banner & Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Banner Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={promotion.bannerImage}
                  alt={promotion.title}
                  className="w-full h-64 md:h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                
                <Badge
                  className="absolute top-4 left-4"
                  style={{ backgroundColor: category?.color, color: '#fff' }}
                >
                  {category?.icon} {category?.name}
                </Badge>

                <Badge
                  variant={promotion.status === 'active' ? 'default' : 'secondary'}
                  className="absolute top-4 right-4"
                >
                  {promotion.status === 'active' ? '🔴 Live Now' : '📅 Scheduled'}
                </Badge>
              </div>

              {/* Promotion Info */}
              <div className="mt-6 space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {promotion.title}
                </h1>
                
                <p className="text-lg text-muted-foreground">
                  {promotion.description}
                </p>

                <div className="flex items-center gap-2 text-foreground">
                  <span className="font-semibold">By:</span>
                  <span>{promotion.businessName}</span>
                </div>

                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{promotion.city}, {promotion.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>
                      {format(new Date(promotion.startDate), 'MMM d')} - {format(new Date(promotion.endDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="accent" size="lg" className="flex-1">
                    <Share2 className="h-5 w-5 mr-2" />
                    Share Promotion
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Countdown & QR */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Countdown Timer */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Time Remaining</h3>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Days', value: countdown.days },
                    { label: 'Hours', value: countdown.hours },
                    { label: 'Minutes', value: countdown.minutes },
                    { label: 'Seconds', value: countdown.seconds },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <div className="bg-primary/10 rounded-xl py-4 px-2">
                        <span className="text-3xl md:text-4xl font-bold text-primary">
                          {item.value.toString().padStart(2, '0')}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground mt-2 block">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <QrCode className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Scan to Redeem</h3>
                </div>
                
                <div className="flex justify-center">
                  <div className="bg-card p-4 rounded-xl border border-border">
                    {/* Mock QR Code */}
                    <div className="w-48 h-48 bg-foreground rounded-lg relative overflow-hidden">
                      <div className="absolute inset-2 grid grid-cols-8 gap-0.5">
                        {[...Array(64)].map((_, i) => (
                          <div
                            key={i}
                            className={`${Math.random() > 0.5 ? 'bg-card' : 'bg-foreground'}`}
                          />
                        ))}
                      </div>
                      {/* Corner squares */}
                      <div className="absolute top-2 left-2 w-8 h-8 border-4 border-card rounded-sm" />
                      <div className="absolute top-2 right-2 w-8 h-8 border-4 border-card rounded-sm" />
                      <div className="absolute bottom-2 left-2 w-8 h-8 border-4 border-card rounded-sm" />
                    </div>
                  </div>
                </div>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Show this QR code at the business to redeem your offer
                </p>
              </div>

              {/* Active Time Window */}
              <div className="bg-secondary/50 rounded-2xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-3">Active Time Window</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Starts:</span>
                    <span className="text-foreground font-medium">
                      {format(new Date(promotion.startDate), 'MMMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ends:</span>
                    <span className="text-foreground font-medium">
                      {format(new Date(promotion.endDate), 'MMMM d, yyyy h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PromotionDetail;
