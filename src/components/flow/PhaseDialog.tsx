import { useState, useEffect } from 'react';
import { Phase, PhaseType } from '@/types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface PhaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phase?: Phase | null;
  phases?: Phase[]; // All phases for position selection
  onSave: (phase: Omit<Phase, 'id' | 'order' | 'isCustom'>, insertAfterPhaseId?: string) => void;
  mode: 'add' | 'edit';
}

export function PhaseDialog({ open, onOpenChange, phase, phases = [], onSave, mode }: PhaseDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<PhaseType>('custom');
  const [description, setDescription] = useState('');
  const [inputs, setInputs] = useState<string[]>([]);
  const [outputs, setOutputs] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [newInput, setNewInput] = useState('');
  const [newOutput, setNewOutput] = useState('');
  const [newTool, setNewTool] = useState('');
  const [insertAfterPhaseId, setInsertAfterPhaseId] = useState<string>('end');

  useEffect(() => {
    if (phase && mode === 'edit') {
      setName(phase.name);
      setType(phase.type);
      setDescription(phase.description);
      setInputs(phase.inputs);
      setOutputs(phase.outputs);
      setTools(phase.tools);
      setInsertAfterPhaseId('end');
    } else {
      // Reset for add mode
      setName('');
      setType('custom');
      setDescription('');
      setInputs([]);
      setOutputs([]);
      setTools([]);
      setInsertAfterPhaseId('end');
    }
    setNewInput('');
    setNewOutput('');
    setNewTool('');
  }, [phase, mode, open]);

  const handleAddInput = () => {
    if (newInput.trim()) {
      setInputs([...inputs, newInput.trim()]);
      setNewInput('');
    }
  };

  const handleAddOutput = () => {
    if (newOutput.trim()) {
      setOutputs([...outputs, newOutput.trim()]);
      setNewOutput('');
    }
  };

  const handleAddTool = () => {
    if (newTool.trim()) {
      setTools([...tools, newTool.trim()]);
      setNewTool('');
    }
  };

  const handleRemoveInput = (index: number) => {
    setInputs(inputs.filter((_, i) => i !== index));
  };

  const handleRemoveOutput = (index: number) => {
    setOutputs(outputs.filter((_, i) => i !== index));
  };

  const handleRemoveTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim() || !description.trim()) {
      return;
    }

    const phaseData = {
      name: name.trim(),
      type,
      description: description.trim(),
      inputs,
      outputs,
      tools,
    };

    if (mode === 'add') {
      onSave(phaseData, insertAfterPhaseId === 'end' ? undefined : insertAfterPhaseId);
    } else {
      onSave(phaseData);
    }

    onOpenChange(false);
  };

  const phaseTypes: { value: PhaseType; label: string }[] = [
    { value: 'initiation', label: 'Initiation' },
    { value: 'planning', label: 'Planning' },
    { value: 'execution', label: 'Execution' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'closing', label: 'Closing' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add Custom Phase' : 'Edit Phase'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Phase Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Design Phase, Testing Phase"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Phase Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as PhaseType)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {phaseTypes.map((pt) => (
                    <SelectItem key={pt.value} value={pt.value}>
                      {pt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {mode === 'add' && phases.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="position">Insert After</Label>
                <Select value={insertAfterPhaseId} onValueChange={setInsertAfterPhaseId}>
                  <SelectTrigger id="position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="end">At the end</SelectItem>
                    {phases.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        After: {p.name} (Phase {p.order})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose where to insert this phase in the project flow
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose and objectives of this phase..."
                rows={3}
              />
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-2">
            <Label>Inputs</Label>
            <div className="flex gap-2">
              <Input
                value={newInput}
                onChange={(e) => setNewInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddInput()}
                placeholder="Add an input..."
              />
              <Button type="button" size="icon" onClick={handleAddInput}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {inputs.map((input, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {input}
                  <button
                    type="button"
                    onClick={() => handleRemoveInput(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Outputs */}
          <div className="space-y-2">
            <Label>Outputs</Label>
            <div className="flex gap-2">
              <Input
                value={newOutput}
                onChange={(e) => setNewOutput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddOutput()}
                placeholder="Add an output..."
              />
              <Button type="button" size="icon" onClick={handleAddOutput}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {outputs.map((output, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {output}
                  <button
                    type="button"
                    onClick={() => handleRemoveOutput(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Tools & Techniques */}
          <div className="space-y-2">
            <Label>Tools & Techniques</Label>
            <div className="flex gap-2">
              <Input
                value={newTool}
                onChange={(e) => setNewTool(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTool()}
                placeholder="Add a tool or technique..."
              />
              <Button type="button" size="icon" onClick={handleAddTool}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tools.map((tool, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {tool}
                  <button
                    type="button"
                    onClick={() => handleRemoveTool(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !description.trim()}>
            {mode === 'add' ? 'Add Phase' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

