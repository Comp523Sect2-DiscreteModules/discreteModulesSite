import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import ModuleList from './pages/student/ModuleList.jsx';
import LecturePage from './pages/student/LecturePage.jsx';
import QuizPage from './pages/student/QuizPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ModuleEditor from './pages/admin/ModuleEditor.jsx';

// Login has its own branded layout and the quiz runs in a low-distraction
// focus mode with its own header, so neither shows the global navbar.
function useHideNavbar() {
  const { pathname } = useLocation();
  return pathname === '/login' || /^\/modules\/[^/]+\/quiz\/?$/.test(pathname);
}

export default function App() {
  const hideNavbar = useHideNavbar();

  return (
    <div className="min-h-screen bg-page">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ModuleList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/modules/:moduleId"
          element={
            <ProtectedRoute>
              <LecturePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/modules/:moduleId/quiz"
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/modules/:moduleId"
          element={
            <ProtectedRoute requireAdmin>
              <ModuleEditor />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
