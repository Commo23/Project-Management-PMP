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

const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE'];

export function RiskTrendChart() {
  const { risks } = useProject();
  const { t, language } = useI18n();

  const riskByLevel = useMemo(() => {
    return [
      {
        name: language === 'fr' ? 'Critique' : 'Critical',
        value: risks.filter(r => r.score && r.score >= 15).length,
        color: '#FF8042',
      },
      {
        name: language === 'fr' ? 'Élevé' : 'High',
        value: risks.filter(r => r.score && r.score >= 10 && r.score < 15).length,
        color: '#FFBB28',
      },
      {
        name: language === 'fr' ? 'Moyen' : 'Medium',
        value: risks.filter(r => r.score && r.score >= 5 && r.score < 10).length,
        color: '#00C49F',
      },
      {
        name: language === 'fr' ? 'Faible' : 'Low',
        value: risks.filter(r => r.score && r.score < 5).length,
        color: '#0088FE',
      },
    ];
  }, [risks, language]);

  const riskByStatus = useMemo(() => {
    return [
      {
        name: language === 'fr' ? 'Identifié' : 'Identified',
        value: risks.filter(r => r.status === 'identified').length,
      },
      {
        name: language === 'fr' ? 'En cours' : 'In Progress',
        value: risks.filter(r => r.status === 'in-progress').length,
      },
      {
        name: language === 'fr' ? 'Mitigé' : 'Mitigated',
        value: risks.filter(r => r.status === 'mitigated').length,
      },
      {
        name: language === 'fr' ? 'Fermé' : 'Closed',
        value: risks.filter(r => r.status === 'closed').length,
      },
    ];
  }, [risks, language]);

  const riskByCategory = useMemo(() => {
    const categories = new Map<string, number>();
    risks.forEach(risk => {
      const category = risk.category || (language === 'fr' ? 'Autre' : 'Other');
      categories.set(category, (categories.get(category) || 0) + 1);
    });
    return Array.from(categories.entries()).map(([name, value]) => ({ name, value }));
  }, [risks, language]);

  const riskTrend = useMemo(() => {
    // Simulate trend over last 7 days
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      // In a real app, this would track actual risk counts over time
      const baseCount = risks.length;
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: baseCount + Math.floor(Math.random() * 3) - 1,
        critical: risks.filter(r => r.score && r.score >= 15).length + Math.floor(Math.random() * 2),
      };
    });
  }, [risks]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{language === 'fr' ? 'Risques par Niveau' : 'Risks by Level'}</CardTitle>
          <CardDescription>
            {language === 'fr' 
              ? 'Distribution des risques par niveau de criticité'
              : 'Risk distribution by severity level'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskByLevel}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskByLevel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'fr' ? 'Risques par Statut' : 'Risks by Status'}</CardTitle>
          <CardDescription>
            {language === 'fr' 
              ? 'Distribution des risques par statut'
              : 'Risk distribution by status'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'fr' ? 'Tendance des Risques' : 'Risk Trend'}</CardTitle>
          <CardDescription>
            {language === 'fr' 
              ? 'Évolution du nombre de risques sur 7 jours'
              : 'Risk count evolution over 7 days'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={riskTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name={language === 'fr' ? 'Total' : 'Total'}
              />
              <Line
                type="monotone"
                dataKey="critical"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                name={language === 'fr' ? 'Critiques' : 'Critical'}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'fr' ? 'Risques par Catégorie' : 'Risks by Category'}</CardTitle>
          <CardDescription>
            {language === 'fr' 
              ? 'Distribution des risques par catégorie'
              : 'Risk distribution by category'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="hsl(var(--accent))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

