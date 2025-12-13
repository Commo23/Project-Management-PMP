import { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GripVertical, Bug, Zap, Wrench, HelpCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import { BacklogItem } from '@/types/project';
import { BacklogItemDialog } from '@/components/dialogs/BacklogItemDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';

const typeIcons = {
  feature: Zap,
  bug: Bug,
  technical: Wrench,
  spike: HelpCircle,
};

const priorityStyles = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/20 text-info',
  high: 'bg-warning/20 text-warning',
  critical: 'bg-destructive/20 text-destructive',
};

export function BacklogView() {
  const { backlog, sprints, moveBacklogItem, deleteBacklogItem } = useProject();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BacklogItem | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const productBacklog = backlog.filter(item => !item.sprintId);
  const sprintBacklog = sprints.map(sprint => ({
    ...sprint,
    items: backlog.filter(item => item.sprintId === sprint.id),
  }));

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, sprintId?: string) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      moveBacklogItem(itemId, sprintId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleAdd = () => {
    setSelectedItem(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (item: BacklogItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleDeleteClick = (itemId: string) => {
    setItemToDelete(itemId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteBacklogItem(itemToDelete);
      setItemToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Backlog</h1>
          <p className="mt-2 text-muted-foreground">
            Priorisez et assignez les éléments aux sprints
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvel élément
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Backlog */}
        <div 
          className="rounded-xl border border-border bg-card"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, undefined)}
        >
          <div className="border-b border-border p-4">
            <h2 className="font-semibold text-foreground">Product Backlog</h2>
            <p className="text-sm text-muted-foreground">
              {productBacklog.reduce((sum, item) => sum + item.storyPoints, 0)} points au total
            </p>
          </div>
          <div className="max-h-[500px] overflow-y-auto p-4 space-y-2 scrollbar-thin">
            {productBacklog.map((item) => {
              const Icon = typeIcons[item.type];
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 cursor-grab hover:border-primary/50 transition-colors active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <Badge className={cn("text-xs flex-shrink-0", priorityStyles[item.priority])}>
                    {item.priority}
                  </Badge>
                  <span className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary flex-shrink-0">
                    {item.storyPoints}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => handleEdit(item)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDeleteClick(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {productBacklog.length === 0 && (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
                <p className="text-sm text-muted-foreground">Déposez des éléments ici</p>
              </div>
            )}
          </div>
        </div>

        {/* Sprint Backlogs */}
        <div className="space-y-4">
          {sprintBacklog.map((sprint) => (
            <div
              key={sprint.id}
              className="rounded-xl border border-border bg-card"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, sprint.id)}
            >
              <div className="border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{sprint.name}</h3>
                  <Badge variant="outline">
                    {sprint.items.reduce((sum, item) => sum + item.storyPoints, 0)} pts
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{sprint.goal}</p>
              </div>
              <div className="p-4 space-y-2 min-h-[100px]">
                {sprint.items.map((item) => {
                  const Icon = typeIcons[item.type];
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      className="group flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2 cursor-grab hover:border-primary/50 transition-colors"
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      <Icon className="h-3 w-3 text-muted-foreground" />
                      <span className="flex-1 text-sm text-foreground truncate">{item.title}</span>
                      <span className="text-xs font-medium text-primary">{item.storyPoints}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon-sm" className="h-5 w-5" onClick={() => handleEdit(item)}>
                          <Pencil className="h-2.5 w-2.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="h-5 w-5 text-destructive hover:text-destructive" onClick={() => handleDeleteClick(item.id)}>
                          <Trash2 className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {sprint.items.length === 0 && (
                  <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-border">
                    <p className="text-xs text-muted-foreground">Déposez des éléments ici</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BacklogItemDialog open={dialogOpen} onOpenChange={setDialogOpen} item={selectedItem} />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer l'élément"
        description="Êtes-vous sûr de vouloir supprimer cet élément du backlog ? Cette action est irréversible."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
