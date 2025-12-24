import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Comment, CommentEntityType, ProjectShare, ProjectInvitation, ProjectPermission } from '@/types/project';

interface CollaborationContextType {
  comments: Comment[];
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'authorId' | 'authorName'>) => void;
  updateComment: (commentId: string, updates: Partial<Comment>) => void;
  deleteComment: (commentId: string) => void;
  getCommentsForEntity: (entityType: CommentEntityType, entityId: string) => Comment[];
  shares: ProjectShare[];
  addShare: (share: Omit<ProjectShare, 'id' | 'sharedAt'>) => void;
  removeShare: (shareId: string) => void;
  invitations: ProjectInvitation[];
  addInvitation: (invitation: Omit<ProjectInvitation, 'id' | 'invitedAt' | 'token'>) => void;
  acceptInvitation: (token: string) => boolean;
  getCurrentUser: () => { id: string; name: string; email: string; avatar?: string };
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export function CollaborationProvider({ children }: { children: ReactNode }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [shares, setShares] = useState<ProjectShare[]>([]);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);

  // Get current user (in a real app, this would come from auth)
  const getCurrentUser = useCallback(() => {
    const savedUser = localStorage.getItem('pmp-current-user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        // Fallback to default user
      }
    }
    // Default user
    const defaultUser = {
      id: 'user-1',
      name: 'Current User',
      email: 'user@example.com',
    };
    localStorage.setItem('pmp-current-user', JSON.stringify(defaultUser));
    return defaultUser;
  }, []);

  const addComment = useCallback((commentData: Omit<Comment, 'id' | 'createdAt' | 'authorId' | 'authorName'>) => {
    const user = getCurrentUser();
    const newComment: Comment = {
      ...commentData,
      id: `comment-${Date.now()}-${Math.random()}`,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      createdAt: new Date().toISOString(),
      replies: [],
      reactions: [],
    };

    setComments(prev => {
      let updated: Comment[];
      
      // If it's a reply, add it to the parent comment's replies
      if (commentData.parentCommentId) {
        updated = prev.map(comment => {
          if (comment.id === commentData.parentCommentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newComment],
            };
          }
          return comment;
        });
      } else {
        updated = [...prev, newComment];
      }
      
      localStorage.setItem('pmp-comments', JSON.stringify(updated));
      return updated;
    });
  }, [getCurrentUser]);

  const updateComment = useCallback((commentId: string, updates: Partial<Comment>) => {
    setComments(prev => {
      const updated = prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            ...updates,
            updatedAt: new Date().toISOString(),
            edited: true,
          };
        }
        // Also update in replies
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === commentId
                ? { ...reply, ...updates, updatedAt: new Date().toISOString(), edited: true }
                : reply
            ),
          };
        }
        return comment;
      });
      localStorage.setItem('pmp-comments', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteComment = useCallback((commentId: string) => {
    setComments(prev => {
      const updated = prev.filter(comment => {
        if (comment.id === commentId) return false;
        // Remove from replies if it's a reply
        if (comment.replies) {
          comment.replies = comment.replies.filter(reply => reply.id !== commentId);
        }
        return true;
      });
      localStorage.setItem('pmp-comments', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getCommentsForEntity = useCallback((entityType: CommentEntityType, entityId: string): Comment[] => {
    // Get top-level comments (not replies)
    const topLevelComments = comments.filter(
      comment => comment.entityType === entityType && comment.entityId === entityId && !comment.parentCommentId
    );
    
    // Attach replies to their parent comments
    return topLevelComments.map(comment => {
      const replies = comments.filter(
        c => c.parentCommentId === comment.id
      );
      return {
        ...comment,
        replies,
      };
    });
  }, [comments]);

  const addShare = useCallback((shareData: Omit<ProjectShare, 'id' | 'sharedAt'>) => {
    const user = getCurrentUser();
    const newShare: ProjectShare = {
      ...shareData,
      id: `share-${Date.now()}-${Math.random()}`,
      sharedBy: user.id,
      sharedAt: new Date().toISOString(),
    };

    setShares(prev => {
      const updated = [...prev, newShare];
      localStorage.setItem('pmp-shares', JSON.stringify(updated));
      return updated;
    });
  }, [getCurrentUser]);

  const removeShare = useCallback((shareId: string) => {
    setShares(prev => {
      const updated = prev.filter(share => share.id !== shareId);
      localStorage.setItem('pmp-shares', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addInvitation = useCallback((invitationData: Omit<ProjectInvitation, 'id' | 'invitedAt' | 'token'>) => {
    const user = getCurrentUser();
    const token = `inv-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const newInvitation: ProjectInvitation = {
      ...invitationData,
      id: `invitation-${Date.now()}-${Math.random()}`,
      invitedBy: user.id,
      invitedAt: new Date().toISOString(),
      token,
      expiresAt: expiresAt.toISOString(),
    };

    setInvitations(prev => {
      const updated = [...prev, newInvitation];
      localStorage.setItem('pmp-invitations', JSON.stringify(updated));
      return updated;
    });
  }, [getCurrentUser]);

  const acceptInvitation = useCallback((token: string): boolean => {
    const invitation = invitations.find(inv => inv.token === token && !inv.acceptedAt);
    if (!invitation) return false;

    const now = new Date();
    if (new Date(invitation.expiresAt) < now) return false;

    setInvitations(prev => {
      const updated = prev.map(inv =>
        inv.id === invitation.id
          ? { ...inv, acceptedAt: now.toISOString() }
          : inv
      );
      localStorage.setItem('pmp-invitations', JSON.stringify(updated));
      return updated;
    });

    return true;
  }, [invitations]);

  // Load from localStorage on mount
  React.useEffect(() => {
    const savedComments = localStorage.getItem('pmp-comments');
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch (e) {
        console.error('Error loading comments:', e);
      }
    }

    const savedShares = localStorage.getItem('pmp-shares');
    if (savedShares) {
      try {
        setShares(JSON.parse(savedShares));
      } catch (e) {
        console.error('Error loading shares:', e);
      }
    }

    const savedInvitations = localStorage.getItem('pmp-invitations');
    if (savedInvitations) {
      try {
        setInvitations(JSON.parse(savedInvitations));
      } catch (e) {
        console.error('Error loading invitations:', e);
      }
    }
  }, []);

  return (
    <CollaborationContext.Provider value={{
      comments,
      addComment,
      updateComment,
      deleteComment,
      getCommentsForEntity,
      shares,
      addShare,
      removeShare,
      invitations,
      addInvitation,
      acceptInvitation,
      getCurrentUser,
    }}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within CollaborationProvider');
  }
  return context;
}

