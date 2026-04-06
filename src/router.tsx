import { createBrowserRouter } from 'react-router-dom'
import App from './App'

// Pages — add feature routes here
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        lazy: () => import('./pages/Home').then((m) => ({ Component: m.Home })),
      },
      {
        path: 'clubs',
        lazy: () => import('./pages/Clubs').then((m) => ({ Component: m.Clubs })),
      },
      {
        path: 'players',
        lazy: () => import('./pages/Players').then((m) => ({ Component: m.Players })),
      },
      {
        path: 'matches',
        lazy: () => import('./pages/Matches').then((m) => ({ Component: m.Matches })),
      },
    ],
  },
])

export { router }
