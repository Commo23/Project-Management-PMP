import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, UserPlus, CheckCircle2 } from 'lucide-react';

export function SignupPage() {
  const { signup } = useAuth();
  const { language } = useI18n();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isFr = language === 'fr';

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

    // Validation
    if (!acceptTerms) {
      setError(isFr 
        ? 'Vous devez accepter les conditions d\'utilisation'
        : 'You must accept the terms and conditions');
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
      const success = await signup(email, password, name);
      if (success) {
        navigate('/dashboard');
      } else {
        setError(isFr 
          ? 'Cet email est déjà utilisé'
          : 'This email is already in use');
      }
    } catch (err) {
      setError(isFr 
        ? 'Une erreur est survenue. Veuillez réessayer.'
        : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = password ? (
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)
      ? 'strong'
      : password.length >= 6
      ? 'medium'
      : 'weak'
  ) : null;

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
            {isFr ? 'Créer un Compte' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-center">
            {isFr 
              ? 'Inscrivez-vous pour commencer à gérer vos projets'
              : 'Sign up to start managing your projects'}
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
              <Label htmlFor="name">{isFr ? 'Nom complet' : 'Full Name'}</Label>
              <Input
                id="name"
                type="text"
                placeholder={isFr ? 'Jean Dupont' : 'John Doe'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

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
              <Label htmlFor="password">{isFr ? 'Mot de passe' : 'Password'}</Label>
              <Input
                id="password"
                type="password"
                placeholder={isFr ? '••••••••' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              {password && (
                <div className="text-xs space-y-1">
                  <div className={`flex items-center gap-1 ${
                    password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    {password.length >= 8 ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3" />}
                    {isFr ? 'Au moins 8 caractères' : 'At least 8 characters'}
                  </div>
                  <div className={`flex items-center gap-1 ${
                    /[A-Z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    {/[A-Z]/.test(password) ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3" />}
                    {isFr ? 'Une majuscule' : 'One uppercase letter'}
                  </div>
                  <div className={`flex items-center gap-1 ${
                    /[0-9]/.test(password) ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    {/[0-9]/.test(password) ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3" />}
                    {isFr ? 'Un chiffre' : 'One number'}
                  </div>
                  <div className={`flex items-center gap-1 ${
                    /[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3" />}
                    {isFr ? 'Un caractère spécial' : 'One special character'}
                  </div>
                </div>
              )}
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

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border"
                disabled={loading}
              />
              <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                {isFr 
                  ? 'J\'accepte les conditions d\'utilisation et la politique de confidentialité'
                  : 'I agree to the terms and conditions and privacy policy'}
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !acceptTerms}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isFr ? 'Création...' : 'Creating...'}
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isFr ? 'Créer le compte' : 'Create Account'}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isFr ? 'Vous avez déjà un compte ? ' : 'Already have an account? '}
            </span>
            <Link to="/login" className="text-primary hover:underline">
              {isFr ? 'Se connecter' : 'Sign in'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

