import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/routes";
import { ToastProvider } from "./components/ui/components/Toast";
import { ThemeProvider } from "./context/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { useTranslation } from "react-i18next";
import { TranslationProvider } from "./components/ui/components/Table";

const queryClient = new QueryClient();

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
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;
