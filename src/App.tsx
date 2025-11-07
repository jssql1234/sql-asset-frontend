import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/routes";
import { ToastProvider } from "./components/ui/components/Toast";
import { ThemeProvider } from "./context/ThemeContext";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
// import { useTranslation } from "react-i18next";
import { TranslationProvider } from "./components/ui/components/Table";
import UserProvider from "./context/UserProvider";
import ErrorBoundary from "@/components/errors/ErrorBoundary";
import ErrorFallback from "@/components/errors/ErrorFallback";
import { logError } from "@/utils/logger";
import { NotificationProvider } from "./features/notification/hooks/useNotificationContext";


const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      logError(error, undefined, {
        scope: "react-query",
        route: window.location.pathname,
        component: "query",
        queryKey: query.queryKey,
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      logError(error, undefined, {
        scope: "react-query",
        route: window.location.pathname,
        component: "mutation",
        mutationKey: mutation.options.mutationKey,
      });
    },
  }),
});

function App() {
  // const { t } = useTranslation("pagination");

  // const tableTranslations = {
  //   rowsSelected: (selected: number, total: number) =>
  //     t("rowsSelected", { selected, total }),
  //   rowsPerPage: t("rowsPerPage"),
  //   pageOf: (current: number, total: number) => t("pageOf", { current, total }),
  //   firstPage: t("firstPage"),
  //   previousPage: t("previousPage"),
  //   nextPage: t("nextPage"),
  //   lastPage: t("lastPage"),
  // };

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        logError(error, info, {
          scope: "app",
          route: window.location.pathname,
          component: "App",
        });
      }}
    >
      <ThemeProvider>
        <UserProvider>
          <NotificationProvider>
            <ToastProvider>
              <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                  {/* <TranslationProvider translations={tableTranslations}> */}
                  <TranslationProvider>
                    <AppRoutes />
                  </TranslationProvider>
                </QueryClientProvider>
              </BrowserRouter>
            </ToastProvider>
          </NotificationProvider>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
