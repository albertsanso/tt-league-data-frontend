import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from './App'
import { ProtectedRoute } from './components/features/auth/ProtectedRoute'
import { ProtectedAppLayout } from './components/layout/ProtectedAppLayout'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Public routes
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'login',
        lazy: () => import('./pages/Login').then((m) => ({ Component: m.Login })),
      },
      {
        path: 'register',
        lazy: () => import('./pages/Register').then((m) => ({ Component: m.Register })),
      },
      // Protected routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <ProtectedAppLayout />,
            children: [
              {
                path: 'dashboard',
                lazy: () => import('./pages/Dashboard').then((m) => ({ Component: m.Dashboard })),
              },
              {
                path: 'settings',
                lazy: () => import('./pages/Settings').then((m) => ({ Component: m.Settings })),
              },
              {
                path: 'clubs',
                lazy: () => import('./pages/ClubsSearch').then((m) => ({ Component: m.ClubsSearch })),
              },
              {
                path: 'practicioners',
                lazy: () =>
                  import('./pages/PracticionersSearch').then((m) => ({
                    Component: m.PracticionersSearch,
                  })),
              },
              {
                path: 'matches',
                lazy: () => import('./pages/Matches').then((m) => ({ Component: m.Matches })),
              },
            ],
          },
        ],
      },
    ],
  },
])

export { router }
