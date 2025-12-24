import { useProject } from '@/contexts/ProjectContext';
import { useI18n } from '@/contexts/I18nContext';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ProgressChart() {
  const { tasks, wbs, requirements, backlog } = useProject();
  const { t, language } = useI18n();

  const taskProgress = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    return total > 0 ? (completed / total) * 100 : 0;
  }, [tasks]);

  const wbsProgress = useMemo(() => {
    if (wbs.length === 0) return 0;
    const totalProgress = wbs.reduce((sum, node) => sum + (node.progress || 0), 0);
    return totalProgress / wbs.length;
  }, [wbs]);

  const requirementsProgress = useMemo(() => {
    const total = requirements.length;
    const implemented = requirements.filter(r => r.status === 'implemented' || r.status === 'verified').length;
    return total > 0 ? (implemented / total) * 100 : 0;
  }, [requirements]);

  const backlogProgress = useMemo(() => {
    const total = backlog.length;
    const completed = backlog.filter(item => item.status === 'done').length;
    return total > 0 ? (completed / total) * 100 : 0;
  }, [backlog]);

  const progressData = [
    {
      name: language === 'fr' ? 'Tâches' : 'Tasks',
      value: Math.round(taskProgress),
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'done').length,
    },
    {
      name: language === 'fr' ? 'WBS' : 'WBS',
      value: Math.round(wbsProgress),
      total: wbs.length,
      completed: wbs.filter(n => n.progress === 100).length,
    },
    {
      name: language === 'fr' ? 'Exigences' : 'Requirements',
      value: Math.round(requirementsProgress),
      total: requirements.length,
      completed: requirements.filter(r => r.status === 'implemented' || r.status === 'verified').length,
    },
    {
      name: language === 'fr' ? 'Backlog' : 'Backlog',
      value: Math.round(backlogProgress),
      total: backlog.length,
      completed: backlog.filter(item => item.status === 'done').length,
    },
  ];

  const statusDistribution = useMemo(() => {
    return [
      {
        name: language === 'fr' ? 'Terminé' : 'Done',
        value: tasks.filter(t => t.status === 'done').length,
      },
      {
        name: language === 'fr' ? 'En cours' : 'In Progress',
        value: tasks.filter(t => t.status === 'in-progress').length,
      },
      {
        name: language === 'fr' ? 'À faire' : 'Todo',
        value: tasks.filter(t => t.status === 'todo').length,
      },
      {
        name: language === 'fr' ? 'En révision' : 'Review',
        value: tasks.filter(t => t.status === 'review').length,
      },
    ];
  }, [tasks, language]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{language === 'fr' ? 'Progression par Catégorie' : 'Progress by Category'}</CardTitle>
          <CardDescription>
            {language === 'fr' 
              ? 'Pourcentage de complétion par type d\'élément'
              : 'Completion percentage by element type'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="hsl(var(--primary))" name={language === 'fr' ? '% Complété' : '% Completed'} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'fr' ? 'Répartition par Statut' : 'Status Distribution'}</CardTitle>
          <CardDescription>
            {language === 'fr' 
              ? 'Distribution des tâches par statut'
              : 'Task distribution by status'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{language === 'fr' ? 'Détails de Progression' : 'Progress Details'}</CardTitle>
          <CardDescription>
            {language === 'fr' 
              ? 'Vue détaillée de la progression par catégorie'
              : 'Detailed view of progress by category'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {progressData.map((item) => (
              <div key={item.name} className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="text-sm font-medium text-muted-foreground">{item.name}</div>
                <div className="text-2xl font-bold mt-2">{item.value}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {item.completed} / {item.total} {language === 'fr' ? 'terminé' : 'completed'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

