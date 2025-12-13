import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Requirement, TaskPriority } from '@/types/project';
import { useProject } from '@/contexts/ProjectContext';

interface RequirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requirement?: Requirement;
}

export function RequirementDialog({ open, onOpenChange, requirement }: RequirementDialogProps) {
  const { addRequirement, updateRequirement } = useProject();
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    type: 'functional' as Requirement['type'],
    priority: 'medium' as TaskPriority,
    status: 'draft' as Requirement['status'],
  });

  useEffect(() => {
    if (requirement) {
      setFormData({
        code: requirement.code,
        title: requirement.title,
        description: requirement.description,
        type: requirement.type,
        priority: requirement.priority,
        status: requirement.status,
      });
    } else {
      setFormData({
        code: `REQ-${Date.now().toString().slice(-4)}`,
        title: '',
        description: '',
        type: 'functional',
        priority: 'medium',
        status: 'draft',
      });
    }
  }, [requirement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reqData = {
      ...formData,
      linkedTasks: requirement?.linkedTasks || [],
    };

    if (requirement) {
      updateRequirement(requirement.id, reqData);
    } else {
      addRequirement(reqData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{requirement ? 'Modifier l\'exigence' : 'Nouvelle exigence'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as Requirement['type'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="functional">Fonctionnel</SelectItem>
                  <SelectItem value="non-functional">Non-fonctionnel</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="technical">Technique</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as TaskPriority })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as Requirement['status'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="implemented">Implémenté</SelectItem>
                  <SelectItem value="verified">Vérifié</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">{requirement ? 'Modifier' : 'Créer'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
