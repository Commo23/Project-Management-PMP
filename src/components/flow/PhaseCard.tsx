import { Phase } from '@/types/project';
import { cn } from '@/lib/utils';
import { 
  Rocket, 
  FileText, 
  Play, 
  Eye, 
  CheckCircle2,
  ChevronRight 
} from 'lucide-react';

interface PhaseCardProps {
  phase: Phase;
  isActive: boolean;
  onClick: () => void;
  showConnector?: boolean;
}

const phaseIcons = {
  initiation: Rocket,
  planning: FileText,
  execution: Play,
  monitoring: Eye,
  closing: CheckCircle2,
  custom: FileText,
};

const phaseStyles = {
  initiation: 'phase-initiation border-phase-initiation/30 hover:border-phase-initiation',
  planning: 'phase-planning border-phase-planning/30 hover:border-phase-planning',
  execution: 'phase-execution border-phase-execution/30 hover:border-phase-execution',
  monitoring: 'phase-monitoring border-phase-monitoring/30 hover:border-phase-monitoring',
  closing: 'phase-closing border-phase-closing/30 hover:border-phase-closing',
  custom: 'border-primary/30 hover:border-primary bg-primary/5',
};

const phaseGradients = {
  initiation: 'from-phase-initiation/20 to-transparent',
  planning: 'from-phase-planning/20 to-transparent',
  execution: 'from-phase-execution/20 to-transparent',
  monitoring: 'from-phase-monitoring/20 to-transparent',
  closing: 'from-phase-closing/20 to-transparent',
  custom: 'from-primary/20 to-transparent',
};

export function PhaseCard({ phase, isActive, onClick, showConnector = true }: PhaseCardProps) {
  const Icon = phaseIcons[phase.type] || phaseIcons.custom;
  const isCustom = phase.isCustom || phase.type === 'custom';
  
  return (
    <div className="flex items-center">
      <button
        onClick={onClick}
        className={cn(
          "group relative flex w-48 flex-col rounded-xl border-2 bg-card p-4 text-left transition-all duration-300",
          phaseStyles[phase.type] || phaseStyles.custom,
          isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg scale-105"
        )}
      >
        {/* Gradient overlay */}
        <div className={cn(
          "absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          phaseGradients[phase.type] || phaseGradients.custom
        )} />
        
        <div className="relative z-10">
          {/* Icon and Order */}
          <div className="mb-3 flex items-center justify-between">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isCustom 
                ? "bg-primary/20" 
                : `bg-phase-${phase.type}/20`
            )}>
              <Icon className={cn(
                "h-5 w-5",
                isCustom 
                  ? "text-primary" 
                  : `text-phase-${phase.type}`
              )} />
            </div>
            <div className="flex items-center gap-1">
              {isCustom && (
                <span className="text-[10px] text-primary font-semibold">CUSTOM</span>
              )}
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                {phase.order}
              </span>
            </div>
          </div>
          
          {/* Title */}
          <h3 className="font-semibold text-foreground">{phase.name}</h3>
          
          {/* Description */}
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {phase.description}
          </p>
          
          {/* Quick stats */}
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            <span>{phase.inputs.length} inputs</span>
            <span>{phase.outputs.length} outputs</span>
          </div>
        </div>
      </button>
      
      {/* Connector */}
      {showConnector && (
        <div className="flex items-center px-2">
          <div className="h-px w-8 bg-border" />
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
