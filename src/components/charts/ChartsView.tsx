import { useProject } from '@/contexts/ProjectContext';
import { useI18n } from '@/contexts/I18nContext';
import { GanttChart } from './GanttChart';
import { BurndownChart } from './BurndownChart';
import { VelocityChart } from './VelocityChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressChart } from './ProgressChart';
import { RiskTrendChart } from './RiskTrendChart';

export function ChartsView() {
  const { mode } = useProject();
  const { t, language } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'fr' ? 'Graphiques et Rapports du Projet' : 'Project Charts & Reports'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {language === 'fr' 
            ? 'Analyses visuelles pour suivre la progression du projet. Utilisez les onglets ci-dessous pour accéder aux différents rapports (Burndown, Velocity, Progression, Risques).'
            : 'Visual analytics for tracking project progress. Use the tabs below to access different reports (Burndown, Velocity, Progress, Risks).'}
        </p>
      </div>

      <Tabs defaultValue={mode === 'agile' ? 'agile' : 'waterfall'} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="waterfall">
            {language === 'fr' ? 'Waterfall' : 'Waterfall'}
          </TabsTrigger>
          <TabsTrigger value="agile">
            {language === 'fr' ? 'Agile (Burndown/Velocity)' : 'Agile (Burndown/Velocity)'}
          </TabsTrigger>
          <TabsTrigger value="progress">
            {language === 'fr' ? 'Progression' : 'Progress'}
          </TabsTrigger>
          <TabsTrigger value="risks">
            {language === 'fr' ? 'Risques' : 'Risks'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="waterfall" className="space-y-6">
          <GanttChart />
        </TabsContent>

        <TabsContent value="agile" className="space-y-6">
          <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 p-4 mb-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>{language === 'fr' ? 'Rapports Agile :' : 'Agile Reports:'}</strong> {language === 'fr' 
                ? 'Ces graphiques montrent le Burndown (travail restant) et la Vélocité (points d\'histoire complétés) de votre équipe.'
                : 'These charts show the Burndown (remaining work) and Velocity (completed story points) of your team.'}
            </p>
          </div>
          <BurndownChart />
          <VelocityChart />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <ProgressChart />
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <RiskTrendChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}
