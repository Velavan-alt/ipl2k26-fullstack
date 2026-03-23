import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import BetSlip from "@/components/BetSlip";
import { useAuth } from "@/contexts/AuthContext";
import { apiGetMatches, apiMyBets, apiPlaceBet, apiGetBalance } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, History, TrendingUp, ArrowDownCircle, ArrowUpCircle, Send, User, Loader2, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

const TELEGRAM_URL = "https://t.me/cricbet007";

interface Match {
  id: number; title: string; team1: string; team2: string;
  team1_score: string; team2_score: string; status: string;
  odds_team1: number; odds_team2: number; odds_draw: number;
  venue: string; match_time: string; winner?: string; overs: string;
}
interface Bet {
  id: number; matchTitle: string; betOn: string; selection: string;
  amount: number; oddsAtBet: number; potentialWin: number; status: string; placedAt: string;
}

const UserPanel = () => {
  const { user, refreshBalance } = useAuth();
  const [matches, setMatches]               = useState<Match[]>([]);
  const [myBets, setMyBets]                 = useState<Bet[]>([]);
  const [balance, setBalance]               = useState(user?.walletBalance || 0);
  const [activeBet, setActiveBet]           = useState<{ match: Match; selection: string } | null>(null);
  const [loadingBet, setLoadingBet]         = useState(false);
  const [loadingData, setLoadingData]       = useState(true);
  const [showTelegramModal, setShowTelegramModal] = useState<"deposit"|"withdraw"|null>(null);

  const email       = user?.email || "";
  const displayName = user?.username ? `@${user.username}` : user?.name || "";

  const loadData = useCallback(async () => {
    try {
      const [m, b, bal] = await Promise.all([
        apiGetMatches(),
        apiMyBets(),
        apiGetBalance(),
      ]);
      setMatches(m);
      setMyBets(b);
      setBalance(bal.balance);
    } catch (e) {
      console.error("Load error:", e);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const getOdds = (match: Match, selection: string) => {
    if (selection.includes(match.team1)) return match.odds_team1;
    if (selection.includes(match.team2)) return match.odds_team2;
    return match.odds_draw;
  };

  const handlePlaceBet = async (amount: number) => {
    if (!activeBet || !user) return;
    setLoadingBet(true);
    try {
      const betOn = activeBet.selection.includes(activeBet.match.team1) ? "team1"
                  : activeBet.selection.includes(activeBet.match.team2) ? "team2" : "draw";
      await apiPlaceBet({ matchId: activeBet.match.id, betOn, amount });
      toast.success(`Bet placed on ${activeBet.selection}!`);
      setActiveBet(null);
      await loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to place bet");
    } finally {
      setLoadingBet(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">

        {/* Wallet bar */}
        <div className="glass-card rounded-xl p-3 sm:p-4 mb-5 sm:mb-8">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="gradient-gold rounded-full p-2 shrink-0"><User size={18} className="text-primary-foreground" /></div>
              <div>
                <p className="font-display font-bold text-foreground text-sm">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user?.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="font-display text-xl sm:text-2xl font-bold text-primary">₹{balance.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-4">
              <div><p className="text-xs text-muted-foreground">Active Bets</p><p className="font-display font-bold text-foreground">{myBets.filter(b=>b.status==="pending").length}</p></div>
              <div><p className="text-xs text-muted-foreground">Total Won</p><p className="font-display font-bold text-success">₹{myBets.filter(b=>b.status==="won").reduce((s,b)=>s+b.amount*b.oddsAtBet,0).toFixed(0)}</p></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={()=>setShowTelegramModal("deposit")}
                className="gradient-gold text-primary-foreground font-display font-bold text-xs gap-1 h-9 px-3 touch-manipulation">
                <ArrowDownCircle size={13}/>DEPOSIT
              </Button>
              <Button size="sm" variant="outline" onClick={()=>setShowTelegramModal("withdraw")}
                className="border-primary/40 text-primary font-display font-bold text-xs gap-1 h-9 px-3 touch-manipulation">
                <ArrowUpCircle size={13}/>WITHDRAW
              </Button>
            </div>
          </div>
        </div>

        {/* Telegram Modal */}
        {showTelegramModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
            onClick={()=>setShowTelegramModal(null)}>
            <div className="glass-card rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-sm border-primary/30 text-center pb-8"
              onClick={e=>e.stopPropagation()}>
              <div className="gradient-gold rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                <Send size={26} className="text-primary-foreground"/>
              </div>
              <h2 className="font-display text-lg font-bold text-gradient-gold tracking-wider mb-1">
                {showTelegramModal==="deposit"?"DEPOSIT FUNDS":"WITHDRAW FUNDS"}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {showTelegramModal==="deposit"?"Contact support to add funds. Processed within minutes.":"Contact support to withdraw. Processed within 24 hours."}
              </p>
              <div className="bg-secondary border border-primary/20 rounded-lg px-4 py-3 mb-4 flex items-center justify-center gap-2">
                <Send size={15} className="text-primary"/>
                <span className="font-display font-bold text-primary tracking-wider">@cricbet007</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Mention your email <span className="text-primary font-semibold">{email}</span></p>
              <div className="flex gap-2.5">
                <Button variant="outline" className="flex-1 h-11 font-display text-xs touch-manipulation"
                  onClick={()=>setShowTelegramModal(null)}>CANCEL</Button>
                <Button className="flex-1 h-11 gradient-gold text-primary-foreground font-display font-bold text-xs gap-1.5 touch-manipulation"
                  onClick={()=>{window.open(TELEGRAM_URL,"_blank");setShowTelegramModal(null);}}>
                  <Send size={13}/>OPEN TELEGRAM
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="matches">
              <TabsList className="bg-secondary mb-4 w-full sm:w-auto">
                <TabsTrigger value="matches" className="flex-1 sm:flex-none font-display tracking-wider text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <TrendingUp size={13} className="mr-1"/>MATCHES
                </TabsTrigger>
                <TabsTrigger value="mybets" className="flex-1 sm:flex-none font-display tracking-wider text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <History size={13} className="mr-1"/>MY BETS
                </TabsTrigger>
              </TabsList>

              <TabsContent value="matches" className="space-y-3 sm:space-y-4">
                {loadingData ? (
                  <div className="glass-card rounded-lg p-8 text-center">
                    <Loader2 size={24} className="animate-spin text-primary mx-auto mb-2"/>
                    <p className="text-muted-foreground text-sm font-display">Loading matches...</p>
                  </div>
                ) : matches.length === 0 ? (
                  <div className="glass-card rounded-lg p-8 text-center">
                    <p className="text-muted-foreground font-display">No matches yet. Check back soon!</p>
                  </div>
                ) : matches.map((match) => (
                  <div key={match.id} className="glass-card rounded-xl p-4 sm:p-5 transition-all hover:border-primary/30">
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                        <MapPin size={11} className="shrink-0"/>
                        <span className="truncate">{match.venue}</span>
                      </div>
                      <Badge className={
                        match.status==="live"      ? "gradient-gold text-primary-foreground text-xs" :
                        match.status==="upcoming"  ? "border-primary/40 text-primary bg-transparent text-xs" :
                        "bg-secondary text-muted-foreground text-xs"
                      }>{match.status==="live" ? "🔴 LIVE" : match.status.toUpperCase()}</Badge>
                    </div>

                    {/* Winner banner */}
                    {match.status==="completed" && match.winner && (
                      <div className="flex items-center justify-center gap-2 bg-success/10 border border-success/20 rounded-lg px-3 py-2 mb-3">
                        <span>🏆</span>
                        <span className="font-display font-bold text-success text-sm">
                          {match.winner==="team1" ? match.team1 : match.winner==="team2" ? match.team2 : "Draw"} won!
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-center flex-1 px-1">
                        <p className="font-display text-sm sm:text-base font-bold text-foreground leading-tight">{match.team1}</p>
                        <p className="text-primary font-display text-base sm:text-lg font-bold mt-0.5">{match.team1_score || "-"}</p>
                      </div>
                      <div className="px-2 shrink-0"><span className="text-muted-foreground font-display text-xs font-bold">VS</span></div>
                      <div className="text-center flex-1 px-1">
                        <p className="font-display text-sm sm:text-base font-bold text-foreground leading-tight">{match.team2}</p>
                        <p className="text-primary font-display text-base sm:text-lg font-bold mt-0.5">{match.team2_score || "-"}</p>
                      </div>
                    </div>

                    {match.status==="live" && <p className="text-center text-xs text-muted-foreground mb-3">Overs: {match.overs}</p>}
                    {match.status==="upcoming" && (
                      <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1 mb-3">
                        <Clock size={11}/>{new Date(match.match_time).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}
                      </p>
                    )}

                    {match.status !== "completed" && (
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                        {[
                          {label:match.team1, odds:match.odds_team1, sel:`${match.team1} Win`},
                          {label:"Draw",      odds:match.odds_draw,  sel:"Draw"},
                          {label:match.team2, odds:match.odds_team2, sel:`${match.team2} Win`},
                        ].map(({label,odds,sel})=>(
                          <button key={sel} onClick={()=>setActiveBet({match,selection:sel})}
                            className="bg-secondary hover:bg-secondary/70 border border-border hover:border-primary/40 rounded-lg py-2 px-1 text-center transition-all active:scale-95 touch-manipulation">
                            <span className="text-xs text-muted-foreground block truncate px-1">{label}</span>
                            <span className="text-primary font-display font-bold text-sm sm:text-base">{odds}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="mybets" className="space-y-3">
                {myBets.length === 0 ? (
                  <div className="glass-card rounded-lg p-8 text-center">
                    <p className="text-muted-foreground font-display">No bets yet. Pick a match!</p>
                  </div>
                ) : myBets.map((bet) => (
                  <div key={bet.id} className="glass-card rounded-lg p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-foreground text-sm truncate">{bet.matchTitle}</p>
                        <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-md px-2 py-0.5 mt-1.5">
                          <span className="text-xs text-muted-foreground">Bet on:</span>
                          <span className="font-display font-bold text-primary text-xs">{bet.selection?.replace(" Win","")}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Odds: {bet.oddsAtBet}x</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display font-bold text-primary">₹{bet.amount}</p>
                        <p className="text-xs text-muted-foreground">Win: ₹{bet.potentialWin}</p>
                        <Badge className={
                          bet.status==="won"  ? "bg-success/20 text-success border border-success/30 text-xs mt-1" :
                          bet.status==="lost" ? "bg-destructive/20 text-destructive border border-destructive/30 text-xs mt-1" :
                          "bg-warning/20 text-warning border border-warning/30 text-xs mt-1"
                        }>{bet.status.toUpperCase()}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-3">
            {activeBet ? (
              <BetSlip
                matchTitle={`${activeBet.match.team1} vs ${activeBet.match.team2}`}
                selection={activeBet.selection}
                odds={getOdds(activeBet.match, activeBet.selection)}
                onClose={()=>setActiveBet(null)}
                onPlaceBet={handlePlaceBet}
                balance={balance}
                loading={loadingBet}
              />
            ) : (
              <div className="glass-card rounded-lg p-6 text-center">
                <TrendingUp size={36} className="text-muted-foreground mx-auto mb-3"/>
                <p className="font-display text-sm text-muted-foreground tracking-wider">SELECT ODDS TO PLACE A BET</p>
              </div>
            )}
            <div className="glass-card rounded-lg p-4 border-primary/20">
              <p className="font-display text-xs text-muted-foreground tracking-wider mb-3">NEED HELP?</p>
              <button onClick={()=>window.open(TELEGRAM_URL,"_blank")}
                className="w-full flex items-center gap-3 bg-secondary hover:bg-secondary/70 border border-border hover:border-primary/40 rounded-lg px-3 py-2.5 transition-all touch-manipulation">
                <div className="gradient-gold rounded-full p-1.5 shrink-0"><Send size={13} className="text-primary-foreground"/></div>
                <div className="text-left">
                  <p className="font-display text-xs font-bold text-primary tracking-wider">@cricbet007</p>
                  <p className="text-xs text-muted-foreground">Deposit · Withdraw · Support</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPanel;
