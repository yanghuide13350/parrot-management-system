import type { RouteObject } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import ParrotListPage from '../pages/ParrotListPage';
import AddParrotPage from '../pages/parrots/AddParrotPage';
import BreedingManagementPage from '../pages/BreedingManagementPage';
import IncubationListPage from '../pages/incubation/IncubationListPage';
import ChickManagementPage from '../pages/incubation/ChickManagementPage';
import SalesRecordsPage from '../pages/sales/SalesRecordsPage';
import ReturnManagementPage from '../pages/sales/ReturnManagementPage';
import UserManagementPage from '../pages/settings/UserManagementPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Dashboard />,
    index: true,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/parrots',
    children: [
      {
        index: true,
        element: <ParrotListPage />,
      },
      {
        path: 'list',
        element: <ParrotListPage />,
      },
      {
        path: 'add',
        element: <AddParrotPage />,
      },
    ],
  },
  {
    path: '/breeding',
    children: [
      {
        index: true,
        element: <BreedingManagementPage />,
      },
      {
        path: 'breeding-birds',
        element: <BreedingManagementPage />,
      },
    ],
  },
  {
    path: '/incubation',
    children: [
      {
        index: true,
        element: <IncubationListPage />,
      },
      {
        path: 'incubation-list',
        element: <IncubationListPage />,
      },
      {
        path: 'chicks',
        element: <ChickManagementPage />,
      },
    ],
  },
  {
    path: '/sales',
    children: [
      {
        index: true,
        element: <SalesRecordsPage />,
      },
      {
        path: 'sales-records',
        element: <SalesRecordsPage />,
      },
      {
        path: 'returns',
        element: <ReturnManagementPage />,
      },
    ],
  },
  {
    path: '/settings',
    children: [
      {
        index: true,
        element: <UserManagementPage />,
      },
      {
        path: 'users',
        element: <UserManagementPage />,
      },
    ],
  },
];
