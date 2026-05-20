import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/NotFound';
import EntityDetailPage from '@/pages/EntityDetailPage';
import EntityListPage from '@/pages/EntityListPage';
import GlobalSearchPage from '@/pages/GlobalSearchPage';
import BuildsPage from '@/pages/BuildsPage';
import type { EntityType } from '@/data/entity-types';
import { routerBase } from '@/lib/app-path';
import { Route, Router, Switch } from 'wouter';
import ErrorBoundary from './components/ErrorBoundary';
import { LocaleProvider } from './contexts/LocaleContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import LorePage from './pages/LorePage';
import LegendaryWeaponsPage from './pages/LegendaryWeaponsPage';
import WeaponsListPage from './pages/WeaponsListPage';
import JewelsListPage from './pages/JewelsListPage';

function makeList(type: EntityType) {
  return function List() {
    return <EntityListPage type={type} />;
  };
}

function makeDetail(type: EntityType) {
  return function Detail() {
    return <EntityDetailPage type={type} />;
  };
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={GlobalSearchPage} />
      <Route path="/builds" component={BuildsPage} />
      <Route path="/v-bloods" component={makeList('boss')} />
      <Route path="/v-bloods/:slug" component={makeDetail('boss')} />
      <Route path="/spells" component={makeList('spell')} />
      <Route path="/spells/:slug" component={makeDetail('spell')} />
      <Route path="/weapons" component={WeaponsListPage} />
      <Route path="/weapons/legendary" component={LegendaryWeaponsPage} />
      <Route path="/weapons/:slug" component={makeDetail('weapon')} />
      <Route path="/map" component={MapPage} />
      <Route path="/lore" component={LorePage} />
      <Route path="/items" component={makeList('item')} />
      <Route path="/items/:slug" component={makeDetail('item')} />
      <Route path="/jewels" component={JewelsListPage} />
      <Route path="/jewels/:slug" component={makeDetail('jewel')} />
      <Route path="/buildings" component={makeList('building')} />
      <Route path="/buildings/:slug" component={makeDetail('building')} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LocaleProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router base={routerBase()}>
              <AppRoutes />
            </Router>
          </TooltipProvider>
        </ThemeProvider>
      </LocaleProvider>
    </ErrorBoundary>
  );
}

function AppRoutes() {
  return <AppRouter />;
}

export default App;
