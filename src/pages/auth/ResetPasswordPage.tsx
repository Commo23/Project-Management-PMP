import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const { language } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);
  const isFr = language === 'fr';

  useEffect(() => {
    if (!token) {
      setInvalidToken(true);
    }
  }, [token]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return isFr 
        ? 'Le mot de passe doit contenir au moins 8 caractères'
        : 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(pwd)) {
      return isFr
        ? 'Le mot de passe doit contenir au moins une majuscule'
        : 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return isFr
        ? 'Le mot de passe doit contenir au moins un chiffre'
        : 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return isFr
        ? 'Le mot de passe doit contenir au moins un caractère spécial'
        : 'Password must contain at least one special character';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError(isFr 
        ? 'Token de réinitialisation manquant'
        : 'Reset token missing');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError(isFr 
        ? 'Les mots de passe ne correspondent pas'
        : 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, password);
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(isFr 
          ? 'Token invalide ou expiré'
          : 'Invalid or expired token');
        setInvalidToken(true);
      }
    } catch (err) {
      setError(isFr 
        ? 'Une erreur est survenue. Veuillez réessayer.'
        : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (invalidToken && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {isFr ? 'Token Invalide' : 'Invalid Token'}
            </CardTitle>
            <CardDescription className="text-center">
              {isFr 
                ? 'Le lien de réinitialisation est invalide ou expiré'
                : 'The reset link is invalid or expired'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/forgot-password">
              <Button className="w-full">
                {isFr ? 'Demander un nouveau lien' : 'Request New Link'}
              </Button>
            </Link>
            <Link to="/login" className="block mt-4 text-center text-sm text-primary hover:underline">
              <ArrowLeft className="inline h-3 w-3 mr-1" />
              {isFr ? 'Retour à la connexion' : 'Back to Sign In'}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            {isFr ? 'Réinitialiser le mot de passe' : 'Reset Password'}
          </CardTitle>
          <CardDescription className="text-center">
            {isFr 
              ? 'Entrez votre nouveau mot de passe'
              : 'Enter your new password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  {isFr 
                    ? 'Votre mot de passe a été réinitialisé avec succès. Redirection...'
                    : 'Your password has been reset successfully. Redirecting...'}
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">{isFr ? 'Nouveau mot de passe' : 'New Password'}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isFr ? '••••••••' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  {isFr 
                    ? 'Au moins 8 caractères, une majuscule, un chiffre et un caractère spécial'
                    : 'At least 8 characters, one uppercase, one number and one special character'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {isFr ? 'Confirmer le mot de passe' : 'Confirm Password'}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={isFr ? '••••••••' : '••••••••'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isFr ? 'Réinitialisation...' : 'Resetting...'}
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    {isFr ? 'Réinitialiser' : 'Reset Password'}
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <Link to="/login" className="text-primary hover:underline">
              <ArrowLeft className="inline h-3 w-3 mr-1" />
              {isFr ? 'Retour à la connexion' : 'Back to Sign In'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

