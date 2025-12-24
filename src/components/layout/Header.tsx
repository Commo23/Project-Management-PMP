import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Layers, RefreshCw, Zap, Download, Settings, Menu, X, Languages, Upload, Share2, LogOut, User } from 'lucide-react';
import { ExportDialog } from './ExportDialog';
import { SettingsDialog } from './SettingsDialog';
import { ProjectSelector } from './ProjectSelector';
import { ImportDialog } from './ImportDialog';
import { ShareProjectDialog } from '@/components/sharing/ShareProjectDialog';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onViewChange?: (view: string) => void;
}

export function Header({ sidebarOpen, onToggleSidebar, onViewChange }: HeaderProps) {
  const { mode, setMode } = useProject();
  const { language, setLanguage, t } = useI18n();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-full">
        {/* Logo and Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            title={sidebarOpen ? t.header.hideSidebar : t.header.showSidebar}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md">
              <div className="flex flex-col gap-0.5">
                <div className="h-1.5 w-4 rounded bg-white"></div>
                <div className="h-1.5 w-4 rounded bg-white"></div>
                <div className="h-1.5 w-4 rounded bg-white"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-foreground">
                PMP Flow Designer
              </span>
              <span className="text-xs text-muted-foreground">
                {language === 'fr' ? 'Visualisation de Gestion de Projet' : 'Project Management Visualization'}
              </span>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-1">
          <Button
            variant={mode === 'waterfall' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('waterfall')}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">{t.modes.waterfall}</span>
          </Button>
          <Button
            variant={mode === 'agile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('agile')}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">{t.modes.agile}</span>
          </Button>
          <Button
            variant={mode === 'hybrid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('hybrid')}
            className="gap-2"
          >
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">{t.modes.hybrid}</span>
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ProjectSelector />
          <GlobalSearch onViewChange={onViewChange} />
          <NotificationBell />
          <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'fr')}>
            <SelectTrigger className="w-[100px] h-9">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setIsImportDialogOpen(true)}
            title={language === 'fr' ? 'Importer un projet' : 'Import project'}
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">{language === 'fr' ? 'Importer' : 'Import'}</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setIsShareDialogOpen(true)}
            title={language === 'fr' ? 'Partager le projet' : 'Share project'}
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">{language === 'fr' ? 'Partager' : 'Share'}</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setIsExportDialogOpen(true)}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{t.header.export}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsSettingsDialogOpen(true)}
            title={t.header.settings}
          >
            <Settings className="h-4 w-4" />
          </Button>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  {language === 'fr' ? 'Profil' : 'Profile'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsSettingsDialogOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  {t.header.settings}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {language === 'fr' ? 'Déconnexion' : 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ShareProjectDialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen} />
      <ExportDialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen} />
      <ImportDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} />
      <SettingsDialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen} />
    </header>
  );
}
