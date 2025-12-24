import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Mail, ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const { language } = useI18n();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const isFr = language === 'fr';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const result = await requestPasswordReset(email);
      if (result) {
        setSuccess(true);
      } else {
        setError(isFr 
          ? 'Une erreur est survenue. Veuillez réessayer.'
          : 'An error occurred. Please try again.');
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
              <Mail className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            {isFr ? 'Mot de passe oublié' : 'Forgot Password'}
          </CardTitle>
          <CardDescription className="text-center">
            {isFr 
              ? 'Entrez votre email pour recevoir un lien de réinitialisation'
              : 'Enter your email to receive a reset link'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  {isFr 
                    ? 'Si cet email existe dans notre système, vous recevrez un lien de réinitialisation. Vérifiez votre boîte de réception.'
                    : 'If this email exists in our system, you will receive a reset link. Check your inbox.'}
                </AlertDescription>
              </Alert>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>{isFr ? 'Note (Développement) :' : 'Note (Development):'}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  {isFr 
                    ? 'En mode développement, le token de réinitialisation est affiché dans la console du navigateur.'
                    : 'In development mode, the reset token is displayed in the browser console.'}
                </p>
              </div>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {isFr ? 'Retour à la connexion' : 'Back to Sign In'}
                </Button>
              </Link>
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isFr ? 'Envoi...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    {isFr ? 'Envoyer le lien' : 'Send Reset Link'}
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

