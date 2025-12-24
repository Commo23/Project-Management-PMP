import { useState, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { BacklogItem, BacklogItemStatus, BacklogItemType, MoSCoW } from '@/types/project';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Plus, Search, Filter, X, Grid, List, BarChart3, TrendingUp } from 'lucide-react';
import { BacklogItemCard } from './BacklogItemCard';
import { BacklogItemDialog } from './BacklogItemDialog';
import { sampleTags } from '@/data/projectData';

export function BacklogView() {
  const { backlog, sprints, moveBacklogItem, reorderBacklog, setBacklog, taskTags } = useProject();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterMoscow, setFilterMoscow] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'order' | 'priority' | 'value' | 'effort' | 'value-effort'>('order');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BacklogItem | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedItem, setSelectedItem] = useState<BacklogItem | null>(null);
  const [initialSprintId, setInitialSprintId] = useState<string | undefined>(undefined);

  const tags = taskTags || sampleTags;

  const productBacklog = backlog.filter(item => !item.sprintId);
  const sprintBacklog = sprints.map(sprint => ({
    ...sprint,
    items: backlog.filter(item => item.sprintId === sprint.id),
  }));

  // Filter and sort product backlog
  const filteredBacklog = useMemo(() => {
    let filtered = productBacklog.filter(item => {
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.userStory && item.userStory.asA && (
          item.userStory.asA.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.userStory.iWant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.userStory.soThat?.toLowerCase().includes(searchQuery.toLowerCase())
        ));
      
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesStatus = filterStatus === 'all' || (item.status || 'draft') === filterStatus;
      const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
      const matchesMoscow = filterMoscow === 'all' || (item.moscow || 'should-have') === filterMoscow;

      return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesMoscow;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'value':
          return (b.businessValue || 0) - (a.businessValue || 0);
        case 'effort':
          return (a.effort || 0) - (b.effort || 0);
        case 'value-effort':
          const aRatio = (a.businessValue && a.effort) ? a.businessValue / a.effort : 0;
          const bRatio = (b.businessValue && b.effort) ? b.businessValue / b.effort : 0;
          return bRatio - aRatio;
        default:
          return a.order - b.order;
      }
    });

    return filtered;
  }, [productBacklog, searchQuery, filterType, filterStatus, filterPriority, filterMoscow, sortBy]);

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

  const handleAddItem = (sprintId?: string) => {
    setEditingItem(null);
    setDialogMode('add');
    setInitialSprintId(sprintId);
    setDialogOpen(true);
  };

  const handleEditItem = (item: BacklogItem) => {
    setEditingItem(item);
    setDialogMode('edit');
    setInitialSprintId(undefined); // Don't pre-fill sprint when editing
    setDialogOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    setBacklog(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSaveItem = (itemData: Omit<BacklogItem, 'id' | 'order' | 'createdAt' | 'updatedAt'>) => {
    if (dialogMode === 'add') {
      const newItem: BacklogItem = {
        ...itemData,
        id: `backlog-${Date.now()}`,
        order: backlog.length + 1,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setBacklog(prev => [...prev, newItem]);
    } else if (editingItem) {
      setBacklog(prev => prev.map(item =>
        item.id === editingItem.id
          ? { ...item, ...itemData, updatedAt: new Date().toISOString().split('T')[0] }
          : item
      ));
    }
    setDialogOpen(false);
    setEditingItem(null);
  };

  const totalStoryPoints = filteredBacklog.reduce((sum, item) => sum + (item.storyPoints || 0), 0);
  const totalValue = filteredBacklog.reduce((sum, item) => sum + (item.businessValue || 0), 0);
  const totalEffort = filteredBacklog.reduce((sum, item) => sum + (item.effort || 0), 0);
  const avgValueEffortRatio = (totalEffort > 0 && totalValue > 0) ? (totalValue / totalEffort) : 0;

  const hasActiveFilters = searchQuery || filterType !== 'all' || filterStatus !== 'all' || 
    filterPriority !== 'all' || filterMoscow !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterMoscow('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Backlog</h1>
          <p className="mt-2 text-muted-foreground">
            Manage and prioritize backlog items according to PMBOK and Agile best practices
          </p>
        </div>
        <Button onClick={handleAddItem} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Backlog Item
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Items</span>
          </div>
          <p className="text-2xl font-bold">{filteredBacklog.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Story Points</span>
          </div>
          <p className="text-2xl font-bold">{totalStoryPoints}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground">Business Value</span>
          </div>
          <p className="text-2xl font-bold">{totalValue}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground">Value/Effort Ratio</span>
          </div>
          <p className="text-2xl font-bold">{isNaN(avgValueEffortRatio) || !isFinite(avgValueEffortRatio) ? '0.00' : avgValueEffortRatio.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Filters</span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="epic">Epic</SelectItem>
              <SelectItem value="feature">Feature</SelectItem>
              <SelectItem value="story">Story</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="spike">Spike</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="refined">Refined</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="in-sprint">In Sprint</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterMoscow} onValueChange={setFilterMoscow}>
            <SelectTrigger>
              <SelectValue placeholder="MoSCoW" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All MoSCoW</SelectItem>
              <SelectItem value="must-have">Must Have</SelectItem>
              <SelectItem value="should-have">Should Have</SelectItem>
              <SelectItem value="could-have">Could Have</SelectItem>
              <SelectItem value="won't-have">Won't Have</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order">Order</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="value">Business Value</SelectItem>
              <SelectItem value="effort">Effort</SelectItem>
              <SelectItem value="value-effort">Value/Effort Ratio</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="backlog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="backlog">
            Product Backlog ({filteredBacklog.length})
          </TabsTrigger>
          <TabsTrigger value="sprints">
            Sprint Planning ({sprintBacklog.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="backlog" className="space-y-4">
          <div 
            className="rounded-xl border border-border bg-card"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, undefined)}
          >
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-foreground">Product Backlog</h2>
                  <p className="text-sm text-muted-foreground">
                    {totalStoryPoints} story points • {filteredBacklog.length} items
                  </p>
                </div>
              </div>
            </div>
            <div className={cn(
              "p-4 overflow-y-auto max-h-[600px] scrollbar-thin",
              viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'
            )}>
              {filteredBacklog.map((item) => (
                <BacklogItemCard
                  key={item.id}
                  item={item}
                  tags={tags || []}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  onClick={setSelectedItem}
                  isCompact={viewMode === 'list'}
                />
              ))}
              {filteredBacklog.length === 0 && (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">
                    {hasActiveFilters ? 'No items match the filters' : 'No backlog items yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sprints" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">

            {sprintBacklog.map((sprint) => (
              <div
                key={sprint.id}
                className="rounded-xl border border-border bg-card"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, sprint.id)}
              >
                <div className="border-b border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{sprint.name}</h3>
                      <p className="text-sm text-muted-foreground">{sprint.goal}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {sprint.items.reduce((sum, item) => sum + (item.storyPoints || 0), 0)} pts
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddItem(sprint.id);
                        }}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Item
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2 min-h-[200px]">
                  {sprint.items.map((item) => (
                    <BacklogItemCard
                      key={item.id}
                      item={item}
                      tags={tags || []}
                      onEdit={handleEditItem}
                      onDelete={handleDeleteItem}
                      onClick={setSelectedItem}
                      isCompact={true}
                    />
                  ))}
                  {sprint.items.length === 0 && (
                    <div className="flex flex-col h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20">
                      <p className="text-sm text-muted-foreground mb-2">No items in this sprint</p>
                      <p className="text-xs text-muted-foreground text-center px-4">
                        Drag items from Product Backlog or click "Add Item" to create new ones
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <BacklogItemDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setInitialSprintId(undefined);
            setEditingItem(null);
          }
        }}
        item={editingItem}
        backlogItems={backlog}
        sprints={sprints.map(s => ({ id: s.id, name: s.name }))}
        initialSprintId={initialSprintId}
        mode={dialogMode}
        onSave={handleSaveItem}
      />
    </div>
  );
}
