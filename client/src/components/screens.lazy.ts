import { lazy } from 'react';

// Lazy-loaded screen components
// Maintains exact same component names and exports for seamless replacement
export const AuthScreen = lazy(() => import('./screens/AuthScreen'));
export const AdminScreen = lazy(() => import('./screens/AdminScreen'));
export const EventListScreen = lazy(() => import('./screens/EventListScreen'));
export const AdminEventManagementScreen = lazy(() => import('./screens/AdminEventManagementScreen'));
export const EventDetailsScreen = lazy(() => import('./screens/EventDetailsScreen'));
export const EventResultsScreen = lazy(() => import('./screens/EventResultsScreen'));
export const HistoricEventsScreen = lazy(() => import('./screens/HistoricEventsScreen'));
export const PagellaScreen = lazy(() => import('./screens/PagellaScreen'));
export const SimpleVotingScreen = lazy(() => import('./screens/SimpleVotingScreen'));
