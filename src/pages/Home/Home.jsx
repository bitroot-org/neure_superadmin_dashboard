import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  SolutionOutlined,
  BarChartOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import styles from './Home.module.css';

const Home = () => {
  // Dummy data
  const stats = {
    companies: 156,
    employees: 3420,
    workshops: 89,
    therapists: 45,
    activeUsers: 2890,
    completedSessions: 1256
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard Overview</h1>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className={styles.statsCard}>
            <Statistic
              title="Total Companies"
              value={stats.companies}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className={styles.statsCard}>
            <Statistic
              title="Total Employees"
              value={stats.employees}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className={styles.statsCard}>
            <Statistic
              title="Total Workshops"
              value={stats.workshops}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className={styles.statsCard}>
            <Statistic
              title="Total Therapists"
              value={stats.therapists}
              prefix={<SolutionOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className={styles.statsCard}>
            <Statistic
              title="Active Users"
              value={stats.activeUsers}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className={styles.statsCard}>
            <Statistic
              title="Completed Sessions"
              value={stats.completedSessions}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;