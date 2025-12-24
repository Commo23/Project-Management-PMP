import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useProject } from '@/contexts/ProjectContext';
import { useI18n } from '@/contexts/I18nContext';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function VelocityChart() {
  const { backlog, sprints } = useProject();
  const { t, language } = useI18n();

  const velocityData = useMemo(() => {
    return sprints
      .filter(s => s.status === 'completed' || s.status === 'active' || s.status === 'in-progress')
      .map(sprint => {
        const sprintItems = backlog.filter(item => item.sprintId === sprint.id);
        const committed = sprintItems.reduce((sum, item) => sum + (item.storyPoints || 0), 0);
        const completed = sprintItems
          .filter(item => item.status === 'done')
          .reduce((sum, item) => sum + (item.storyPoints || 0), 0);
        
        return {
          sprint: sprint.name,
          committed,
          completed,
          actualVelocity: sprint.actualVelocity || completed,
        };
      })
      .slice(-8); // Last 8 sprints
  }, [backlog, sprints]);

  const averageVelocity = useMemo(() => {
    if (velocityData.length === 0) return 0;
    const sum = velocityData.reduce((acc, d) => acc + d.completed, 0);
    return Math.round(sum / velocityData.length);
  }, [velocityData]);

  if (velocityData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{language === 'fr' ? 'Vélocité de l\'Équipe' : 'Team Velocity'}</CardTitle>
          <CardDescription>
            {language === 'fr' 
              ? 'Points d\'histoire engagés vs terminés par sprint'
              : 'Committed vs completed story points per sprint'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-sm text-muted-foreground">
            {language === 'fr' 
              ? 'Aucune donnée de sprint disponible. Créez des sprints pour voir la vélocité.'
              : 'No sprint data available. Create sprints to see velocity.'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{language === 'fr' ? 'Vélocité de l\'Équipe' : 'Team Velocity'}</CardTitle>
        <CardDescription>
          {language === 'fr' 
            ? 'Points d\'histoire engagés vs terminés par sprint'
            : 'Committed vs completed story points per sprint'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4">
          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <div className="text-sm text-muted-foreground">
              {language === 'fr' ? 'Vélocité Moyenne' : 'Average Velocity'}
            </div>
            <div className="text-2xl font-bold">{averageVelocity}</div>
            <div className="text-xs text-muted-foreground">
              {language === 'fr' ? 'points par sprint' : 'points per sprint'}
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={velocityData}>
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
              name={language === 'fr' ? 'Engagé' : 'Committed'}
            />
            <Bar
              dataKey="completed"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              name={language === 'fr' ? 'Terminé' : 'Completed'}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
