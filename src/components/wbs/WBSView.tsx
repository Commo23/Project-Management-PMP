import { useProject } from '@/contexts/ProjectContext';
import { cn } from '@/lib/utils';
import { ChevronRight, FolderOpen, File } from 'lucide-react';

export function WBSView() {
  const { wbs } = useProject();

  const rootNodes = wbs.filter(node => !node.parentId);

  const renderNode = (node: typeof wbs[0], depth: number = 0) => {
    const children = wbs.filter(n => n.parentId === node.id);
    const hasChildren = children.length > 0;

    return (
      <div key={node.id} className="animate-fade-in">
        <div
          className={cn(
            "group flex items-center gap-3 rounded-lg border border-transparent p-3 transition-all hover:border-border hover:bg-muted/50",
          )}
          style={{ marginLeft: depth * 24 }}
        >
          {hasChildren ? (
            <FolderOpen className="h-4 w-4 text-warning" />
          ) : (
            <File className="h-4 w-4 text-muted-foreground" />
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-primary">{node.code}</span>
              <span className="font-medium text-foreground">{node.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">{node.description}</p>
          </div>

          {hasChildren && (
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>

        {hasChildren && (
          <div className="border-l border-border ml-6">
            {children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Work Breakdown Structure</h1>
        <p className="mt-2 text-muted-foreground">
          Hierarchical decomposition of project deliverables
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="space-y-1">
          {rootNodes.map(node => renderNode(node))}
        </div>
      </div>

      {/* WBS Dictionary */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/50 p-4">
          <h2 className="font-semibold text-foreground">WBS Dictionary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Code</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Description</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Level</th>
              </tr>
            </thead>
            <tbody>
              {wbs.map((node, index) => (
                <tr 
                  key={node.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/30",
                    index % 2 === 0 && "bg-muted/10"
                  )}
                >
                  <td className="p-3 font-mono text-sm text-primary">{node.code}</td>
                  <td className="p-3 font-medium text-foreground">{node.name}</td>
                  <td className="p-3 text-sm text-muted-foreground">{node.description}</td>
                  <td className="p-3 text-sm text-muted-foreground">{node.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
