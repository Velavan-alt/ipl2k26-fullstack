import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiCreateMatch } from "@/services/api";
import { Plus, X, Clock } from "lucide-react";
import { toast } from "sonner";

interface AddMatchFormProps {
  onAdded: () => void;
  onClose: () => void;
}

const AddMatchForm = ({ onAdded, onClose }: AddMatchFormProps) => {
  const [team1, setTeam1]         = useState("");
  const [team2, setTeam2]         = useState("");
  const [venue, setVenue]         = useState("");
  const [date, setDate]           = useState("");
  const [startTime, setStartTime] = useState("");
  const [team1Win, setTeam1Win]   = useState("");
  const [team2Win, setTeam2Win]   = useState("");
  const [draw, setDraw]           = useState("");
  const [loading, setLoading]     = useState(false);

  const isInPast = (): boolean => {
    if (!date || !startTime) return false;
    return new Date(`${date}T${startTime}:00`) < new Date();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team1.trim() || !team2.trim() || !venue.trim() || !date || !startTime || !team1Win || !team2Win || !draw) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const scheduledPast = isInPast();
      // Combine date + time into ISO format for backend
      const matchTime = `${date}T${startTime}:00`;

      await apiCreateMatch({
        title:     `${team1.trim()} vs ${team2.trim()}`,
        team1:     team1.trim(),
        team2:     team2.trim(),
        venue:     venue.trim(),
        oddsTeam1: parseFloat(team1Win),
        oddsTeam2: parseFloat(team2Win),
        oddsDraw:  parseFloat(draw),
        matchTime,
        status:    scheduledPast ? "live" : "upcoming",
      });

      toast.success(
        scheduledPast
          ? "Match added and set to LIVE."
          : `Match scheduled for ${date} at ${startTime}.`
      );
      onAdded();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to create match");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-lg p-6 border-primary/20 glow-gold">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-bold text-primary tracking-wider">ADD NEW MATCH</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground font-display text-xs tracking-wider">TEAM 1</Label>
            <Input value={team1} onChange={(e) => setTeam1(e.target.value)}
              placeholder="e.g. Mumbai Indians" className="bg-secondary border-border focus:border-primary" maxLength={50} required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground font-display text-xs tracking-wider">TEAM 2</Label>
            <Input value={team2} onChange={(e) => setTeam2(e.target.value)}
              placeholder="e.g. Chennai Super Kings" className="bg-secondary border-border focus:border-primary" maxLength={50} required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-muted-foreground font-display text-xs tracking-wider">VENUE</Label>
          <Input value={venue} onChange={(e) => setVenue(e.target.value)}
            placeholder="e.g. Wankhede Stadium, Mumbai" className="bg-secondary border-border focus:border-primary" maxLength={100} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground font-display text-xs tracking-wider">MATCH DATE</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="bg-secondary border-border focus:border-primary" required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground font-display text-xs tracking-wider flex items-center gap-1.5">
              <Clock size={12} /> START TIME
            </Label>
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
              className="bg-secondary border-border focus:border-primary" required />
          </div>
        </div>

        {date && startTime && (
          <div className={`text-xs px-3 py-2 rounded-md flex items-center gap-2 ${
            isInPast() ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                       : "bg-primary/10 text-primary border border-primary/20"
          }`}>
            <Clock size={12} />
            {isInPast() ? "Start time is in the past — match will be LIVE immediately."
                        : `Match will go LIVE on ${date} at ${startTime}.`}
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-muted-foreground font-display text-xs tracking-wider">MATCH ODDS</Label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <span className="text-xs text-muted-foreground">Team 1 Win</span>
              <Input type="number" step="0.01" min="1.01" value={team1Win}
                onChange={(e) => setTeam1Win(e.target.value)} placeholder="1.75"
                className="bg-secondary border-border focus:border-primary" required />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Draw</span>
              <Input type="number" step="0.01" min="1.01" value={draw}
                onChange={(e) => setDraw(e.target.value)} placeholder="10.00"
                className="bg-secondary border-border focus:border-primary" required />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Team 2 Win</span>
              <Input type="number" step="0.01" min="1.01" value={team2Win}
                onChange={(e) => setTeam2Win(e.target.value)} placeholder="2.10"
                className="bg-secondary border-border focus:border-primary" required />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={loading}
          className="w-full gradient-gold text-primary-foreground font-display font-bold tracking-wider">
          <Plus size={16} className="mr-2" />
          {loading ? "SAVING..." : "SCHEDULE MATCH"}
        </Button>
      </form>
    </div>
  );
};

export default AddMatchForm;
