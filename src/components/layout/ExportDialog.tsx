import { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const { 
    phases, 
    tasks, 
    backlog, 
    wbs, 
    risks, 
    stakeholders, 
    requirements, 
    raci,
    ganttTasks
  } = useProject();

  const [format, setFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [selectedSections, setSelectedSections] = useState({
    phases: true,
    tasks: true,
    backlog: true,
    wbs: true,
    risks: true,
    stakeholders: true,
    requirements: true,
    raci: true,
    gantt: true,
  });

  const handleExport = () => {
    const data: any = {};

    if (selectedSections.phases) data.phases = phases;
    if (selectedSections.tasks) data.tasks = tasks;
    if (selectedSections.backlog) data.backlog = backlog;
    if (selectedSections.wbs) data.wbs = wbs;
    if (selectedSections.risks) data.risks = risks;
    if (selectedSections.stakeholders) data.stakeholders = stakeholders;
    if (selectedSections.requirements) data.requirements = requirements;
    if (selectedSections.raci) data.raci = raci;
    if (selectedSections.gantt) data.ganttTasks = ganttTasks;

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `pmp-project-export-${timestamp}`;

    if (format === 'json') {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      // Export as CSV (simplified - you might want to use a library like papaparse)
      let csvContent = '';
      
      // Export each section as CSV
      Object.entries(data).forEach(([section, items]: [string, any]) => {
        if (Array.isArray(items) && items.length > 0) {
          csvContent += `\n=== ${section.toUpperCase()} ===\n`;
          const headers = Object.keys(items[0]);
          csvContent += headers.join(',') + '\n';
          items.forEach((item: any) => {
            csvContent += headers.map(h => {
              const value = item[h];
              if (Array.isArray(value)) return JSON.stringify(value);
              if (typeof value === 'object' && value !== null) return JSON.stringify(value);
              return String(value || '').replace(/,/g, ';');
            }).join(',') + '\n';
          });
        }
      });

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // For PDF, we'll create a simple text representation
      // In a real app, you'd use a library like jsPDF or pdfkit
      alert('PDF export is not yet implemented. Please use JSON or CSV format.');
      return;
    }

    onOpenChange(false);
  };

  const toggleSection = (section: keyof typeof selectedSections) => {
    setSelectedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const selectAll = () => {
    setSelectedSections({
      phases: true,
      tasks: true,
      backlog: true,
      wbs: true,
      risks: true,
      stakeholders: true,
      requirements: true,
      raci: true,
      gantt: true,
    });
  };

  const deselectAll = () => {
    setSelectedSections({
      phases: false,
      tasks: false,
      backlog: false,
      wbs: false,
      risks: false,
      stakeholders: false,
      requirements: false,
      raci: false,
      gantt: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Project Data</DialogTitle>
          <DialogDescription>
            Export your project data in various formats
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as 'json' | 'csv' | 'pdf')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    <span>JSON</span>
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>CSV</span>
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>PDF (Coming Soon)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sections Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select Sections to Export</Label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAll}>
                  Deselect All
                </Button>
              </div>
            </div>
            <div className="space-y-2 border rounded-lg p-4">
              {Object.entries(selectedSections).map(([section, selected]) => (
                <div key={section} className="flex items-center space-x-2">
                  <Checkbox
                    id={section}
                    checked={selected}
                    onCheckedChange={() => toggleSection(section as keyof typeof selectedSections)}
                  />
                  <Label
                    htmlFor={section}
                    className="text-sm font-normal cursor-pointer capitalize"
                  >
                    {section === 'wbs' ? 'WBS' : section === 'raci' ? 'RACI Matrix' : section}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

