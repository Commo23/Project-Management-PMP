import { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { PhaseCard } from './PhaseCard';
import { PhaseDetail } from './PhaseDetail';
import { PhaseDialog } from './PhaseDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Phase } from '@/types/project';

export function ProjectFlow() {
  const { 
    phases, 
    selectedPhase, 
    setSelectedPhase, 
    mode,
    addCustomPhase,
    updatePhase,
    deletePhase
  } = useProject();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');

  const handleAddPhase = () => {
    setEditingPhase(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleEditPhase = (phase: Phase) => {
    setEditingPhase(phase);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleSavePhase = (phaseData: Omit<Phase, 'id' | 'order' | 'isCustom'>, insertAfterPhaseId?: string) => {
    if (dialogMode === 'add') {
      addCustomPhase(phaseData, insertAfterPhaseId);
    } else if (editingPhase) {
      updatePhase(editingPhase.id, {
        ...phaseData,
        isCustom: true,
      });
      // Update selected phase if it's the one being edited
      if (selectedPhase?.id === editingPhase.id) {
        setSelectedPhase({
          ...editingPhase,
          ...phaseData,
          isCustom: true,
        });
      }
    }
    setDialogOpen(false);
    setEditingPhase(null);
  };

  const handleDeletePhase = (phaseId: string) => {
    deletePhase(phaseId);
  };

  const getModeDescription = () => {
    switch (mode) {
      case 'waterfall':
        return 'Sequential project phases following PMBOK 7th Edition methodology';
      case 'agile':
        return 'Iterative development cycle with continuous delivery (PMI Agile/Scrum aligned)';
      case 'hybrid':
        return 'Combining waterfall structure with agile practices for flexible project management';
      default:
        return 'Project management flow';
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-foreground">Project Flow</h1>
          <p className="mt-2 text-muted-foreground">
            {getModeDescription()}
          </p>
        </div>
        <Button onClick={handleAddPhase} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add Custom Phase
        </Button>
      </div>

      {/* Flow Visualization */}
      <div className="w-full overflow-x-auto">
        <div className="rounded-xl border border-border bg-card/50 p-4 md:p-8 min-w-fit">
          <div className="flex items-center justify-center gap-4 flex-wrap lg:flex-nowrap">
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
      </div>

      {/* Phase Detail Panel */}
      {selectedPhase && (
        <PhaseDetail
          phase={selectedPhase}
          onClose={() => setSelectedPhase(null)}
          onEdit={handleEditPhase}
          onDelete={handleDeletePhase}
        />
      )}

      {/* Empty State */}
      {!selectedPhase && (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
          <p className="text-muted-foreground">
            Click on a phase above to see its inputs, outputs, and tools
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Or add a custom phase to tailor the flow to your project needs
          </p>
        </div>
      )}

      {/* Phase Dialog */}
      <PhaseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        phase={editingPhase}
        phases={phases}
        mode={dialogMode}
        onSave={handleSavePhase}
      />
    </div>
  );
}
