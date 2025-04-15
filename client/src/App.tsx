import { BrowserRouter, Route, Routes } from "react-router";
import { SessionProvider } from "./contexts/session-context";
import { SnackbarProvider } from "./contexts/snackbar-context";
import { DrawerProvider } from "./contexts/drawer-context";
import { ProtectedRoute } from "./components/protected-route";
import ErrorBoundary from "./error-boundary";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import ForgotPasswordPage from "./pages/auth/forgot-password";
import ResetPasswordPage from "./pages/auth/reset-password";
import NotFound from "./pages/not-found";
import Layout from "./pages/layout";
import Home from "./pages/home";
import UsersPage from "./pages/users";
import UserDetailPage from "./pages/users/user-detail";
import CalendarPage from "./pages/calendar";

function App() {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <SnackbarProvider>
          <DrawerProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Home />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/users/:id" element={<UserDetailPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DrawerProvider>
        </SnackbarProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}

export default App;
