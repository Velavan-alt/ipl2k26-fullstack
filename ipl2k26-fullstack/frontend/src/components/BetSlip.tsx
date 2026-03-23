import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BetSlipProps {
  matchTitle: string;
  selection: string;
  odds: number;
  onClose: () => void;
  onPlaceBet?: (amount: number) => void;
  balance?: number;
  loading?: boolean;
}

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

const BetSlip = ({ matchTitle, selection, odds, onClose, onPlaceBet, balance = 0, loading = false }: BetSlipProps) => {
  const [amount, setAmount] = useState("");
  const parsed        = parseFloat(amount) || 0;
  const potentialWin  = parsed > 0 ? (parsed * odds).toFixed(2) : "0.00";
  const profit        = parsed > 0 ? ((parsed * odds) - parsed).toFixed(2) : "0.00";
  const betTeam       = selection.replace(" Win", "");

  const handlePlaceBet = () => {
    if (!parsed || parsed <= 0) { toast.error("Please enter a valid amount"); return; }
    if (parsed < 10)            { toast.error("Minimum bet is ₹10"); return; }
    if (parsed > balance)       { toast.error("Insufficient balance."); return; }
    onPlaceBet?.(parsed);
  };

  return (
    <div className="glass-card rounded-xl p-4 sm:p-5 border-primary/30 glow-gold">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-bold tracking-wider text-primary">BET SLIP</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-0.5">
          <X size={17} />
        </button>
      </div>

      <div className="space-y-3">
        {/* Selection summary */}
        <div className="bg-secondary rounded-lg p-3">
          <p className="text-xs text-muted-foreground truncate">{matchTitle}</p>
          <p className="font-display font-bold text-foreground mt-0.5">{betTeam}</p>
          <p className="text-primary font-display font-bold text-lg">@ {odds}x</p>
        </div>

        {/* Balance */}
        <div className="bg-secondary rounded-lg p-3 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Your Balance</span>
          <span className="font-display font-bold text-foreground">₹{balance.toLocaleString()}</span>
        </div>

        {/* Amount input */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block font-display tracking-wider">STAKE AMOUNT (₹)</label>
          <Input type="number" placeholder="Enter amount (min ₹10)" value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-secondary border-border focus:border-primary" min="10" max={balance} />
        </div>

        {/* Quick amount pills */}
        <div className="grid grid-cols-4 gap-1.5">
          {QUICK_AMOUNTS.map((q) => (
            <button key={q} onClick={() => setAmount(String(q))}
              disabled={q > balance}
              className={`text-xs font-display font-bold py-1.5 rounded-md border transition-all ${
                parseFloat(amount) === q
                  ? "gradient-gold text-primary-foreground border-transparent"
                  : "bg-secondary border-border text-muted-foreground hover:border-primary/40 hover:text-foreground disabled:opacity-30"
              }`}>
              ₹{q >= 1000 ? `${q/1000}K` : q}
            </button>
          ))}
        </div>

        {/* Potential win */}
        <div className="bg-secondary rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Potential Win</span>
            <span className="font-display font-bold text-primary text-lg">₹{potentialWin}</span>
          </div>
          {parsed > 0 && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-muted-foreground">Profit</span>
              <span className="text-xs text-success font-semibold">+₹{profit}</span>
            </div>
          )}
        </div>

        <Button onClick={handlePlaceBet}
          disabled={!parsed || parsed < 10 || parsed > balance || loading}
          className="w-full gradient-gold text-primary-foreground font-display font-bold tracking-wider disabled:opacity-40 h-11">
          {loading ? <Loader2 size={16} className="animate-spin mr-1" /> : null}
          {loading ? "PLACING..." : "PLACE BET"}
        </Button>
      </div>
    </div>
  );
};

export default BetSlip;
