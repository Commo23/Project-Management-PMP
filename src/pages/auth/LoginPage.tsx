import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, LogIn } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const { language } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isFr = language === 'fr';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError(isFr 
          ? 'Email ou mot de passe incorrect'
          : 'Incorrect email or password');
      }
    } catch (err) {
      setError(isFr 
        ? 'Une erreur est survenue. Veuillez réessayer.'
        : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@pmpflow.com');
    setPassword('demo123');
    setError('');
    setLoading(true);

    try {
      const success = await login('demo@pmpflow.com', 'demo123');
      if (success) {
        navigate('/dashboard');
      } else {
        setError(isFr 
          ? 'Erreur de connexion au compte démo'
          : 'Demo account login error');
      }
    } catch (err) {
      setError(isFr 
        ? 'Une erreur est survenue. Veuillez réessayer.'
        : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md">
              <div className="flex flex-col gap-0.5">
                <div className="h-1.5 w-4 rounded bg-white"></div>
                <div className="h-1.5 w-4 rounded bg-white"></div>
                <div className="h-1.5 w-4 rounded bg-white"></div>
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            {isFr ? 'Connexion' : 'Sign In'}
          </CardTitle>
          <CardDescription className="text-center">
            {isFr 
              ? 'Connectez-vous à votre compte PMP Flow Designer'
              : 'Sign in to your PMP Flow Designer account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{isFr ? 'Email' : 'Email'}</Label>
              <Input
                id="email"
                type="email"
                placeholder={isFr ? 'votre@email.com' : 'your@email.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{isFr ? 'Mot de passe' : 'Password'}</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {isFr ? 'Mot de passe oublié ?' : 'Forgot password?'}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder={isFr ? '••••••••' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-border"
                disabled={loading}
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                {isFr ? 'Se souvenir de moi' : 'Remember me'}
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isFr ? 'Connexion...' : 'Signing in...'}
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  {isFr ? 'Se connecter' : 'Sign In'}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              {isFr ? 'Compte Démo' : 'Demo Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isFr ? "Vous n'avez pas de compte ? " : "Don't have an account? "}
            </span>
            <Link to="/signup" className="text-primary hover:underline">
              {isFr ? 'Créer un compte' : 'Sign up'}
            </Link>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground text-center">
              <strong>{isFr ? 'Compte de démonstration :' : 'Demo account:'}</strong>
              <br />
              demo@pmpflow.com / demo123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

