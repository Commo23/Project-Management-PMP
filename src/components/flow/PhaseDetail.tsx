import { useState } from 'react';
import { Phase } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, Wrench, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PhaseDetailProps {
  phase: Phase;
  onClose: () => void;
  onEdit?: (phase: Phase) => void;
  onDelete?: (phaseId: string) => void;
}

export function PhaseDetail({ phase, onClose, onEdit, onDelete }: PhaseDetailProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isCustom = phase.isCustom || phase.type === 'custom';

  const handleDelete = () => {
    if (onDelete && isCustom) {
      onDelete(phase.id);
      setShowDeleteDialog(false);
      onClose();
    }
  };

  return (
    <>
      <div className="animate-slide-in rounded-xl border border-border bg-card p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={cn(
                phase.type === 'initiation' && 'bg-phase-initiation',
                phase.type === 'planning' && 'bg-phase-planning',
                phase.type === 'execution' && 'bg-phase-execution',
                phase.type === 'monitoring' && 'bg-phase-monitoring',
                phase.type === 'closing' && 'bg-phase-closing',
                (phase.type === 'custom' || isCustom) && 'bg-primary',
              )}>
                Phase {phase.order}
              </Badge>
              {isCustom && (
                <Badge variant="outline" className="border-primary text-primary">
                  Custom Phase
                </Badge>
              )}
            </div>
            <h2 className="text-2xl font-bold text-foreground">{phase.name}</h2>
            <p className="mt-2 text-muted-foreground">{phase.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {isCustom && onEdit && (
              <Button 
                variant="outline" 
                size="icon-sm" 
                onClick={() => onEdit(phase)}
                title="Edit phase"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {isCustom && onDelete && (
              <Button 
                variant="outline" 
                size="icon-sm" 
                onClick={() => setShowDeleteDialog(true)}
                title="Delete phase"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Inputs */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <ArrowRight className="h-4 w-4 text-accent" />
              Inputs
            </div>
            <ul className="space-y-2">
              {phase.inputs.map((input, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
                  {input}
                </li>
              ))}
            </ul>
          </div>

          {/* Outputs */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <ArrowLeft className="h-4 w-4 text-success" />
              Outputs
            </div>
            <ul className="space-y-2">
              {phase.outputs.map((output, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success" />
                  {output}
                </li>
              ))}
            </ul>
          </div>

          {/* Tools & Techniques */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Wrench className="h-4 w-4 text-warning" />
              Tools & Techniques
            </div>
            <ul className="space-y-2">
              {phase.tools.map((tool, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning" />
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Phase</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{phase.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
