import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useProject } from '@/contexts/ProjectContext';
import { useI18n } from '@/contexts/I18nContext';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, eachDayOfInterval, isWithinInterval } from 'date-fns';

export function BurndownChart() {
  const { backlog, sprints } = useProject();
  const { t, language } = useI18n();

  const burndownData = useMemo(() => {
    // Find active sprint
    const activeSprint = sprints.find(s => s.status === 'active' || s.status === 'in-progress');
    if (!activeSprint || !activeSprint.startDate || !activeSprint.endDate) {
      return [];
    }

    const startDate = parseISO(activeSprint.startDate);
    const endDate = parseISO(activeSprint.endDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Get sprint items
    const sprintItems = backlog.filter(item => item.sprintId === activeSprint.id);
    const totalStoryPoints = sprintItems.reduce((sum, item) => sum + (item.storyPoints || 0), 0);
    const idealBurnRate = totalStoryPoints / days.length;

    // Calculate remaining work for each day
    return days.map((day, index) => {
      const daysRemaining = days.length - index;
      const idealRemaining = totalStoryPoints - (idealBurnRate * index);
      
      // Calculate actual remaining (simplified - in real app, track daily completion)
      const completedItems = sprintItems.filter(item => 
        item.status === 'done' && 
        item.updatedAt && 
        parseISO(item.updatedAt) <= day
      );
      const completedPoints = completedItems.reduce((sum, item) => sum + (item.storyPoints || 0), 0);
      const actualRemaining = Math.max(0, totalStoryPoints - completedPoints);

      return {
        date: format(day, 'MMM dd'),
        ideal: Math.max(0, Math.round(idealRemaining)),
        remaining: Math.max(0, Math.round(actualRemaining)),
        completed: completedPoints,
      };
    });
  }, [backlog, sprints]);

  if (burndownData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{language === 'fr' ? 'Graphique de Burndown' : 'Sprint Burndown'}</CardTitle>
          <CardDescription>
            {language === 'fr' 
              ? 'Suivez le travail restant vs le burndown idéal'
              : 'Track remaining work vs ideal burndown'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-sm text-muted-foreground">
            {language === 'fr' 
              ? 'Aucun sprint actif trouvé. Créez un sprint actif pour voir le graphique de burndown.'
              : 'No active sprint found. Create an active sprint to see the burndown chart.'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{language === 'fr' ? 'Graphique de Burndown' : 'Sprint Burndown'}</CardTitle>
        <CardDescription>
          {language === 'fr' 
            ? 'Suivez le travail restant vs le burndown idéal'
            : 'Track remaining work vs ideal burndown'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={burndownData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
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
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              name={language === 'fr' ? 'Idéal' : 'Ideal'}
            />
            <Line
              type="monotone"
              dataKey="remaining"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
              name={language === 'fr' ? 'Restant' : 'Remaining'}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#00C49F"
              strokeWidth={2}
              dot={{ fill: '#00C49F', strokeWidth: 2 }}
              name={language === 'fr' ? 'Terminé' : 'Completed'}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
