import { BacklogItem, TaskTag } from '@/types/project';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  GripVertical, 
  Bug, 
  Zap, 
  Wrench, 
  HelpCircle, 
  Layers,
  FileText,
  Edit,
  MoreVertical,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface BacklogItemCardProps {
  item: BacklogItem;
  tags?: TaskTag[];
  onEdit?: (item: BacklogItem) => void;
  onDelete?: (itemId: string) => void;
  onClick?: (item: BacklogItem) => void;
  isCompact?: boolean;
}

const typeIcons = {
  epic: Layers,
  feature: Zap,
  story: FileText,
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

const statusStyles: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  refined: 'bg-info/20 text-info',
  ready: 'bg-success/20 text-success',
  'in-sprint': 'bg-primary/20 text-primary',
  done: 'bg-success text-success-foreground',
  archived: 'bg-muted text-muted-foreground',
};

const moscowStyles = {
  'must-have': 'bg-destructive/20 text-destructive border-destructive/50',
  'should-have': 'bg-warning/20 text-warning border-warning/50',
  'could-have': 'bg-info/20 text-info border-info/50',
  'won\'t-have': 'bg-muted text-muted-foreground border-muted',
};

export function BacklogItemCard({ 
  item, 
  tags = [], 
  onEdit, 
  onDelete, 
  onClick,
  isCompact = false 
}: BacklogItemCardProps) {
  const Icon = typeIcons[item.type] || FileText;
  const itemTags = (tags && item.tags) ? tags.filter(tag => item.tags?.includes(tag.id)) : [];
  const valueEffortRatio = (item.businessValue && item.effort) ? item.businessValue / item.effort : 0;

  if (isCompact) {
    return (
      <div
        onClick={() => onClick?.(item)}
        className={cn(
          "group flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 cursor-pointer hover:border-primary/50 transition-colors",
          onClick && "cursor-pointer"
        )}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate text-sm">{item.title}</p>
          {item.userStory && item.userStory.asA && (
            <p className="text-xs text-muted-foreground truncate">
              As a {item.userStory.asA}, I want {item.userStory.iWant}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.storyPoints && (
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary">
              {item.storyPoints}
            </span>
          )}
          <Badge className={cn("text-xs", priorityStyles[item.priority])}>
            {item.priority}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                  className="text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick?.(item)}
      className={cn(
        "group rounded-lg border border-border bg-card p-4 cursor-pointer hover:border-primary/50 transition-all hover:shadow-md",
        onClick && "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
          <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="font-semibold text-foreground">{item.title}</h4>
              <Badge variant="outline" className="text-xs">
                {item.type}
              </Badge>
              {item.status && (
                <Badge className={cn("text-xs", statusStyles[item.status] || statusStyles.draft)}>
                  {item.status}
                </Badge>
              )}
            </div>
            {item.userStory && item.userStory.asA && (
              <div className="text-sm text-muted-foreground mb-2 p-2 rounded bg-muted/30">
                <p><strong>As a</strong> {item.userStory.asA}</p>
                <p><strong>I want</strong> {item.userStory.iWant}</p>
                <p><strong>So that</strong> {item.userStory.soThat}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon-sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Acceptance Criteria Preview */}
      {item.acceptanceCriteria && Array.isArray(item.acceptanceCriteria) && item.acceptanceCriteria.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">
              Acceptance Criteria ({item.acceptanceCriteria.filter(ac => ac?.verified).length}/{item.acceptanceCriteria.length})
            </span>
          </div>
          <div className="space-y-1">
            {item.acceptanceCriteria.slice(0, 2).map((ac) => (
              <div key={ac?.id || Math.random()} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  ac?.verified ? "bg-success" : "bg-muted"
                )} />
                <span className={cn(ac?.verified && "line-through opacity-60")}>
                  {ac?.description}
                </span>
              </div>
            ))}
            {item.acceptanceCriteria.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{item.acceptanceCriteria.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {itemTags && itemTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {itemTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="text-[10px]"
              style={{ borderColor: tag.color, color: tag.color }}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={cn("text-xs", priorityStyles[item.priority])}>
            {item.priority}
          </Badge>
          {item.moscow && (
            <Badge variant="outline" className={cn("text-xs", moscowStyles[item.moscow] || moscowStyles['should-have'])}>
              {item.moscow.replace('-', ' ')}
            </Badge>
          )}
          {item.storyPoints && (
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary">
              {item.storyPoints}
            </span>
          )}
          {item.tShirtSize && (
            <Badge variant="outline" className="text-xs">
              {item.tShirtSize}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {(item.businessValue && item.effort) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>V:{item.businessValue}</span>
              <span>/</span>
              <span>E:{item.effort}</span>
              {valueEffortRatio > 1.5 && (
                <Badge variant="outline" className="text-[10px] bg-success/20 text-success">
                  High Value
                </Badge>
              )}
            </div>
          )}
          {item.risk === 'high' && (
            <AlertCircle className="h-4 w-4 text-warning" />
          )}
        </div>
      </div>
    </div>
  );
}

