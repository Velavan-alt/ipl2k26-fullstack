export interface Match {
  id: string;
  team1: string;
  team2: string;
  team1Score: string;
  team2Score: string;
  status: "live" | "upcoming" | "completed";
  winner?: "team1" | "team2" | "draw" | null;
  overs: string;
  venue: string;
  date: string;
  startTime: string; // "HH:MM" 24-hour, e.g. "14:30" — auto-transitions to live at this datetime
  odds: { team1Win: number; team2Win: number; draw: number };
}

export interface Bet {
  id: string;
  userId: string;
  userName: string;
  matchId: string;
  matchTitle: string;
  selection: string;
  amount: number;
  odds: number;
  status: "pending" | "won" | "lost";
  placedAt: string;
}

export interface ScoreCard {
  matchId: string;
  batting: { name: string; runs: number; balls: number; fours: number; sixes: number; sr: number }[];
  bowling: { name: string; overs: string; maidens: number; runs: number; wickets: number; econ: number }[];
}

export const matches: Match[] = [
  {
    id: "1", team1: "Mumbai Indians", team2: "Chennai Super Kings",
    team1Score: "187/4", team2Score: "142/3",
    status: "live", overs: "15.2", venue: "Wankhede Stadium, Mumbai",
    date: "2026-03-20", startTime: "20:00",
    odds: { team1Win: 1.75, team2Win: 2.10, draw: 14.0 },
  },
  {
    id: "2", team1: "Royal Challengers Bengaluru", team2: "Kolkata Knight Riders",
    team1Score: "201/5", team2Score: "-",
    status: "live", overs: "20.0", venue: "M. Chinnaswamy Stadium, Bengaluru",
    date: "2026-03-20", startTime: "16:00",
    odds: { team1Win: 1.90, team2Win: 1.95, draw: 15.0 },
  },
  {
    id: "3", team1: "Rajasthan Royals", team2: "Delhi Capitals",
    team1Score: "-", team2Score: "-",
    status: "upcoming", overs: "-", venue: "Sawai Mansingh Stadium, Jaipur",
    date: "2026-03-21", startTime: "20:00",
    odds: { team1Win: 2.00, team2Win: 1.85, draw: 13.0 },
  },
  {
    id: "4", team1: "Punjab Kings", team2: "Gujarat Titans",
    team1Score: "-", team2Score: "-",
    status: "upcoming", overs: "-", venue: "PCA Stadium, Mohali",
    date: "2026-03-22", startTime: "20:00",
    odds: { team1Win: 2.15, team2Win: 1.70, draw: 13.5 },
  },
  {
    id: "5", team1: "Sunrisers Hyderabad", team2: "Lucknow Super Giants",
    team1Score: "198/7", team2Score: "201/4",
    status: "completed", overs: "20.0", venue: "Rajiv Gandhi Intl. Stadium, Hyderabad",
    date: "2026-03-19", startTime: "20:00",
    odds: { team1Win: 1.80, team2Win: 2.05, draw: 13.0 },
  },
];

export const scoreCard: ScoreCard = {
  matchId: "1",
  batting: [
    { name: "Rohit Sharma", runs: 82, balls: 67, fours: 9, sixes: 3, sr: 122.39 },
    { name: "Virat Kohli", runs: 95, balls: 88, fours: 8, sixes: 2, sr: 107.95 },
    { name: "Shubman Gill", runs: 45, balls: 38, fours: 5, sixes: 1, sr: 118.42 },
    { name: "KL Rahul", runs: 38, balls: 42, fours: 3, sixes: 0, sr: 90.48 },
    { name: "Hardik Pandya", runs: 18, balls: 12, fours: 2, sixes: 1, sr: 150.0 },
  ],
  bowling: [
    { name: "Pat Cummins", overs: "9.4", maidens: 1, runs: 58, wickets: 2, econ: 6.0 },
    { name: "Mitchell Starc", overs: "10", maidens: 0, runs: 72, wickets: 1, econ: 7.2 },
    { name: "Adam Zampa", overs: "8", maidens: 0, runs: 55, wickets: 1, econ: 6.88 },
    { name: "Josh Hazlewood", overs: "5", maidens: 1, runs: 32, wickets: 0, econ: 6.4 },
  ],
};

export const bets: Bet[] = [
  { id: "1", userId: "u1", userName: "Rahul K.", matchId: "1", matchTitle: "IND vs AUS", selection: "India Win", amount: 500, odds: 1.65, status: "pending", placedAt: "2026-03-20 14:30" },
  { id: "2", userId: "u2", userName: "Amit S.", matchId: "1", matchTitle: "IND vs AUS", selection: "Australia Win", amount: 1000, odds: 2.35, status: "pending", placedAt: "2026-03-20 14:45" },
  { id: "3", userId: "u3", userName: "Priya M.", matchId: "2", matchTitle: "ENG vs SA", selection: "England Win", amount: 250, odds: 1.85, status: "pending", placedAt: "2026-03-20 15:00" },
  { id: "4", userId: "u1", userName: "Rahul K.", matchId: "4", matchTitle: "WI vs SL", selection: "Sri Lanka Win", amount: 750, odds: 1.70, status: "won", placedAt: "2026-03-19 10:00" },
];
