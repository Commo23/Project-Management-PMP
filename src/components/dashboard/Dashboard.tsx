import { useProject } from '@/contexts/ProjectContext';
import { useI18n } from '@/contexts/I18nContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  Target, 
  TrendingUp,
  FileText,
  AlertCircle,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function Dashboard() {
  const { 
    tasks, 
    backlog, 
    risks, 
    stakeholders, 
    teamMembers, 
    requirements,
    wbs,
    ganttTasks,
    mode
  } = useProject();
  const { t, language } = useI18n();
  const { settings } = useSettings();

  // Calculate metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    return new Date(t.dueDate) < new Date();
  }).length;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const totalRisks = risks.length;
  const criticalRisks = risks.filter(r => r.score && r.score >= 15).length;
  const highRisks = risks.filter(r => r.score && r.score >= 10 && r.score < 15).length;

  const totalBacklogItems = backlog.length;
  const totalStoryPoints = backlog.reduce((sum, item) => sum + (item.storyPoints || 0), 0);
  const completedStoryPoints = backlog
    .filter(item => item.status === 'done')
    .reduce((sum, item) => sum + (item.storyPoints || 0), 0);

  const totalRequirements = requirements.length;
  const approvedRequirements = requirements.filter(r => r.status === 'approved').length;
  const implementedRequirements = requirements.filter(r => r.status === 'implemented').length;

  // Task status distribution
  const taskStatusData = [
    { name: language === 'fr' ? 'Terminées' : 'Done', value: tasks.filter(t => t.status === 'done').length },
    { name: language === 'fr' ? 'En cours' : 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length },
    { name: language === 'fr' ? 'À faire' : 'Todo', value: tasks.filter(t => t.status === 'todo').length },
    { name: language === 'fr' ? 'En révision' : 'Review', value: tasks.filter(t => t.status === 'review').length },
    { name: language === 'fr' ? 'Backlog' : 'Backlog', value: tasks.filter(t => t.status === 'backlog').length },
  ];

  // Priority distribution
  const priorityData = [
    { name: language === 'fr' ? 'Critique' : 'Critical', value: tasks.filter(t => t.priority === 'critical').length },
    { name: language === 'fr' ? 'Haute' : 'High', value: tasks.filter(t => t.priority === 'high').length },
    { name: language === 'fr' ? 'Moyenne' : 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
    { name: language === 'fr' ? 'Basse' : 'Low', value: tasks.filter(t => t.priority === 'low').length },
  ];

  // Risk distribution
  const riskData = [
    { name: language === 'fr' ? 'Critique' : 'Critical', value: risks.filter(r => r.score && r.score >= 15).length },
    { name: language === 'fr' ? 'Élevé' : 'High', value: risks.filter(r => r.score && r.score >= 10 && r.score < 15).length },
    { name: language === 'fr' ? 'Moyen' : 'Medium', value: risks.filter(r => r.score && r.score >= 5 && r.score < 10).length },
    { name: language === 'fr' ? 'Faible' : 'Low', value: risks.filter(r => r.score && r.score < 5).length },
  ];

  // Task completion over time (last 7 days simulation)
  const completionData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: format(date, 'MMM dd'),
      completed: Math.floor(Math.random() * 5) + completedTasks - 3,
      total: totalTasks,
    };
  });

  // Team workload
  const teamWorkloadData = teamMembers.slice(0, 5).map(member => ({
    name: member.name.split(' ')[0], // First name only
    allocation: member.allocation || 0,
    capacity: member.capacity || 100,
  }));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {language === 'fr' ? 'Tableau de Bord' : 'Dashboard'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === 'fr' 
            ? 'Vue d\'ensemble de votre projet'
            : 'Overview of your project'}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'fr' ? 'Tâches' : 'Tasks'}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks} / {totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'fr' ? 'Taux de complétion' : 'Completion rate'}
            </p>
            <Progress value={taskCompletionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'fr' ? 'En cours' : 'In Progress'}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'fr' ? 'Tâches actives' : 'Active tasks'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'fr' ? 'Risques' : 'Risks'}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalRisks}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'fr' ? 'Risques critiques' : 'Critical risks'} ({totalRisks} {language === 'fr' ? 'total' : 'total'})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'fr' ? 'Équipe' : 'Team'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'fr' ? 'Membres de l\'équipe' : 'Team members'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(overdueTasks > 0 || criticalRisks > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {overdueTasks > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  {language === 'fr' ? 'Tâches en retard' : 'Overdue Tasks'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{overdueTasks}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'fr' 
                    ? 'Tâches nécessitant une attention immédiate'
                    : 'Tasks requiring immediate attention'}
                </p>
              </CardContent>
            </Card>
          )}

          {criticalRisks > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  {language === 'fr' ? 'Risques critiques' : 'Critical Risks'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{criticalRisks}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'fr' 
                    ? 'Risques nécessitant une action immédiate'
                    : 'Risks requiring immediate action'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{language === 'fr' ? 'Répartition des Tâches' : 'Task Status Distribution'}</CardTitle>
            <CardDescription>
              {language === 'fr' ? 'Distribution par statut' : 'Distribution by status'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'fr' ? 'Répartition par Priorité' : 'Priority Distribution'}</CardTitle>
            <CardDescription>
              {language === 'fr' ? 'Tâches par niveau de priorité' : 'Tasks by priority level'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{language === 'fr' ? 'Évolution de la Complétion' : 'Completion Trend'}</CardTitle>
            <CardDescription>
              {language === 'fr' ? 'Progression sur 7 jours' : 'Progress over 7 days'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#8884d8" name={language === 'fr' ? 'Terminées' : 'Completed'} />
                <Line type="monotone" dataKey="total" stroke="#82ca9d" name={language === 'fr' ? 'Total' : 'Total'} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'fr' ? 'Répartition des Risques' : 'Risk Distribution'}</CardTitle>
            <CardDescription>
              {language === 'fr' ? 'Risques par niveau' : 'Risks by level'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {language === 'fr' ? 'Backlog' : 'Backlog'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBacklogItems}</div>
            <p className="text-sm text-muted-foreground">
              {language === 'fr' ? 'Éléments' : 'Items'} • {totalStoryPoints} {language === 'fr' ? 'points' : 'points'}
            </p>
            {completedStoryPoints > 0 && (
              <div className="mt-2">
                <Progress value={(completedStoryPoints / totalStoryPoints) * 100} />
                <p className="text-xs text-muted-foreground mt-1">
                  {completedStoryPoints} / {totalStoryPoints} {language === 'fr' ? 'points terminés' : 'points completed'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {language === 'fr' ? 'Exigences' : 'Requirements'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequirements}</div>
            <p className="text-sm text-muted-foreground">
              {approvedRequirements} {language === 'fr' ? 'approuvées' : 'approved'} • {implementedRequirements} {language === 'fr' ? 'implémentées' : 'implemented'}
            </p>
            {totalRequirements > 0 && (
              <div className="mt-2">
                <Progress value={(implementedRequirements / totalRequirements) * 100} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {language === 'fr' ? 'WBS' : 'WBS'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wbs.length}</div>
            <p className="text-sm text-muted-foreground">
              {language === 'fr' ? 'Nœuds WBS' : 'WBS Nodes'}
            </p>
            {wbs.length > 0 && (
              <div className="mt-2">
                <Progress value={wbs.reduce((sum, node) => sum + (node.progress || 0), 0) / wbs.length} />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'fr' ? 'Progression moyenne' : 'Average progress'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Workload */}
      {teamWorkloadData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{language === 'fr' ? 'Charge de Travail de l\'Équipe' : 'Team Workload'}</CardTitle>
            <CardDescription>
              {language === 'fr' ? 'Allocation par membre' : 'Allocation per member'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamWorkloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="allocation" fill="#8884d8" name={language === 'fr' ? 'Allocation' : 'Allocation'} />
                <Bar dataKey="capacity" fill="#82ca9d" name={language === 'fr' ? 'Capacité' : 'Capacity'} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

