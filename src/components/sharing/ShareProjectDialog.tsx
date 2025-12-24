import { useState, useMemo } from 'react';
import { useCollaboration } from '@/contexts/CollaborationContext';
import { useProjectManager } from '@/contexts/ProjectManagerContext';
import { useI18n } from '@/contexts/I18nContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Share2, 
  Mail, 
  Link2, 
  Copy, 
  Trash2, 
  UserPlus, 
  CheckCircle2,
  X,
  Eye,
  MessageSquare,
  Edit,
  Shield
} from 'lucide-react';
import { ProjectPermission } from '@/types/project';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ShareProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareProjectDialog({ open, onOpenChange }: ShareProjectDialogProps) {
  const { currentProjectId, projects } = useProjectManager();
  const { shares, addShare, removeShare, invitations, addInvitation, getCurrentUser } = useCollaboration();
  const { language } = useI18n();
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState<ProjectPermission>('view');
  const [linkPermission, setLinkPermission] = useState<ProjectPermission>('view');
  const [deleteShareId, setDeleteShareId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const currentProject = projects.find(p => p.id === currentProjectId);
  const projectShares = useMemo(() => {
    return shares.filter(s => s.projectId === currentProjectId);
  }, [shares, currentProjectId]);

  const projectInvitations = useMemo(() => {
    return invitations.filter(inv => inv.projectId === currentProjectId);
  }, [invitations, currentProjectId]);

  const publicLink = useMemo(() => {
    const publicShare = projectShares.find(s => !s.userId && !s.email && s.accessToken);
    if (publicShare) {
      return `${window.location.origin}/project/${currentProjectId}?token=${publicShare.accessToken}`;
    }
    return null;
  }, [projectShares, currentProjectId]);

  const handleInviteByEmail = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast({
        title: language === 'fr' ? 'Email invalide' : 'Invalid email',
        description: language === 'fr' 
          ? 'Veuillez entrer une adresse email valide'
          : 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    addInvitation({
      projectId: currentProjectId || '',
      email: inviteEmail.trim(),
      permission: invitePermission,
    });

    toast({
      title: language === 'fr' ? 'Invitation envoyée' : 'Invitation sent',
      description: language === 'fr' 
        ? `Une invitation a été envoyée à ${inviteEmail}`
        : `An invitation has been sent to ${inviteEmail}`,
    });

    setInviteEmail('');
  };

  const handleCreatePublicLink = () => {
    const token = `pub-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    addShare({
      projectId: currentProjectId || '',
      permission: linkPermission,
      accessToken: token,
    });

    toast({
      title: language === 'fr' ? 'Lien créé' : 'Link created',
      description: language === 'fr' 
        ? 'Un lien public a été créé'
        : 'A public link has been created',
    });
  };

  const handleCopyLink = () => {
    if (publicLink) {
      navigator.clipboard.writeText(publicLink);
      toast({
        title: language === 'fr' ? 'Lien copié' : 'Link copied',
        description: language === 'fr' 
          ? 'Le lien a été copié dans le presse-papiers'
          : 'Link has been copied to clipboard',
      });
    }
  };

  const handleDeleteShare = (shareId: string) => {
    setDeleteShareId(shareId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteShareId) {
      removeShare(deleteShareId);
      setDeleteShareId(null);
      setDeleteConfirmOpen(false);
      toast({
        title: language === 'fr' ? 'Partage supprimé' : 'Share removed',
      });
    }
  };

  const getPermissionLabel = (permission: ProjectPermission) => {
    const labels: Record<ProjectPermission, string> = {
      view: language === 'fr' ? 'Lecture seule' : 'View only',
      comment: language === 'fr' ? 'Commenter' : 'Comment',
      edit: language === 'fr' ? 'Modifier' : 'Edit',
      admin: language === 'fr' ? 'Administrateur' : 'Admin',
    };
    return labels[permission];
  };

  const getPermissionIcon = (permission: ProjectPermission) => {
    switch (permission) {
      case 'view':
        return <Eye className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'edit':
        return <Edit className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              {language === 'fr' ? 'Partager le Projet' : 'Share Project'}
            </DialogTitle>
            <DialogDescription>
              {currentProject?.name || (language === 'fr' ? 'Projet' : 'Project')}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="invite" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="invite">
                <UserPlus className="h-4 w-4 mr-2" />
                {language === 'fr' ? 'Inviter' : 'Invite'}
              </TabsTrigger>
              <TabsTrigger value="link">
                <Link2 className="h-4 w-4 mr-2" />
                {language === 'fr' ? 'Lien Public' : 'Public Link'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="invite" className="space-y-4 mt-4">
              {/* Invite by Email */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'fr' ? 'Inviter par Email' : 'Invite by Email'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'fr' 
                      ? 'Envoyez une invitation à quelqu\'un pour collaborer sur ce projet'
                      : 'Send an invitation to someone to collaborate on this project'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder={language === 'fr' ? 'email@example.com' : 'email@example.com'}
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleInviteByEmail();
                          }
                        }}
                      />
                    </div>
                    <Select value={invitePermission} onValueChange={(v) => setInvitePermission(v as ProjectPermission)}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            {language === 'fr' ? 'Lecture' : 'View'}
                          </div>
                        </SelectItem>
                        <SelectItem value="comment">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            {language === 'fr' ? 'Commenter' : 'Comment'}
                          </div>
                        </SelectItem>
                        <SelectItem value="edit">
                          <div className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            {language === 'fr' ? 'Modifier' : 'Edit'}
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {language === 'fr' ? 'Admin' : 'Admin'}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleInviteByEmail} className="gap-2">
                      <Mail className="h-4 w-4" />
                      {language === 'fr' ? 'Inviter' : 'Invite'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Invitations */}
              {projectInvitations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {language === 'fr' ? 'Invitations en Attente' : 'Pending Invitations'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {projectInvitations.map((invitation) => (
                        <div
                          key={invitation.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{invitation.email}</div>
                              <div className="text-xs text-muted-foreground">
                                {language === 'fr' ? 'Invité le' : 'Invited on'}{' '}
                                {new Date(invitation.invitedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1">
                              {getPermissionIcon(invitation.permission)}
                              {getPermissionLabel(invitation.permission)}
                            </Badge>
                            {invitation.acceptedAt && (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                {language === 'fr' ? 'Accepté' : 'Accepted'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Active Shares */}
              {projectShares.filter(s => s.userId || s.email).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {language === 'fr' ? 'Partages Actifs' : 'Active Shares'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {projectShares
                        .filter(s => s.userId || s.email)
                        .map((share) => (
                          <div
                            key={share.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <UserPlus className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{share.email || share.userId}</div>
                                <div className="text-xs text-muted-foreground">
                                  {language === 'fr' ? 'Partagé le' : 'Shared on'}{' '}
                                  {new Date(share.sharedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="gap-1">
                                {getPermissionIcon(share.permission)}
                                {getPermissionLabel(share.permission)}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteShare(share.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="link" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'fr' ? 'Lien Public' : 'Public Link'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'fr' 
                      ? 'Créez un lien public pour partager ce projet avec n\'importe qui'
                      : 'Create a public link to share this project with anyone'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {publicLink ? (
                    <>
                      <div className="flex gap-2">
                        <Input value={publicLink} readOnly className="font-mono text-sm" />
                        <Button onClick={handleCopyLink} variant="outline" className="gap-2">
                          <Copy className="h-4 w-4" />
                          {language === 'fr' ? 'Copier' : 'Copy'}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={linkPermission} 
                          onValueChange={(v) => setLinkPermission(v as ProjectPermission)}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="view">
                              {language === 'fr' ? 'Lecture seule' : 'View only'}
                            </SelectItem>
                            <SelectItem value="comment">
                              {language === 'fr' ? 'Commenter' : 'Comment'}
                            </SelectItem>
                            <SelectItem value="edit">
                              {language === 'fr' ? 'Modifier' : 'Edit'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            const share = projectShares.find(s => s.accessToken);
                            if (share) {
                              handleDeleteShare(share.id);
                            }
                          }}
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          {language === 'fr' ? 'Révoquer' : 'Revoke'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Select 
                          value={linkPermission} 
                          onValueChange={(v) => setLinkPermission(v as ProjectPermission)}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="view">
                              {language === 'fr' ? 'Lecture seule' : 'View only'}
                            </SelectItem>
                            <SelectItem value="comment">
                              {language === 'fr' ? 'Commenter' : 'Comment'}
                            </SelectItem>
                            <SelectItem value="edit">
                              {language === 'fr' ? 'Modifier' : 'Edit'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={handleCreatePublicLink} className="gap-2">
                          <Link2 className="h-4 w-4" />
                          {language === 'fr' ? 'Créer un Lien' : 'Create Link'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {language === 'fr' ? 'Fermer' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'fr' ? 'Supprimer le Partage' : 'Remove Share'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'fr' 
                ? 'Êtes-vous sûr de vouloir supprimer ce partage ?'
                : 'Are you sure you want to remove this share?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'fr' ? 'Annuler' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">
              {language === 'fr' ? 'Supprimer' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

