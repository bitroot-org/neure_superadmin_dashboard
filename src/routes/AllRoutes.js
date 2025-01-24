import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  SolutionOutlined,
  NotificationOutlined,
  BarChartOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const menuData = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: <HomeOutlined />,
  },
  {
    path: '/companies',
    name: 'Companies',
    icon: <TeamOutlined />,
    routes: [
      {
        path: '/companies/manage',
        name: 'Manage Companies',
      },
      {
        path: '/companies/roi-metrics',
        name: 'ROI & Metrics',
      },
    ],
  },
  {
    path: '/employees',
    name: 'Employees',
    icon: <UserOutlined />,
    routes: [
      {
        path: '/employees/manage',
        name: 'Manage Employees',
      },
      {
        path: '/employees/assessments',
        name: 'Assessments',
      },
    ],
  },
  {
    path: '/therapists',
    name: 'Therapists',
    icon: <SolutionOutlined />,
  },
  {
    path: '/workshops',
    name: 'Workshops',
    icon: <FileTextOutlined />,
    routes: [
      {
        path: '/workshops/folders',
        name: 'Workshop Folders',
      },
      {
        path: '/workshops/schedules',
        name: 'Schedules',
      },
    ],
  },
  {
    path: '/notifications',
    name: 'Notifications',
    icon: <NotificationOutlined />,
  },
  {
    path: '/analytics',
    name: 'Analytics',
    icon: <BarChartOutlined />,
  },
];
