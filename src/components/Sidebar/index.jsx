import React from "react";
import { ProLayout } from "@ant-design/pro-layout";
import { Link, Outlet } from "react-router-dom";
import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  SolutionOutlined,
  NotificationOutlined,
  BarChartOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import neurelogo from "../../assets/darkneurelogo.png";
import Header from "../Header";
const Sidebar = () => {
  const menuData = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <HomeOutlined />,
    },
    {
      path: "/companies",
      name: "Companies",
      icon: <TeamOutlined />,
      routes: [
        {
          path: "/companies/manage",
          name: "Manage Companies",
        },
        {
          path: "/companies/roi-metrics",
          name: "ROI & Metrics",
        },
      ],
    },
    {
      path: "/employees",
      name: "Employees",
      icon: <UserOutlined />,
      routes: [
        {
          path: "/employees/manage",
          name: "Manage Employees",
        },
        {
          path: "/employees/assessments",
          name: "Assessments",
        },
      ],
    },
    {
      path: "/therapists",
      name: "Therapists",
      icon: <SolutionOutlined />,
    },
    {
      path: "/workshops",
      name: "Workshops",
      icon: <FileTextOutlined />,
      routes: [
        {
          path: "/workshops/folders",
          name: "Workshop Folders",
        },
        {
          path: "/workshops/schedules",
          name: "Schedules",
        },
      ],
    },
    {
      path: "/notifications",
      name: "Notifications",
      icon: <NotificationOutlined />,
    },
    {
      path: "/analytics",
      name: "Analytics",
      icon: <BarChartOutlined />,
    },
  ];

  return (
    <ProLayout
      title="Neure Dashboard"
      menuDataRender={() => menuData}
      logo={neurelogo}
      menuItemRender={(item, dom) => <Link to={item.path}>{dom}</Link>}
      contentStyle={{ margin: -10, padding: 0 }}
      fixSiderbar
    >
      <div
        style={{
          padding: "24px",
          minHeight: "100vh",
          background: "yellow",
        }}
      >
        <Outlet />
      </div>
    </ProLayout>
  );
};

export default Sidebar;
