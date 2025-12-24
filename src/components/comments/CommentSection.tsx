import { useState, useMemo } from 'react';
import { useCollaboration } from '@/contexts/CollaborationContext';
import { useI18n } from '@/contexts/I18nContext';
import { Comment, CommentEntityType } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { format, formatDistanceToNow } from 'date-fns';
import { Send, Edit, Trash2, Reply, MoreVertical, Smile } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface CommentSectionProps {
  entityType: CommentEntityType;
  entityId: string;
  onCommentAdded?: () => void;
}

export function CommentSection({ entityType, entityId, onCommentAdded }: CommentSectionProps) {
  const { comments, addComment, updateComment, deleteComment, getCurrentUser } = useCollaboration();
  const { language } = useI18n();
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const entityComments = useMemo(() => {
    return getCommentsForEntity(entityType, entityId);
  }, [getCommentsForEntity, entityType, entityId]);

  const currentUser = getCurrentUser();

  const handleSubmit = () => {
    if (!newComment.trim()) return;

    addComment({
      entityType,
      entityId,
      content: newComment.trim(),
      mentions: extractMentions(newComment),
    });

    setNewComment('');
    onCommentAdded?.();
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim() || !editingCommentId) return;

    updateComment(editingCommentId, {
      content: editContent.trim(),
      mentions: extractMentions(editContent),
    });

    setEditingCommentId(null);
    setEditContent('');
  };

  const handleDelete = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (commentToDelete) {
      deleteComment(commentToDelete);
      setCommentToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleReply = (commentId: string) => {
    if (!replyContent.trim()) return;

    addComment({
      entityType,
      entityId,
      content: replyContent.trim(),
      parentCommentId: commentId,
      mentions: extractMentions(replyContent),
    });

    setReplyingToId(null);
    setReplyContent('');
    onCommentAdded?.();
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(m => m.substring(1)) : [];
  };

  const formatMentions = (content: string): React.ReactNode => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="font-semibold text-primary">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">
          {language === 'fr' ? 'Commentaires' : 'Comments'} ({entityComments.length})
        </h3>
      </div>

      {/* Add Comment */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder={language === 'fr' 
                  ? 'Ajouter un commentaire... (utilisez @nom pour mentionner)' 
                  : 'Add a comment... (use @name to mention)'}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSubmit();
                  }
                }}
                rows={3}
              />
              <div className="flex justify-end">
                <Button onClick={handleSubmit} size="sm" className="gap-2">
                  <Send className="h-4 w-4" />
                  {language === 'fr' ? 'Commenter' : 'Comment'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {entityComments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.authorAvatar} />
                  <AvatarFallback>{comment.authorName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{comment.authorName}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        {comment.edited && (
                          <span className="ml-2">
                            ({language === 'fr' ? 'modifié' : 'edited'})
                          </span>
                        )}
                      </div>
                    </div>
                    {comment.authorId === currentUser.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(comment)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {language === 'fr' ? 'Modifier' : 'Edit'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(comment.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {language === 'fr' ? 'Supprimer' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleSaveEdit} size="sm">
                          {language === 'fr' ? 'Enregistrer' : 'Save'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditContent('');
                          }}
                        >
                          {language === 'fr' ? 'Annuler' : 'Cancel'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm whitespace-pre-wrap">
                      {formatMentions(comment.content)}
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                      className="gap-2"
                    >
                      <Reply className="h-4 w-4" />
                      {language === 'fr' ? 'Répondre' : 'Reply'}
                    </Button>
                  </div>

                  {/* Reply Input */}
                  {replyingToId === comment.id && (
                    <div className="ml-4 mt-2 space-y-2 border-l-2 border-border pl-4">
                      <Textarea
                        placeholder={language === 'fr' ? 'Écrire une réponse...' : 'Write a reply...'}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleReply(comment.id)} size="sm">
                          {language === 'fr' ? 'Répondre' : 'Reply'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReplyingToId(null);
                            setReplyContent('');
                          }}
                        >
                          {language === 'fr' ? 'Annuler' : 'Cancel'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-4 mt-2 space-y-2 border-l-2 border-border pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={reply.authorAvatar} />
                            <AvatarFallback>{reply.authorName.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-xs font-semibold">{reply.authorName}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                            </div>
                            <div className="text-sm mt-1">{formatMentions(reply.content)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {entityComments.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {language === 'fr' 
              ? 'Aucun commentaire. Soyez le premier à commenter !'
              : 'No comments yet. Be the first to comment!'}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'fr' ? 'Supprimer le commentaire' : 'Delete Comment'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'fr' 
                ? 'Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.'
                : 'Are you sure you want to delete this comment? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'fr' ? 'Annuler' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">
              {language === 'fr' ? 'Supprimer' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

