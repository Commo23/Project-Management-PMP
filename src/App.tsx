import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/contexts/I18nContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ProjectManagerProvider } from "@/contexts/ProjectManagerContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { CollaborationProvider } from "@/contexts/CollaborationContext";
import { IntegrationProvider } from "@/contexts/IntegrationContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RedirectRoute } from "@/components/auth/RedirectRoute";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import Index from "./pages/Index";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  try {
    return (
      <I18nProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Root redirect - to landing or dashboard based on auth */}
              <Route path="/" element={<RedirectRoute />} />
              
              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <ProjectManagerProvider>
                      <SettingsProvider>
                        <ProjectProvider>
                          <CollaborationProvider>
                            <IntegrationProvider>
                              <NotificationProvider>
                                <QueryClientProvider client={queryClient}>
                                  <TooltipProvider>
                                    <Toaster />
                                    <Sonner />
                                    <Index />
                                  </TooltipProvider>
                                </QueryClientProvider>
                              </NotificationProvider>
                            </IntegrationProvider>
                          </CollaborationProvider>
                        </ProjectProvider>
                      </SettingsProvider>
                    </ProjectManagerProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <ProjectManagerProvider>
                      <SettingsProvider>
                        <ProjectProvider>
                          <QueryClientProvider client={queryClient}>
                            <TooltipProvider>
                              <SettingsPage />
                            </TooltipProvider>
                          </QueryClientProvider>
                        </ProjectProvider>
                      </SettingsProvider>
                    </ProjectManagerProvider>
                  </ProtectedRoute>
                }
              />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </I18nProvider>
    );
  } catch (error) {
    console.error("App error:", error);
    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h1 style={{ color: "red" }}>Application Error</h1>
        <p>{String(error)}</p>
      </div>
    );
  }
};

export default App;
