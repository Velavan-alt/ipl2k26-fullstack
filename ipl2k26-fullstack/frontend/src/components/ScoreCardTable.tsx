import { ScoreCard } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ScoreCardTable = ({ data }: { data: ScoreCard }) => {
  return (
    <div className="space-y-6">
      <div className="glass-card rounded-lg overflow-hidden">
        <div className="gradient-gold px-4 py-2">
          <h3 className="font-display text-primary-foreground font-bold tracking-wider text-sm">BATTING</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-display text-xs">BATTER</TableHead>
              <TableHead className="text-muted-foreground font-display text-xs text-center">R</TableHead>
              <TableHead className="text-muted-foreground font-display text-xs text-center">B</TableHead>
              <TableHead className="text-muted-foreground font-display text-xs text-center">4s</TableHead>
              <TableHead className="text-muted-foreground font-display text-xs text-center">6s</TableHead>
              <TableHead className="text-muted-foreground font-display text-xs text-center">SR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.batting.map((b) => (
              <TableRow key={b.name} className="border-border/30 hover:bg-secondary/50">
                <TableCell className="font-medium text-foreground">{b.name}</TableCell>
                <TableCell className="text-center text-primary font-bold">{b.runs}</TableCell>
                <TableCell className="text-center text-muted-foreground">{b.balls}</TableCell>
                <TableCell className="text-center text-muted-foreground">{b.fours}</TableCell>
                <TableCell className="text-center text-muted-foreground">{b.sixes}</TableCell>
                <TableCell className="text-center text-muted-foreground">{b.sr}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="glass-card rounded-lg overflow-hidden">
        <div className="bg-accent px-4 py-2">
          <h3 className="font-display text-accent-foreground font-bold tracking-wider text-sm">BOWLING</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-display text-xs">BOWLER</TableHead>
              <TableHead className="text-muted-foreground font-display text-xs text-center">O</TableHead>
              <TableHead className="text-muted-foreground font-display text-xs text-center">M</TableHead>
              <TableHead className="text-muted-foreground font-display text-xs text-center">R</TableHead>
              <TableHead className="text-muted-foreground font-display text-xs text-center">W</TableHead>
              <TableHead className="text-muted-foreground font-display text-xs text-center">ECON</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.bowling.map((b) => (
              <TableRow key={b.name} className="border-border/30 hover:bg-secondary/50">
                <TableCell className="font-medium text-foreground">{b.name}</TableCell>
                <TableCell className="text-center text-muted-foreground">{b.overs}</TableCell>
                <TableCell className="text-center text-muted-foreground">{b.maidens}</TableCell>
                <TableCell className="text-center text-muted-foreground">{b.runs}</TableCell>
                <TableCell className="text-center text-primary font-bold">{b.wickets}</TableCell>
                <TableCell className="text-center text-muted-foreground">{b.econ}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ScoreCardTable;
