import { useState, useCallback, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AddMatchForm from "@/components/AddMatchForm";
import {
  apiGetMatches, apiGoLive, apiReschedule, apiDeleteMatch,
  apiGetAllUsers, apiAddMoney, apiAllBets, apiDeclareResult, apiGetStats,
} from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, DollarSign, Activity, BarChart3, Plus, Trash2,
  Wallet, Zap, Calendar, Clock, Trophy, CheckCircle,
  Eye, EyeOff, Copy, Loader2,
} from "lucide-react";
import { toast } from "sonner";

const AdminPanel = () => {
  const [matches, setMatches]             = useState<any[]>([]);
  const [allBets, setAllBets]             = useState<any[]>([]);
  const [allUsers, setAllUsers]           = useState<any[]>([]);
  const [stats, setStats]                 = useState<any>({});
  const [loading, setLoading]             = useState(true);
  const [showAddMatch, setShowAddMatch]   = useState(false);
  const [addMoneyId, setAddMoneyId]       = useState<number|null>(null);
  const [moneyAmount, setMoneyAmount]     = useState("");
  const [rescheduleId, setRescheduleId]   = useState<number|null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [betFilter, setBetFilter]         = useState("all");
  const [declareId, setDeclareId]         = useState<number|null>(null);
  const [declaring, setDeclaring]         = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<number,boolean>>({});

  const loadData = useCallback(async () => {
    try {
      const [m, b, u, s] = await Promise.all([
        apiGetMatches(), apiAllBets(), apiGetAllUsers(), apiGetStats(),
      ]);
      setMatches(m); setAllBets(b); setAllUsers(u); setStats(s);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredBets = betFilter === "all" ? allBets : allBets.filter((b:any) => b.status === betFilter);

  const handleDeleteMatch = async (id: number) => {
    await apiDeleteMatch(String(id)); toast.success("Match deleted"); loadData();
  };
  const handleGoLive = async (id: number, title: string) => {
    await apiGoLive(String(id)); toast.success(`"${title}" is now LIVE!`); loadData();
  };
  const handleReschedule = async (id: number) => {
    if (!rescheduleDate || !rescheduleTime) { toast.error("Pick date and time"); return; }
    await apiReschedule(String(id), `${rescheduleDate}T${rescheduleTime}:00`);
    toast.success("Rescheduled"); setRescheduleId(null); setRescheduleDate(""); setRescheduleTime(""); loadData();
  };
  const handleAddMoney = async (user: any) => {
    const amt = parseFloat(moneyAmount);
    if (!amt || amt <= 0) { toast.error("Enter valid amount"); return; }
    await apiAddMoney(user.id, amt);
    toast.success(`₹${amt} added to ${user.name}`);
    setAddMoneyId(null); setMoneyAmount(""); loadData();
  };
  const handleDeclareResult = async (matchId: number, match: any, winner: string) => {
    setDeclaring(true);
    try {
      const res = await apiDeclareResult(String(matchId), winner);
      const wName = winner==="team1"?match.team1:winner==="team2"?match.team2:"Draw";
      toast.success(`🏆 ${wName} won! ${res.won} bets won — ₹${res.totalPayout} paid out.`);
      setDeclareId(null); loadData();
    } catch (e:any) { toast.error(e.message); }
    finally { setDeclaring(false); }
  };
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied!`));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-wider mb-6 sm:mb-8">
          <span className="text-gradient-gold">IPL2K26</span> ADMIN
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            {label:"Total Bets",   value:stats.totalBets||0,    icon:BarChart3,  color:"text-primary"},
            {label:"Total Volume", value:`₹${(stats.totalVolume||0).toLocaleString()}`, icon:DollarSign, color:"text-success"},
            {label:"Live Matches", value:stats.liveMatches||0,  icon:Activity,   color:"text-live"},
            {label:"Users",        value:stats.totalUsers||0,   icon:Users,      color:"text-accent"},
          ].map(s=>(
            <div key={s.label} className="glass-card rounded-lg p-3 sm:p-4">
              <s.icon size={18} className={`${s.color} mb-1.5`}/>
              <p className={`font-display text-xl sm:text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="matches">
          <TabsList className="bg-secondary mb-4 sm:mb-6 w-full sm:w-auto">
            <TabsTrigger value="matches" className="flex-1 sm:flex-none font-display tracking-wider text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">MATCHES</TabsTrigger>
            <TabsTrigger value="bets"    className="flex-1 sm:flex-none font-display tracking-wider text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">BETS</TabsTrigger>
            <TabsTrigger value="users"   className="flex-1 sm:flex-none font-display tracking-wider text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users size={13} className="mr-1"/>USERS
            </TabsTrigger>
          </TabsList>

          {/* MATCHES */}
          <TabsContent value="matches">
            <div className="mb-4 flex justify-end">
              <Button onClick={()=>setShowAddMatch(!showAddMatch)} className="gradient-gold text-primary-foreground font-display font-bold tracking-wider text-xs sm:text-sm">
                <Plus size={15} className="mr-1.5"/>ADD MATCH
              </Button>
            </div>
            {showAddMatch && <div className="mb-4"><AddMatchForm onAdded={loadData} onClose={()=>setShowAddMatch(false)}/></div>}

            {loading ? (
              <div className="glass-card rounded-lg p-8 text-center">
                <Loader2 size={24} className="animate-spin text-primary mx-auto mb-2"/>
                <p className="text-muted-foreground font-display text-sm">Loading...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="glass-card rounded-lg p-8 text-center">
                <p className="text-muted-foreground font-display">No matches yet. Add one!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((match:any) => {
                  const matchBets = allBets.filter((b:any)=>b.matchId===match.id||b.match_id===match.id);
                  const pendingCount = matchBets.filter((b:any)=>b.status==="pending").length;
                  const isDeclarable = ["live","upcoming"].includes(match.status) && !match.winner;
                  return (
                    <div key={match.id} className="glass-card rounded-lg p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="font-display font-bold text-foreground text-sm sm:text-base">
                              {match.team1} <span className="text-muted-foreground font-normal text-xs">vs</span> {match.team2}
                            </p>
                            <Badge className={
                              match.status==="live"     ?"gradient-gold text-primary-foreground text-xs":
                              match.status==="upcoming" ?"border-primary/40 text-primary bg-transparent text-xs":
                              "bg-secondary text-muted-foreground text-xs"
                            }>{match.status.toUpperCase()}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{match.venue}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar size={10}/>{new Date(match.match_time).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            <span className="text-xs text-muted-foreground">{match.team1}: <span className="text-primary font-bold">{match.odds_team1}</span></span>
                            <span className="text-xs text-muted-foreground">Draw: <span className="text-primary font-bold">{match.odds_draw}</span></span>
                            <span className="text-xs text-muted-foreground">{match.team2}: <span className="text-primary font-bold">{match.odds_team2}</span></span>
                          </div>
                          {match.winner && (
                            <div className="mt-2 inline-flex items-center gap-1.5 bg-success/10 border border-success/30 rounded-md px-2.5 py-1">
                              <Trophy size={12} className="text-success"/>
                              <span className="text-xs font-display font-bold text-success">
                                Winner: {match.winner==="team1"?match.team1:match.winner==="team2"?match.team2:"Draw"}
                              </span>
                              <CheckCircle size={12} className="text-success"/>
                            </div>
                          )}
                          {pendingCount>0 && <p className="text-xs text-warning mt-1">⚠ {pendingCount} pending bet{pendingCount>1?"s":""}</p>}
                        </div>

                        <div className="flex flex-col sm:flex-row items-end gap-1.5 shrink-0">
                          {match.status==="upcoming" && (
                            <>
                              <Button size="sm" variant="outline"
                                className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 font-display text-xs h-7 px-2"
                                onClick={()=>handleGoLive(match.id,`${match.team1} vs ${match.team2}`)}>
                                <Zap size={12} className="mr-1"/>GO LIVE
                              </Button>
                              <Button size="sm" variant="outline"
                                className="border-primary/40 text-primary hover:bg-primary/10 font-display text-xs h-7 px-2"
                                onClick={()=>setRescheduleId(rescheduleId===match.id?null:match.id)}>
                                <Clock size={12} className="mr-1"/>RESCHEDULE
                              </Button>
                            </>
                          )}
                          {isDeclarable && (
                            <Button size="sm"
                              className="gradient-gold text-primary-foreground font-display font-bold text-xs h-7 px-2 gap-1"
                              onClick={()=>setDeclareId(declareId===match.id?null:match.id)}>
                              <Trophy size={12}/>DECLARE
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-7 w-7"
                            onClick={()=>handleDeleteMatch(match.id)}>
                            <Trash2 size={14}/>
                          </Button>
                        </div>
                      </div>

                      {/* Declare result panel */}
                      {declareId===match.id && (
                        <div className="mt-3 pt-3 border-t border-border/30">
                          <p className="text-xs font-display text-muted-foreground tracking-wider mb-3">SELECT WINNING TEAM</p>
                          {declaring ? (
                            <div className="flex items-center justify-center gap-2 py-4">
                              <Loader2 size={18} className="animate-spin text-primary"/>
                              <span className="text-sm text-muted-foreground">Settling bets...</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-2">
                              {[{key:"team1",label:match.team1},{key:"draw",label:"Draw"},{key:"team2",label:match.team2}].map(({key,label})=>(
                                <button key={key}
                                  onClick={()=>handleDeclareResult(match.id,match,key)}
                                  className="flex flex-col items-center gap-1 bg-secondary hover:bg-primary/10 border border-border hover:border-primary/50 rounded-lg px-2 py-3 transition-all group">
                                  <Trophy size={16} className="text-primary group-hover:scale-110 transition-transform"/>
                                  <span className="font-display font-bold text-foreground text-xs text-center leading-tight">{label}</span>
                                  <span className="text-xs text-muted-foreground">WINS</span>
                                </button>
                              ))}
                            </div>
                          )}
                          <Button size="sm" variant="ghost" className="text-muted-foreground text-xs mt-2"
                            onClick={()=>setDeclareId(null)}>CANCEL</Button>
                        </div>
                      )}

                      {/* Reschedule form */}
                      {rescheduleId===match.id && (
                        <div className="mt-3 pt-3 border-t border-border/30 flex flex-wrap items-end gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1 font-display tracking-wider">NEW DATE</p>
                            <Input type="date" value={rescheduleDate} onChange={e=>setRescheduleDate(e.target.value)}
                              className="bg-secondary border-border h-8 text-sm w-36 sm:w-40"/>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1 font-display tracking-wider">START TIME</p>
                            <Input type="time" value={rescheduleTime} onChange={e=>setRescheduleTime(e.target.value)}
                              className="bg-secondary border-border h-8 text-sm w-32 sm:w-36"/>
                          </div>
                          <Button size="sm" className="gradient-gold text-primary-foreground font-display font-bold text-xs h-8"
                            onClick={()=>handleReschedule(match.id)}>CONFIRM</Button>
                          <Button size="sm" variant="ghost" className="text-muted-foreground h-8 text-xs"
                            onClick={()=>{setRescheduleId(null);setRescheduleDate("");setRescheduleTime("");}}>CANCEL</Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* BETS */}
          <TabsContent value="bets">
            <div className="flex flex-wrap gap-2 mb-4">
              {["all","pending","won","lost"].map(f=>(
                <button key={f} onClick={()=>setBetFilter(f)}
                  className={`px-3 py-1 rounded-full font-display text-xs tracking-wider transition-all ${
                    betFilter===f?"gradient-gold text-primary-foreground":"bg-secondary text-muted-foreground hover:text-foreground border border-border"
                  }`}>
                  {f.toUpperCase()}
                  <span className="ml-1.5 opacity-70">({f==="all"?allBets.length:allBets.filter((b:any)=>b.status===f).length})</span>
                </button>
              ))}
            </div>
            {filteredBets.length===0 ? (
              <div className="glass-card rounded-lg p-8 text-center"><p className="text-muted-foreground font-display">No bets found.</p></div>
            ) : (
              <div className="space-y-3">
                {filteredBets.map((bet:any)=>(
                  <div key={bet.id} className="glass-card rounded-lg p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-display font-bold text-foreground text-sm">{bet.userName}</p>
                          <Badge className={
                            bet.status==="won"  ?"bg-success/20 text-success border border-success/30 text-xs":
                            bet.status==="lost" ?"bg-destructive/20 text-destructive border border-destructive/30 text-xs":
                            "bg-warning/20 text-warning border border-warning/30 text-xs"
                          }>{bet.status.toUpperCase()}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1.5">{bet.matchTitle}</p>
                        <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-md px-2.5 py-1">
                          <span className="text-xs text-muted-foreground">Bet on:</span>
                          <span className="font-display font-bold text-primary text-xs">{bet.selection?.replace(" Win","")}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display font-bold text-primary text-base">₹{bet.amount}</p>
                        <p className="text-xs text-muted-foreground">Odds: <span className="text-foreground font-semibold">{bet.oddsAtBet}x</span></p>
                        <p className="text-xs text-muted-foreground">Win: <span className="text-success font-semibold">₹{bet.potentialWin}</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users">
            {allUsers.length===0 ? (
              <div className="glass-card rounded-lg p-8 text-center">
                <Trophy size={36} className="text-muted-foreground mx-auto mb-3"/>
                <p className="text-muted-foreground font-display">No registered users yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allUsers.map((u:any)=>{
                  const passVisible = showPasswords[u.id]||false;
                  return (
                    <div key={u.id} className="glass-card rounded-lg p-3 sm:p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-bold text-foreground text-base">{u.name}</p>
                          {u.username && <p className="text-xs text-primary mt-0.5">@{u.username}</p>}
                          <div className="flex flex-wrap gap-3 mt-1.5">
                            <span className="text-xs text-muted-foreground">Bets: <span className="text-foreground font-semibold">{u.totalBets}</span></span>
                            <span className="text-xs text-muted-foreground">Won: <span className="text-success font-semibold">{u.wonBets}</span></span>
                            <span className="text-xs text-muted-foreground">Staked: <span className="text-foreground font-semibold">₹{u.totalStaked}</span></span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display font-bold text-primary text-xl">₹{(u.walletBalance||0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mb-2">wallet</p>
                          {addMoneyId===u.id ? (
                            <div className="flex items-center gap-1.5 justify-end flex-wrap">
                              <Input type="number" placeholder="₹ Amount" value={moneyAmount}
                                onChange={e=>setMoneyAmount(e.target.value)}
                                className="w-24 h-7 bg-secondary border-border text-xs" min="1"/>
                              <Button size="sm" onClick={()=>handleAddMoney(u)}
                                className="gradient-gold text-primary-foreground font-display text-xs h-7 px-2">ADD</Button>
                              <Button size="sm" variant="ghost"
                                onClick={()=>{setAddMoneyId(null);setMoneyAmount("");}}
                                className="text-muted-foreground h-7 text-xs px-2">✕</Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" onClick={()=>setAddMoneyId(u.id)}
                              className="border-primary/40 text-primary hover:bg-primary/10 font-display text-xs h-7">
                              <Wallet size={12} className="mr-1"/>ADD MONEY
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Credentials */}
                      <div className="mt-3 pt-3 border-t border-border/20 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="bg-secondary rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground font-display tracking-wider">USERNAME</p>
                            <p className="text-sm font-bold text-primary truncate">@{u.username||"—"}</p>
                          </div>
                          <button onClick={()=>copyToClipboard(u.username||"","Username")}
                            className="text-muted-foreground hover:text-foreground shrink-0 p-1"><Copy size={13}/></button>
                        </div>
                        <div className="bg-secondary rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground font-display tracking-wider">EMAIL</p>
                            <p className="text-sm font-semibold text-foreground truncate">{u.email}</p>
                          </div>
                          <button onClick={()=>copyToClipboard(u.email,"Email")}
                            className="text-muted-foreground hover:text-foreground shrink-0 p-1"><Copy size={13}/></button>
                        </div>
                        <div className="bg-secondary rounded-lg px-3 py-2 flex items-center justify-between gap-2 sm:col-span-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground font-display tracking-wider">PASSWORD (hashed)</p>
                            <p className="text-xs font-mono text-foreground truncate">{passVisible?u.password:"••••••••••"}</p>
                          </div>
                          <button onClick={()=>setShowPasswords(p=>({...p,[u.id]:!passVisible}))}
                            className="text-muted-foreground hover:text-foreground p-1">
                            {passVisible?<EyeOff size={14}/>:<Eye size={14}/>}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
