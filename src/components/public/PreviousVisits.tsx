"use client";
import { motion } from 'framer-motion';
import { previousVisits } from '@/data/mockData';
import { Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import Link from "next/link";

const PreviousVisits = () => {
  return (
    <section className="py-12 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Your Previous Visits
          </h2>
          <Link href="/" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {previousVisits.map((visit, index) => (
            <motion.div
              key={visit.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/promotion/${visit.promotionId}`}>
                <div className="p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {visit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {visit.businessName}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Visited {format(new Date(visit.visitedAt), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PreviousVisits;
