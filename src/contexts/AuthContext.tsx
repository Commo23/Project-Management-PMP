import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'admin' | 'project_manager' | 'team_member' | 'viewer';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo account credentials
const DEMO_EMAIL = 'demo@pmpflow.com';
const DEMO_PASSWORD = 'demo123';
const DEMO_USER: User = {
  id: 'demo-user-001',
  email: DEMO_EMAIL,
  name: 'Demo User',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('pmp-auth-user');
    const savedToken = localStorage.getItem('pmp-auth-token');
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error loading user:', e);
        localStorage.removeItem('pmp-auth-user');
        localStorage.removeItem('pmp-auth-token');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check demo account
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const token = `demo-token-${Date.now()}`;
      setUser(DEMO_USER);
      localStorage.setItem('pmp-auth-user', JSON.stringify(DEMO_USER));
      localStorage.setItem('pmp-auth-token', token);
      return true;
    }

    // Check other users from localStorage
    const users = JSON.parse(localStorage.getItem('pmp-users') || '[]');
    const foundUser = users.find((u: any) => u.email === email);
    
    if (foundUser && foundUser.password === password) {
      const { password: _, ...userWithoutPassword } = foundUser;
      const token = `token-${Date.now()}`;
      setUser(userWithoutPassword as User);
      localStorage.setItem('pmp-auth-user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('pmp-auth-token', token);
      return true;
    }

    return false;
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('pmp-users') || '[]');
    if (users.some((u: any) => u.email === email)) {
      return false; // User already exists
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      role: 'project_manager',
      createdAt: new Date().toISOString(),
    };

    // Save user with password (in production, password should be hashed)
    users.push({
      ...newUser,
      password, // In production, hash this!
    });
    localStorage.setItem('pmp-users', JSON.stringify(users));

    // Auto-login after signup
    const token = `token-${Date.now()}`;
    setUser(newUser);
    localStorage.setItem('pmp-auth-user', JSON.stringify(newUser));
    localStorage.setItem('pmp-auth-token', token);

    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('pmp-auth-user');
    localStorage.removeItem('pmp-auth-token');
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user exists
    const users = JSON.parse(localStorage.getItem('pmp-users') || '[]');
    const foundUser = users.find((u: any) => u.email === email);
    
    if (!foundUser && email !== DEMO_EMAIL) {
      // Don't reveal if user exists or not (security best practice)
      return true;
    }

    // Generate reset token
    const resetToken = `reset-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const resetTokens = JSON.parse(localStorage.getItem('pmp-reset-tokens') || '[]');
    
    resetTokens.push({
      email,
      token: resetToken,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    });
    
    localStorage.setItem('pmp-reset-tokens', JSON.stringify(resetTokens));

    // In production, send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset link: /reset-password?token=${resetToken}`);

    return true;
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const resetTokens = JSON.parse(localStorage.getItem('pmp-reset-tokens') || '[]');
    const resetToken = resetTokens.find((t: any) => t.token === token);

    if (!resetToken || new Date(resetToken.expiresAt) < new Date()) {
      return false; // Invalid or expired token
    }

    // Update password
    const users = JSON.parse(localStorage.getItem('pmp-users') || '[]');
    const userIndex = users.findIndex((u: any) => u.email === resetToken.email);
    
    if (userIndex !== -1) {
      users[userIndex].password = newPassword; // In production, hash this!
      localStorage.setItem('pmp-users', JSON.stringify(users));
    }

    // Remove used token
    const updatedTokens = resetTokens.filter((t: any) => t.token !== token);
    localStorage.setItem('pmp-reset-tokens', JSON.stringify(updatedTokens));

    return true;
  }, []);

  const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, verify the email token
    // For now, just return true
    return true;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        requestPasswordReset,
        resetPassword,
        verifyEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

