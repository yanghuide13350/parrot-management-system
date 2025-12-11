import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// 懒加载页面组件
const Dashboard = lazy(() => import('../pages/Dashboard'));
const ParrotListPage = lazy(() => import('../pages/ParrotListPage'));
const AddParrotPage = lazy(() => import('../pages/parrots/AddParrotPage'));
const BreedingManagementPage = lazy(() => import('../pages/BreedingManagementPage'));
const IncubationListPage = lazy(() => import('../pages/incubation/IncubationListPage'));
const ChickManagementPage = lazy(() => import('../pages/incubation/ChickManagementPage'));
const SalesRecordsPage = lazy(() => import('../pages/sales/SalesRecordsPage'));
const ReturnManagementPage = lazy(() => import('../pages/sales/ReturnManagementPage'));
const UserManagementPage = lazy(() => import('../pages/settings/UserManagementPage'));

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
