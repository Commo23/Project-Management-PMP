import { useProject } from '@/contexts/ProjectContext';
import { PhaseCard } from './PhaseCard';
import { PhaseDetail } from './PhaseDetail';

export function ProjectFlow() {
  const { phases, selectedPhase, setSelectedPhase, mode } = useProject();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Project Flow</h1>
        <p className="mt-2 text-muted-foreground">
          {mode === 'waterfall' 
            ? 'Sequential project phases following PMBOK methodology'
            : 'Iterative development cycle with continuous delivery'
          }
        </p>
      </div>

      {/* Flow Visualization */}
      <div className="rounded-xl border border-border bg-card/50 p-8">
        <div className="flex flex-wrap items-center justify-center gap-2 lg:flex-nowrap">
          {phases.map((phase, index) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              isActive={selectedPhase?.id === phase.id}
              onClick={() => setSelectedPhase(selectedPhase?.id === phase.id ? null : phase)}
              showConnector={index < phases.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Phase Detail Panel */}
      {selectedPhase && (
        <PhaseDetail
          phase={selectedPhase}
          onClose={() => setSelectedPhase(null)}
        />
      )}

      {/* Empty State */}
      {!selectedPhase && (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
          <p className="text-muted-foreground">
            Click on a phase above to see its inputs, outputs, and tools
          </p>
        </div>
      )}
    </div>
  );
}
