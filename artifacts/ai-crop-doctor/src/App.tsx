import type { ReactNode } from 'react';
import { Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppShell from './components/AppShell';
import { AppStateProvider } from './state/AppState';
import { useT } from './i18n';
import { HomePage, DetectPage, ResultPage, DashboardPage, HistoryPage, CropsPage, CropDetailPage, SettingsPage } from './pages/Pages';

const queryClient = new QueryClient();
function NotFoundPage() {
  const t=useT();
  return <div className="glass rounded-[26px] p-10 text-center"><h1 className="font-serif text-4xl">404</h1><p className="mt-2 text-[#718071]">{t('noMatch')}</p></div>;
}
function RoutedErrorBoundary({children}:{children:ReactNode}) {
  const [location]=useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
function Router() {
  return <RoutedErrorBoundary><AppShell><Switch>
    <Route path="/" component={HomePage}/>
    <Route path="/detect" component={DetectPage}/>
    <Route path="/result" component={ResultPage}/>
    <Route path="/dashboard" component={DashboardPage}/>
    <Route path="/history" component={HistoryPage}/>
    <Route path="/crops" component={CropsPage}/>
    <Route path="/crops/:crop" component={CropDetailPage}/>
    <Route path="/settings" component={SettingsPage}/>
    <Route component={NotFoundPage}/>
  </Switch></AppShell></RoutedErrorBoundary>;
}
function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><AppStateProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/,'')}><Router/></WouterRouter><Toaster/></AppStateProvider></TooltipProvider></QueryClientProvider>;
}
export default App;
