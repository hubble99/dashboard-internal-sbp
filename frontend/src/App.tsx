import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import idID from 'antd/locale/id_ID';
import { AuthProvider, ProtectedRoute, SuperAdminRoute } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import AppLayout from './components/Layout/AppLayout';
import Login from './pages/Login';
import PenyelamatanPangan from './pages/PenyelamatanPangan';
import PenyaluranPangan from './pages/PenyaluranPangan';
import RasioPenyaluran from './pages/RasioPenyaluran';
import UserManagement from './pages/UserManagement';
import AuditHistory from './pages/AuditHistory';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

const AppContent = () => {
  const { currentTheme, mode } = useTheme();

  return (
    <ConfigProvider
      locale={idID}
      theme={{
        algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          fontFamily: currentTheme.typography.fontFamily.primary,
          colorPrimary: currentTheme.colors.brand.primary,
          colorSuccess: currentTheme.colors.semantic.success,
          colorWarning: currentTheme.colors.semantic.warning,
          colorError: currentTheme.colors.semantic.danger,
          colorInfo: currentTheme.colors.semantic.info,
          borderRadius: parseInt(currentTheme.spacing.borderRadius.md),
          fontSize: 14,
        },
        components: {
          Card: {
            borderRadiusLG: parseInt(currentTheme.spacing.borderRadius.card),
          },
          Button: {
            borderRadius: parseInt(currentTheme.spacing.borderRadius.sm),
          },
          Input: {
            borderRadius: parseInt(currentTheme.spacing.borderRadius.sm),
          },
          Select: {
            borderRadius: parseInt(currentTheme.spacing.borderRadius.sm),
          },
          Table: {
            headerBg: mode === 'dark' ? '#334155' : '#fafafa',
            headerColor: mode === 'dark' ? '#E5E7EB' : 'rgba(0,0,0,0.85)',
            fontSize: 13,
          },
          Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
          },
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/penyelamatan-pangan" replace />} />
              <Route path="penyelamatan-pangan" element={<PenyelamatanPangan />} />
              <Route path="penyaluran-pangan" element={<PenyaluranPangan />} />
              <Route path="rasio-lembaga" element={<RasioPenyaluran />} />
              <Route path="audit-history" element={<AuditHistory />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              {/* Halaman khusus SUPER_ADMIN */}
              <Route
                path="user-management"
                element={
                  <SuperAdminRoute>
                    <UserManagement />
                  </SuperAdminRoute>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
