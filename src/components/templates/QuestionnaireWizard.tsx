import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuestionnaireAnswers {
  projectType: 'software' | 'construction' | 'marketing' | 'event' | 'product' | 'research' | 'consulting' | 'other';
  projectSize: 'small' | 'medium' | 'large' | 'enterprise';
  teamSize: '1-5' | '6-10' | '11-20' | '21-50' | '50+';
  methodology: 'waterfall' | 'agile' | 'hybrid' | 'not-sure';
  timeline: '1-3months' | '3-6months' | '6-12months' | '12+months';
  budget: 'low' | 'medium' | 'high' | 'enterprise';
  complexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
  industry: string;
  specificNeeds: string[];
  customDescription?: string;
}

interface QuestionnaireWizardProps {
  onComplete: (answers: QuestionnaireAnswers) => void;
  onCancel: () => void;
}

const questions = [
  {
    id: 'projectType',
    question: 'What type of project are you managing?',
    questionFr: 'Quel type de projet gérez-vous ?',
    type: 'select',
    options: [
      { value: 'software', label: 'Software Development', labelFr: 'Développement Logiciel', icon: '💻' },
      { value: 'construction', label: 'Construction', labelFr: 'Construction', icon: '🏗️' },
      { value: 'marketing', label: 'Marketing Campaign', labelFr: 'Campagne Marketing', icon: '📢' },
      { value: 'event', label: 'Event Planning', labelFr: 'Planification d\'Événement', icon: '🎉' },
      { value: 'product', label: 'Product Launch', labelFr: 'Lancement de Produit', icon: '📦' },
      { value: 'research', label: 'Research & Development', labelFr: 'Recherche & Développement', icon: '🔬' },
      { value: 'consulting', label: 'Consulting Project', labelFr: 'Projet de Conseil', icon: '💼' },
      { value: 'other', label: 'Other', labelFr: 'Autre', icon: '📄' },
    ],
  },
  {
    id: 'projectSize',
    question: 'What is the size of your project?',
    questionFr: 'Quelle est la taille de votre projet ?',
    type: 'radio',
    options: [
      { value: 'small', label: 'Small (1-10 tasks, < 1 month)', labelFr: 'Petit (1-10 tâches, < 1 mois)' },
      { value: 'medium', label: 'Medium (10-50 tasks, 1-3 months)', labelFr: 'Moyen (10-50 tâches, 1-3 mois)' },
      { value: 'large', label: 'Large (50-200 tasks, 3-12 months)', labelFr: 'Grand (50-200 tâches, 3-12 mois)' },
      { value: 'enterprise', label: 'Enterprise (200+ tasks, 12+ months)', labelFr: 'Entreprise (200+ tâches, 12+ mois)' },
    ],
  },
  {
    id: 'teamSize',
    question: 'How many team members will work on this project?',
    questionFr: 'Combien de membres d\'équipe travailleront sur ce projet ?',
    type: 'radio',
    options: [
      { value: '1-5', label: '1-5 people', labelFr: '1-5 personnes' },
      { value: '6-10', label: '6-10 people', labelFr: '6-10 personnes' },
      { value: '11-20', label: '11-20 people', labelFr: '11-20 personnes' },
      { value: '21-50', label: '21-50 people', labelFr: '21-50 personnes' },
      { value: '50+', label: '50+ people', labelFr: '50+ personnes' },
    ],
  },
  {
    id: 'methodology',
    question: 'Which project methodology do you prefer?',
    questionFr: 'Quelle méthodologie de projet préférez-vous ?',
    type: 'radio',
    options: [
      { value: 'waterfall', label: 'Waterfall (Sequential phases)', labelFr: 'Waterfall (Phases séquentielles)' },
      { value: 'agile', label: 'Agile (Iterative sprints)', labelFr: 'Agile (Sprints itératifs)' },
      { value: 'hybrid', label: 'Hybrid (Combination)', labelFr: 'Hybride (Combinaison)' },
      { value: 'not-sure', label: 'Not sure / Let the system decide', labelFr: 'Pas sûr / Laisser le système décider' },
    ],
  },
  {
    id: 'timeline',
    question: 'What is your project timeline?',
    questionFr: 'Quel est le délai de votre projet ?',
    type: 'radio',
    options: [
      { value: '1-3months', label: '1-3 months', labelFr: '1-3 mois' },
      { value: '3-6months', label: '3-6 months', labelFr: '3-6 mois' },
      { value: '6-12months', label: '6-12 months', labelFr: '6-12 mois' },
      { value: '12+months', label: '12+ months', labelFr: '12+ mois' },
    ],
  },
  {
    id: 'budget',
    question: 'What is your budget level?',
    questionFr: 'Quel est votre niveau de budget ?',
    type: 'radio',
    options: [
      { value: 'low', label: 'Low (< $10K)', labelFr: 'Faible (< 10K€)' },
      { value: 'medium', label: 'Medium ($10K - $100K)', labelFr: 'Moyen (10K€ - 100K€)' },
      { value: 'high', label: 'High ($100K - $1M)', labelFr: 'Élevé (100K€ - 1M€)' },
      { value: 'enterprise', label: 'Enterprise ($1M+)', labelFr: 'Entreprise (1M€+)' },
    ],
  },
  {
    id: 'complexity',
    question: 'How complex is your project?',
    questionFr: 'Quelle est la complexité de votre projet ?',
    type: 'radio',
    options: [
      { value: 'simple', label: 'Simple (Clear requirements, few dependencies)', labelFr: 'Simple (Exigences claires, peu de dépendances)' },
      { value: 'moderate', label: 'Moderate (Some complexity, manageable dependencies)', labelFr: 'Modéré (Quelque complexité, dépendances gérables)' },
      { value: 'complex', label: 'Complex (Multiple stakeholders, many dependencies)', labelFr: 'Complexe (Multiples parties prenantes, nombreuses dépendances)' },
      { value: 'very-complex', label: 'Very Complex (High uncertainty, many moving parts)', labelFr: 'Très Complexe (Forte incertitude, nombreuses parties mobiles)' },
    ],
  },
  {
    id: 'industry',
    question: 'What industry is this project for? (Optional)',
    questionFr: 'Pour quelle industrie est ce projet ? (Optionnel)',
    type: 'input',
    placeholder: 'e.g., Healthcare, Finance, Technology...',
    placeholderFr: 'ex: Santé, Finance, Technologie...',
  },
  {
    id: 'specificNeeds',
    question: 'What specific features do you need? (Select all that apply)',
    questionFr: 'Quelles fonctionnalités spécifiques avez-vous besoin ? (Sélectionnez tout ce qui s\'applique)',
    type: 'multi-select',
    options: [
      { value: 'risk-management', label: 'Risk Management', labelFr: 'Gestion des Risques' },
      { value: 'stakeholder-tracking', label: 'Stakeholder Management', labelFr: 'Gestion des Parties Prenantes' },
      { value: 'requirements-traceability', label: 'Requirements Traceability', labelFr: 'Traçabilité des Exigences' },
      { value: 'wbs', label: 'Work Breakdown Structure (WBS)', labelFr: 'Structure de Découpage du Projet (SDP)' },
      { value: 'raci-matrix', label: 'RACI Matrix', labelFr: 'Matrice RACI' },
      { value: 'gantt-chart', label: 'Gantt Chart / Timeline', labelFr: 'Diagramme de Gantt / Chronologie' },
      { value: 'agile-sprints', label: 'Agile Sprints & Backlog', labelFr: 'Sprints Agile & Backlog' },
      { value: 'team-management', label: 'Team Management', labelFr: 'Gestion d\'Équipe' },
      { value: 'collaboration', label: 'Collaboration & Comments', labelFr: 'Collaboration & Commentaires' },
      { value: 'reporting', label: 'Advanced Reporting', labelFr: 'Rapports Avancés' },
    ],
  },
  {
    id: 'customDescription',
    question: 'Additional project details (Optional)',
    questionFr: 'Détails supplémentaires du projet (Optionnel)',
    type: 'textarea',
    placeholder: 'Describe any specific requirements, constraints, or special considerations...',
    placeholderFr: 'Décrivez toute exigence spécifique, contrainte ou considération particulière...',
  },
];

export function QuestionnaireWizard({ onComplete, onCancel }: QuestionnaireWizardProps) {
  const { language } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({
    specificNeeds: [],
  });

  const isFr = language === 'fr';
  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const isLastStep = currentStep === questions.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      // Validate and complete
      if (validateAnswers()) {
        onComplete(answers as QuestionnaireAnswers);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const validateAnswers = (): boolean => {
    // Check required fields
    if (!answers.projectType || !answers.projectSize || !answers.teamSize || 
        !answers.methodology || !answers.timeline || !answers.budget || !answers.complexity) {
      return false;
    }
    return true;
  };

  const canProceed = (): boolean => {
    const q = currentQuestion;
    if (q.id === 'projectType' && !answers.projectType) return false;
    if (q.id === 'projectSize' && !answers.projectSize) return false;
    if (q.id === 'teamSize' && !answers.teamSize) return false;
    if (q.id === 'methodology' && !answers.methodology) return false;
    if (q.id === 'timeline' && !answers.timeline) return false;
    if (q.id === 'budget' && !answers.budget) return false;
    if (q.id === 'complexity' && !answers.complexity) return false;
    // Industry, specificNeeds, and customDescription are optional
    return true;
  };

  const handleAnswerChange = (value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleMultiSelect = (value: string) => {
    const current = (answers.specificNeeds || []) as string[];
    const newValue = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    handleAnswerChange(newValue);
  };

  const renderQuestion = () => {
    const q = currentQuestion;

    switch (q.type) {
      case 'select':
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {q.options?.map((option) => (
              <Card
                key={option.value}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary",
                  answers[q.id as keyof QuestionnaireAnswers] === option.value && "border-primary border-2"
                )}
                onClick={() => handleAnswerChange(option.value)}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {option.icon && <span className="text-2xl">{option.icon}</span>}
                    <CardTitle className="text-base">
                      {isFr ? option.labelFr : option.label}
                    </CardTitle>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={answers[q.id as keyof QuestionnaireAnswers] as string || ''}
            onValueChange={handleAnswerChange}
          >
            <div className="space-y-3">
              {q.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer flex-1">
                    {isFr ? option.labelFr : option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case 'input':
        return (
          <Input
            value={answers[q.id as keyof QuestionnaireAnswers] as string || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={isFr ? q.placeholderFr : q.placeholder}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={answers[q.id as keyof QuestionnaireAnswers] as string || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={isFr ? q.placeholderFr : q.placeholder}
            rows={5}
          />
        );

      case 'multi-select':
        return (
          <div className="grid gap-3 md:grid-cols-2">
            {q.options?.map((option) => {
              const isSelected = (answers.specificNeeds || []).includes(option.value);
              return (
                <Card
                  key={option.value}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary",
                    isSelected && "border-primary border-2 bg-primary/5"
                  )}
                  onClick={() => handleMultiSelect(option.value)}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    <span className="flex-1">{isFr ? option.labelFr : option.label}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {isFr ? 'Question' : 'Question'} {currentStep + 1} {isFr ? 'sur' : 'of'} {questions.length}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {language === 'fr' ? currentQuestion.questionFr : currentQuestion.question}
          </CardTitle>
          {currentQuestion.type !== 'multi-select' && (
            <CardDescription>
              {isFr 
                ? 'Sélectionnez une option pour continuer'
                : 'Select an option to continue'}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          {renderQuestion()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={isFirstStep ? onCancel : handleBack}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          {isFirstStep 
            ? (isFr ? 'Annuler' : 'Cancel')
            : (isFr ? 'Précédent' : 'Back')
          }
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="gap-2"
        >
          {isLastStep 
            ? (isFr ? 'Générer le Modèle' : 'Generate Template')
            : (isFr ? 'Suivant' : 'Next')
          }
          {!isLastStep && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

