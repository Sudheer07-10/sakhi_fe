import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { TooltipProvider } from "./components/ui/tooltip";
import { JourneyProvider } from "./contexts/JourneyContext";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import { Toaster } from "./components/ui/toaster";
import ErrorBoundary from "./components/ErrorBoundary";

// Sakhi Pages
import Sakhi from "./pages/Sakhi";
import SakhiTry from "./pages/SakhiTry";

function ScrollToTop() {
  const [pathname] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* Full companion chat page without Layout shell */}
        <Route path="/sakhi/try" component={SakhiTry} />
        <Route path="/sakhi/:id" component={SakhiTry} />
        <Route path="/try" component={SakhiTry} />

        {/* Sakhi landing page with Header / Footer Layout */}
        <Route>
          <Layout>
            <Switch>
              <Route path="/" component={Sakhi} />
              <Route path="/sakhi" component={Sakhi} />
              {/* Fallback to Sakhi landing page */}
              <Route path="/:rest*" component={Sakhi} />
            </Switch>
          </Layout>
        </Route>
      </Switch>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <JourneyProvider>
            <ErrorBoundary>
              <Router />
            </ErrorBoundary>
            <Toaster />
          </JourneyProvider>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
