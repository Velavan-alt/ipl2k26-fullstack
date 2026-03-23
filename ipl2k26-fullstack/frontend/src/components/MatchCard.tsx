import { Match } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

import { MapPin, Clock } from "lucide-react";

interface MatchCardProps {
  match: Match;
  onBet?: (match: Match, selection: string) => void;
  showOdds?: boolean;
  onStatusChange?: () => void;
}

const MatchCard = ({ match, onBet, showOdds = true, onStatusChange }: MatchCardProps) => {
  return (
    <div className="glass-card rounded-xl p-4 sm:p-5 transition-all hover:border-primary/30 hover:glow-gold">

      {/* Header row */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">{match.venue}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          
          {match.status === "live" && (
            <Badge className="gradient-gold text-primary-foreground font-display text-xs tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse inline-block" />LIVE
            </Badge>
          )}
          {match.status === "upcoming" && (
            <Badge variant="outline" className="border-primary/40 text-primary font-display text-xs">UPCOMING</Badge>
          )}
          {match.status === "completed" && (
            <Badge variant="secondary" className="font-display text-xs">COMPLETED</Badge>
          )}
        </div>
      </div>

      {/* Teams row */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-center flex-1 px-1">
          <p className="font-display text-sm sm:text-base lg:text-lg font-bold text-foreground leading-tight">{match.team1}</p>
          <p className="text-primary font-display text-base sm:text-lg lg:text-xl font-bold mt-0.5">{match.team1Score || "-"}</p>
        </div>
        <div className="px-2 sm:px-4 shrink-0">
          <span className="text-muted-foreground font-display text-xs sm:text-sm font-bold">VS</span>
        </div>
        <div className="text-center flex-1 px-1">
          <p className="font-display text-sm sm:text-base lg:text-lg font-bold text-foreground leading-tight">{match.team2}</p>
          <p className="text-primary font-display text-base sm:text-lg lg:text-xl font-bold mt-0.5">{match.team2Score || "-"}</p>
        </div>
      </div>

      {/* Winner banner — shown after result is declared */}
      {match.status === "completed" && match.winner && (
        <div className="flex items-center justify-center gap-2 bg-success/10 border border-success/20 rounded-lg px-3 py-2 mb-3">
          <span className="text-base">🏆</span>
          <span className="font-display font-bold text-success text-sm">
            {match.winner === "team1" ? match.team1 :
             match.winner === "team2" ? match.team2 : "Draw"}
            {match.winner !== "draw" ? " won!" : " — Match drawn"}
          </span>
        </div>
      )}

      {/* Live overs */}
      {match.status === "live" && (
        <p className="text-center text-xs text-muted-foreground mb-3">Overs: {match.overs}</p>
      )}

      {/* Scheduled time for upcoming */}
      {match.status === "upcoming" && match.startTime && (
        <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1 mb-3">
          <Clock size={11} />{match.date} &nbsp;·&nbsp; {match.startTime}
        </p>
      )}

      {/* Odds buttons */}
      {showOdds && match.status !== "completed" && (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-1">
          {[
            { label: match.team1, odds: match.odds.team1Win, sel: `${match.team1} Win` },
            { label: "Draw",      odds: match.odds.draw,     sel: "Draw" },
            { label: match.team2, odds: match.odds.team2Win, sel: `${match.team2} Win` },
          ].map(({ label, odds, sel }) => (
            <button key={sel} onClick={() => onBet?.(match, sel)}
              className="bg-secondary hover:bg-secondary/70 border border-border hover:border-primary/40 rounded-lg py-2 px-1 text-center transition-all active:scale-95">
              <span className="text-xs text-muted-foreground block truncate px-1">{label}</span>
              <span className="text-primary font-display font-bold text-sm sm:text-base">{odds}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchCard;
