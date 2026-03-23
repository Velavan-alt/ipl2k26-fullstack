import { Link } from "react-router-dom";
import { Trophy, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import MatchCard from "@/components/MatchCard";
import { matches } from "@/data/mockData";
import cricketBg from "@/assets/ipl-bg.webp";

const Index = () => {
  const liveMatches = matches.filter((m) => m.status === "live");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={cricketBg} alt="IPL 2026" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        </div>
        <div className="relative z-10 text-center px-4 w-full max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 gradient-gold rounded-full px-4 py-1.5 mb-6">
            <Zap size={14} className="text-primary-foreground" />
            <span className="font-display text-xs text-primary-foreground tracking-widest font-bold">LIVE IPL BETTING</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-foreground leading-tight mb-4">
            BET ON <span className="text-gradient-gold">IPL</span><br />2K26
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl mx-auto px-2">
            Real-time IPL odds, live scorecards, and instant payouts. Experience the thrill of IPL 2026 betting.
          </p>
          {/* Single CTA — no Admin button */}
          <div className="flex items-center justify-center">
            <Link to="/auth/user">
              <Button className="gradient-gold text-primary-foreground font-display font-bold tracking-wider px-8 py-6 text-base">
                START BETTING <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Matches */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <span className="w-3 h-3 rounded-full bg-live live-pulse shrink-0" />
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-wider text-foreground">LIVE MATCHES</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {liveMatches.length === 0 ? (
            <div className="sm:col-span-2 glass-card rounded-lg p-8 text-center">
              <Trophy size={40} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-display">No live matches right now. Check back soon!</p>
            </div>
          ) : (
            liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} showOdds={false} />
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 sm:py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">© 2026 IPL2K26. For entertainment purposes only.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
