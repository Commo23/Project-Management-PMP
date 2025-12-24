import { useState } from 'react';
import { useProjectManager } from '@/contexts/ProjectManagerContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, FileJson, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useI18n } from '@/contexts/I18nContext';
import { Project } from '@/types/project';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const { importProject, switchProject } = useProjectManager();
  const { t, language } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/json' || selectedFile.name.endsWith('.json')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError(language === 'fr' 
          ? 'Seuls les fichiers JSON sont supportés' 
          : 'Only JSON files are supported');
        setFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError(language === 'fr' 
        ? 'Veuillez sélectionner un fichier' 
        : 'Please select a file');
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const text = await file.text();
      const projectData: Project = JSON.parse(text);

      // Validate project data structure
      if (!projectData.data || !projectData.mode || !projectData.name) {
        throw new Error(language === 'fr' 
          ? 'Format de fichier invalide. Le fichier doit contenir un projet exporté depuis PMP Flow Designer.' 
          : 'Invalid file format. The file must contain a project exported from PMP Flow Designer.');
      }

      // Validate required fields in data
      if (!projectData.data.tasks || !projectData.data.risks || !projectData.data.stakeholders) {
        throw new Error(language === 'fr' 
          ? 'Structure de données invalide' 
          : 'Invalid data structure');
      }

      const newProjectId = importProject(projectData);
      
      if (newProjectId) {
        switchProject(newProjectId);
        onOpenChange(false);
        setFile(null);
        // Reload page to switch to new project
        window.location.reload();
      } else {
        throw new Error(language === 'fr' 
          ? 'Erreur lors de l\'import' 
          : 'Import error');
      }
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError(language === 'fr' 
          ? 'Fichier JSON invalide' 
          : 'Invalid JSON file');
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (!importing) {
      setFile(null);
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{language === 'fr' ? 'Importer un Projet' : 'Import Project'}</DialogTitle>
          <DialogDescription>
            {language === 'fr' 
              ? 'Importez un projet depuis un fichier JSON exporté'
              : 'Import a project from an exported JSON file'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="file-upload">
              {language === 'fr' ? 'Fichier JSON' : 'JSON File'}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="file-upload"
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="flex-1"
                disabled={importing}
              />
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileJson className="h-4 w-4" />
                  <span className="max-w-[150px] truncate">{file.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {language === 'fr' 
                ? 'Sélectionnez un fichier JSON exporté depuis PMP Flow Designer'
                : 'Select a JSON file exported from PMP Flow Designer'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={importing}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleImport} disabled={!file || importing} className="gap-2">
            <Upload className="h-4 w-4" />
            {importing 
              ? (language === 'fr' ? 'Importation...' : 'Importing...')
              : (language === 'fr' ? 'Importer' : 'Import')
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

