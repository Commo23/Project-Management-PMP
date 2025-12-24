import { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useProjectManager } from '@/contexts/ProjectManagerContext';
import { useI18n } from '@/contexts/I18nContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
    ganttTasks,
    mode,
    teamMembers
  } = useProject();
  const { currentProjectId, exportProject } = useProjectManager();
  const { t, language } = useI18n();

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
    // Try to export full project if available, otherwise export data sections
    let projectData: any = null;
    if (currentProjectId) {
      projectData = exportProject(currentProjectId);
    }

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
    const projectName = projectData?.name || 'project';
    const filename = `pmp-project-${projectName.replace(/\s+/g, '-')}-${timestamp}`;

    if (format === 'json') {
      // Export full project if available, otherwise export data sections
      const exportData = projectData ? projectData : data;
      const jsonStr = JSON.stringify(exportData, null, 2);
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
      try {
        // Export as CSV
        let csvContent = '';
        const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
        csvContent += BOM;
        
        // Export each section as CSV
        Object.entries(data).forEach(([section, items]: [string, any]) => {
          if (Array.isArray(items) && items.length > 0) {
            csvContent += `\n=== ${section.toUpperCase()} ===\n`;
            
            // Get all unique keys from all items
            const allKeys = new Set<string>();
            items.forEach((item: any) => {
              Object.keys(item).forEach(key => allKeys.add(key));
            });
            
            // Filter out complex objects and limit columns
            const simpleKeys = Array.from(allKeys).filter(key => {
              const sampleValue = items[0][key];
              return !(sampleValue && typeof sampleValue === 'object' && !Array.isArray(sampleValue));
            }).slice(0, 20); // Limit to 20 columns
            
            const headers = simpleKeys.map(h => {
              // Escape headers with commas
              if (h.includes(',') || h.includes('"')) {
                return `"${h.replace(/"/g, '""')}"`;
              }
              return h;
            });
            csvContent += headers.join(',') + '\n';
            
            items.forEach((item: any) => {
              const row = simpleKeys.map(h => {
                const value = item[h];
                if (value === null || value === undefined) return '';
                if (Array.isArray(value)) {
                  return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                }
                const stringValue = String(value);
                // Escape values with commas, quotes, or newlines
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                  return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
              });
              csvContent += row.join(',') + '\n';
            });
          }
        });

        if (csvContent.trim() === BOM) {
          alert(language === 'fr' 
            ? 'Aucune donnée à exporter' 
            : 'No data to export');
          return;
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error generating CSV:', error);
        alert(language === 'fr' 
          ? `Erreur lors de la génération du CSV: ${error instanceof Error ? error.message : String(error)}` 
          : `Error generating CSV: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else if (format === 'pdf') {
      try {
        const doc = new jsPDF();
        let yPos = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;
        const maxWidth = pageWidth - (margin * 2);
        
        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        const title = projectData?.name || 'Project Export';
        doc.text(title, margin, yPos);
        yPos += 10;
        
        // Project info
        if (projectData) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.text(`Mode: ${projectData.mode}`, margin, yPos);
          yPos += 6;
          if (projectData.description) {
            doc.setFontSize(10);
            const descriptionLines = doc.splitTextToSize(projectData.description, maxWidth);
            doc.text(descriptionLines, margin, yPos);
            yPos += descriptionLines.length * 5 + 5;
          }
        }
        
        // Export each section as a table
        Object.entries(data).forEach(([section, items]: [string, any]) => {
          if (Array.isArray(items) && items.length > 0) {
            // Check if we need a new page
            if (yPos > 250) {
              doc.addPage();
              yPos = 20;
            }
            
            yPos += 10;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            const sectionName = section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1');
            doc.text(sectionName, margin, yPos);
            yPos += 8;
            
            // Prepare table data - limit columns to avoid overflow
            const allKeys = Object.keys(items[0]);
            const importantKeys = allKeys.filter(key => 
              !['description', 'notes', 'comments', 'history', 'interactions'].includes(key)
            ).slice(0, 8); // Limit to 8 columns
            
            const tableData = items.slice(0, 30).map((item: any) => {
              return importantKeys.map(key => {
                const value = item[key];
                if (value === null || value === undefined) return '';
                if (Array.isArray(value)) {
                  return value.length > 0 ? `${value.length} items` : '';
                }
                if (typeof value === 'object' && value !== null) {
                  return JSON.stringify(value).substring(0, 30);
                }
                return String(value).substring(0, 50);
              });
            });
            
            const headers = importantKeys.map(h => {
              const header = h.charAt(0).toUpperCase() + h.slice(1).replace(/([A-Z])/g, ' $1');
              return header.length > 20 ? header.substring(0, 17) + '...' : header;
            });
            
            try {
              (doc as any).autoTable({
                head: [headers],
                body: tableData,
                startY: yPos,
                styles: { 
                  fontSize: 7, 
                  cellPadding: 2,
                  overflow: 'linebreak',
                  cellWidth: 'wrap'
                },
                headStyles: { 
                  fontSize: 8, 
                  fontStyle: 'bold',
                  fillColor: [66, 139, 202]
                },
                margin: { left: margin, right: margin },
                tableWidth: 'auto',
              });
              
              yPos = (doc as any).lastAutoTable.finalY + 10;
            } catch (tableError) {
              console.error('Error creating table:', tableError);
              // Fallback: just add text
              doc.setFontSize(10);
              doc.setFont('helvetica', 'normal');
              doc.text(`${items.length} items in ${sectionName}`, margin, yPos);
              yPos += 6;
            }
            
            if (items.length > 30) {
              doc.setFontSize(10);
              doc.setFont('helvetica', 'normal');
              doc.text(`... and ${items.length - 30} more items`, margin, yPos);
              yPos += 5;
            }
          }
        });
        
        doc.save(`${filename}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert(language === 'fr' 
          ? `Erreur lors de la génération du PDF: ${error instanceof Error ? error.message : String(error)}` 
          : `Error generating PDF: ${error instanceof Error ? error.message : String(error)}`);
      }
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
          <DialogTitle>{language === 'fr' ? 'Exporter les Données du Projet' : 'Export Project Data'}</DialogTitle>
          <DialogDescription>
            {language === 'fr' 
              ? 'Exportez les données de votre projet dans différents formats'
              : 'Export your project data in various formats'}
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
                    <span>PDF</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sections Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{language === 'fr' ? 'Sélectionner les Sections à Exporter' : 'Select Sections to Export'}</Label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  {language === 'fr' ? 'Tout Sélectionner' : 'Select All'}
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAll}>
                  {language === 'fr' ? 'Tout Désélectionner' : 'Deselect All'}
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
            {t.common.cancel}
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            {t.common.export}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

