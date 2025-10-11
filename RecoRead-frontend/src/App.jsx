import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LibraryPage from './pages/LibraryPage';
import BookDetailPage from './pages/BookDetailPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PageTransition from './components/common/PageTransition';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <PageTransition>
                <LandingPage />
              </PageTransition>
            }
          />
          <Route
            path="/login"
            element={
              <PageTransition>
                <LoginPage />
              </PageTransition>
            }
          />
          <Route
            path="/register"
            element={
              <PageTransition>
                <RegisterPage />
              </PageTransition>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <LibraryPage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          {/* Existing route that uses the global book ID */}
          <Route
            path="/books/:id"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <BookDetailPage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          {/* New route that uses the per-user number (userBookNo) */}
          <Route
            path="/books/n/:no"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <BookDetailPage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <ProfilePage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}