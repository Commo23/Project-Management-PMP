import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { Task } from '@/types/project';
import { useProject } from './ProjectContext';
import { useSettings } from './SettingsContext';
import { useCollaboration } from './CollaborationContext';
import { toast } from '@/components/ui/use-toast';

interface Notification {
  id: string;
  type: 'due-date' | 'assignment' | 'overdue' | 'risk' | 'milestone' | 'comment' | 'mention' | 'invitation';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  entityType?: string;
  entityId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { tasks } = useProject();
  const { settings } = useSettings();
  // Use try-catch to handle case where CollaborationContext might not be available
  let collaborationContext: ReturnType<typeof useCollaboration> | null = null;
  try {
    collaborationContext = useCollaboration();
  } catch {
    // CollaborationContext not available yet
  }
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const lastCommentCheckRef = useRef<string>(new Date().toISOString());

  // Check for due dates and assignments
  useEffect(() => {
    if (!settings || !settings.notifications) return;

    const checkNotifications = () => {
      const now = new Date();
      const newNotifications: Notification[] = [];

      tasks.forEach(task => {
        // Overdue tasks
        if (task.dueDate && task.status !== 'done') {
          const dueDate = new Date(task.dueDate);
          if (dueDate < now) {
            newNotifications.push({
              id: `overdue-${task.id}`,
              type: 'overdue',
              title: 'Task Overdue',
              message: `Task "${task.title}" is overdue`,
              timestamp: new Date().toISOString(),
              read: false,
            });
          }
        }

        // Tasks due today
        if (task.dueDate && task.status !== 'done') {
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate.getTime() === today.getTime()) {
            newNotifications.push({
              id: `due-today-${task.id}`,
              type: 'due-date',
              title: 'Task Due Today',
              message: `Task "${task.title}" is due today`,
              timestamp: new Date().toISOString(),
              read: false,
            });
          }
        }

        // New assignments
        if (task.assignee && task.status === 'todo') {
          // This would typically check if the task was recently assigned
          // For now, we'll skip this to avoid too many notifications
        }
      });

      // Check for new comments and invitations if collaboration context is available
      if (collaborationContext) {
        const { comments, invitations, getCurrentUser } = collaborationContext;
        const currentUser = getCurrentUser();
        const lastCheck = new Date(lastCommentCheckRef.current);
        
        // Check for new comments (on tasks assigned to current user or mentioning user)
        const recentComments = comments.filter(comment => {
          const commentDate = new Date(comment.createdAt);
          return commentDate > lastCheck && 
                 (comment.mentions?.includes(currentUser.id) || 
                  (comment.entityType === 'task' && tasks.find(t => t.id === comment.entityId && t.assigneeId === currentUser.id)));
        });

        recentComments.forEach(comment => {
          if (comment.mentions?.includes(currentUser.id)) {
            newNotifications.push({
              id: `mention-${comment.id}`,
              type: 'mention',
              title: 'You were mentioned',
              message: `${comment.authorName} mentioned you in a comment`,
              timestamp: comment.createdAt,
              read: false,
              entityType: comment.entityType,
              entityId: comment.entityId,
            });
          } else {
            newNotifications.push({
              id: `comment-${comment.id}`,
              type: 'comment',
              title: 'New comment',
              message: `${comment.authorName} commented on a task`,
              timestamp: comment.createdAt,
              read: false,
              entityType: comment.entityType,
              entityId: comment.entityId,
            });
          }
        });

        // Check for new invitations
        const recentInvitations = invitations.filter(inv => {
          const invDate = new Date(inv.invitedAt);
          return invDate > lastCheck && inv.email === currentUser.email && !inv.acceptedAt;
        });

        recentInvitations.forEach(invitation => {
          newNotifications.push({
            id: `invitation-${invitation.id}`,
            type: 'invitation',
            title: 'Project invitation',
            message: `You've been invited to collaborate on a project`,
            timestamp: invitation.invitedAt,
            read: false,
            entityType: 'project',
            entityId: invitation.projectId,
          });
        });
      }

      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const unique = newNotifications.filter(n => !existingIds.has(n.id));
        
        if (unique.length > 0) {
          // Show toast for new notifications
          unique.forEach(notif => {
            toast({
              title: notif.title,
              description: notif.message,
            });
          });
          
          // Update last check time only if there were new notifications
          lastCommentCheckRef.current = new Date().toISOString();
        }
        
        return [...prev, ...unique];
      });
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks, settings, collaborationContext]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

