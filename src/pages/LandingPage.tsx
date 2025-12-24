import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle2, 
  ArrowRight, 
  BarChart3, 
  Users, 
  Target, 
  Shield,
  Zap,
  Globe,
  Star,
  ChevronRight
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

export function LandingPage() {
  const { language } = useI18n();
  const isFr = language === 'fr';

  const features = [
    {
      icon: BarChart3,
      title: isFr ? 'Gestion de Projets Multiples' : 'Multi-Project Management',
      description: isFr 
        ? 'Créez et gérez plusieurs projets simultanément avec une interface intuitive'
        : 'Create and manage multiple projects simultaneously with an intuitive interface',
    },
    {
      icon: Target,
      title: isFr ? 'Aligné PMI/PMBOK' : 'PMI/PMBOK Aligned',
      description: isFr
        ? 'Conforme aux standards PMBOK 7e édition et à la certification PMP'
        : 'Compliant with PMBOK 7th Edition standards and PMP certification',
    },
    {
      icon: Users,
      title: isFr ? 'Collaboration Avancée' : 'Advanced Collaboration',
      description: isFr
        ? 'Commentaires, mentions, partage de projets et gestion d\'équipe'
        : 'Comments, mentions, project sharing and team management',
    },
    {
      icon: Shield,
      title: isFr ? 'Gestion des Risques' : 'Risk Management',
      description: isFr
        ? 'Registre de risques complet avec matrice probabilité/impact'
        : 'Comprehensive risk register with probability/impact matrix',
    },
    {
      icon: Zap,
      title: isFr ? 'Méthodologies Flexibles' : 'Flexible Methodologies',
      description: isFr
        ? 'Support Waterfall, Agile et Hybrid selon vos besoins'
        : 'Support for Waterfall, Agile and Hybrid based on your needs',
    },
    {
      icon: Globe,
      title: isFr ? 'Multilingue' : 'Multilingual',
      description: isFr
        ? 'Interface en français et anglais avec terminologie PMP officielle'
        : 'French and English interface with official PMP terminology',
    },
  ];

  const benefits = [
    isFr ? 'Outil tout-en-un pour la gestion de projet' : 'All-in-one project management tool',
    isFr ? 'Templates de projets personnalisables' : 'Customizable project templates',
    isFr ? 'Rapports et graphiques avancés' : 'Advanced reports and charts',
    isFr ? 'Export multi-formats (JSON, CSV, PDF)' : 'Multi-format export (JSON, CSV, PDF)',
    isFr ? 'Intégrations avec outils externes' : 'Integrations with external tools',
    isFr ? 'Mode confidentiel pour données sensibles' : 'Confidential mode for sensitive data',
  ];

  const testimonials = [
    {
      name: isFr ? 'Jean Dupont' : 'John Smith',
      role: isFr ? 'Chef de Projet PMP' : 'PMP Project Manager',
      company: 'TechCorp',
      content: isFr
        ? 'PMP Flow Designer a transformé ma façon de gérer les projets. L\'alignement avec PMBOK est parfait.'
        : 'PMP Flow Designer has transformed how I manage projects. The PMBOK alignment is perfect.',
      rating: 5,
    },
    {
      name: isFr ? 'Marie Martin' : 'Mary Johnson',
      role: isFr ? 'Directrice de Projet' : 'Project Director',
      company: 'InnovateInc',
      content: isFr
        ? 'L\'outil le plus complet que j\'ai utilisé. La gestion des risques et des parties prenantes est exceptionnelle.'
        : 'The most comprehensive tool I\'ve used. Risk and stakeholder management is exceptional.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md">
              <div className="flex flex-col gap-0.5">
                <div className="h-1.5 w-4 rounded bg-white"></div>
                <div className="h-1.5 w-4 rounded bg-white"></div>
                <div className="h-1.5 w-4 rounded bg-white"></div>
              </div>
            </div>
            <span className="text-lg font-bold">PMP Flow Designer</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">{isFr ? 'Connexion' : 'Sign In'}</Button>
            </Link>
            <Link to="/signup">
              <Button>{isFr ? 'Commencer' : 'Get Started'}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm">
            <Star className="h-4 w-4 text-primary" />
            <span>{isFr ? 'Aligné PMBOK 7e Édition' : 'PMBOK 7th Edition Aligned'}</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            {isFr 
              ? 'Gestion de Projet Professionnelle'
              : 'Professional Project Management'}
          </h1>
          <p className="mb-8 text-xl text-muted-foreground md:text-2xl">
            {isFr
              ? 'Outil tout-en-un pour gérer vos projets selon les standards PMI/PMP. Support Waterfall, Agile et Hybrid.'
              : 'All-in-one tool to manage your projects according to PMI/PMP standards. Support for Waterfall, Agile and Hybrid.'}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/signup">
              <Button size="lg" className="gap-2">
                {isFr ? 'Commencer Gratuitement' : 'Get Started Free'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="gap-2">
                {isFr ? 'Compte Démo' : 'Demo Account'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {isFr 
              ? 'Compte de démonstration disponible : demo@pmpflow.com / demo123'
              : 'Demo account available: demo@pmpflow.com / demo123'}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              {isFr ? 'Fonctionnalités Principales' : 'Key Features'}
            </h2>
            <p className="text-muted-foreground">
              {isFr
                ? 'Tout ce dont vous avez besoin pour gérer vos projets efficacement'
                : 'Everything you need to manage your projects effectively'}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              {isFr ? 'Pourquoi Choisir PMP Flow Designer ?' : 'Why Choose PMP Flow Designer?'}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              {isFr ? 'Témoignages' : 'Testimonials'}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="mb-2 flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription>{testimonial.content}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} • {testimonial.company}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            {isFr ? 'Prêt à Commencer ?' : 'Ready to Get Started?'}
          </h2>
          <p className="mb-6 text-muted-foreground">
            {isFr
              ? 'Rejoignez des centaines de chefs de projet qui utilisent PMP Flow Designer'
              : 'Join hundreds of project managers using PMP Flow Designer'}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/signup">
              <Button size="lg" className="gap-2">
                {isFr ? 'Créer un Compte' : 'Create Account'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                {isFr ? 'Se Connecter' : 'Sign In'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600">
                <div className="flex flex-col gap-0.5">
                  <div className="h-1 w-3 rounded bg-white"></div>
                  <div className="h-1 w-3 rounded bg-white"></div>
                </div>
              </div>
              <span className="font-semibold">PMP Flow Designer</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {isFr 
                ? '© 2026 PMP Flow Designer. Tous droits réservés.'
                : '© 2026 PMP Flow Designer. All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

