import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { sampleVelocityData } from '@/data/projectData';

export function VelocityChart() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Team Velocity</h2>
        <p className="text-muted-foreground">Committed vs completed story points per sprint</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sampleVelocityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="sprint" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar
              dataKey="committed"
              fill="hsl(var(--accent))"
              radius={[4, 4, 0, 0]}
              name="Committed"
            />
            <Bar
              dataKey="completed"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              name="Completed"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
