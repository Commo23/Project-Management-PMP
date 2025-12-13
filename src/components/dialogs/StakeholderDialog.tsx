import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stakeholder } from '@/types/project';
import { useProject } from '@/contexts/ProjectContext';

interface StakeholderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stakeholder?: Stakeholder;
}

export function StakeholderDialog({ open, onOpenChange, stakeholder }: StakeholderDialogProps) {
  const { addStakeholder, updateStakeholder } = useProject();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    organization: '',
    influence: 'medium' as Stakeholder['influence'],
    interest: 'medium' as Stakeholder['interest'],
    engagementLevel: 'neutral' as Stakeholder['engagementLevel'],
  });

  useEffect(() => {
    if (stakeholder) {
      setFormData({
        name: stakeholder.name,
        role: stakeholder.role,
        organization: stakeholder.organization,
        influence: stakeholder.influence,
        interest: stakeholder.interest,
        engagementLevel: stakeholder.engagementLevel,
      });
    } else {
      setFormData({
        name: '',
        role: '',
        organization: '',
        influence: 'medium',
        interest: 'medium',
        engagementLevel: 'neutral',
      });
    }
  }, [stakeholder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stakeholder) {
      updateStakeholder(stakeholder.id, formData);
    } else {
      addStakeholder(formData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{stakeholder ? 'Modifier la partie prenante' : 'Nouvelle partie prenante'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organisation</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Influence</Label>
              <Select value={formData.influence} onValueChange={(v) => setFormData({ ...formData, influence: v as Stakeholder['influence'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Intérêt</Label>
              <Select value={formData.interest} onValueChange={(v) => setFormData({ ...formData, interest: v as Stakeholder['interest'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Bas</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="high">Haut</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Niveau d'engagement</Label>
            <Select value={formData.engagementLevel} onValueChange={(v) => setFormData({ ...formData, engagementLevel: v as Stakeholder['engagementLevel'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unaware">Non informé</SelectItem>
                <SelectItem value="resistant">Résistant</SelectItem>
                <SelectItem value="neutral">Neutre</SelectItem>
                <SelectItem value="supportive">Supporteur</SelectItem>
                <SelectItem value="leading">Leader</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">{stakeholder ? 'Modifier' : 'Créer'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
