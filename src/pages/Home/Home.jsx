import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Table,
  Avatar,
  Progress,
  Spin,
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  SoundOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  RiseOutlined,
  HeartOutlined,
  LineChartOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import styles from "./Home.module.css";
import { metricsData } from "../../services/api";

const { Title, Text } = Typography;

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await metricsData();
        setMetrics(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load dashboard metrics");
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const columns = [
    {
      title: "Company",
      dataIndex: "company_name",
      key: "company_name",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            src={record.company_profile_url}
            size={40}
            style={{
              backgroundColor: !record.company_profile_url
                ? "#1677ff"
                : "transparent",
            }}
          >
            {!record.company_profile_url ? text.charAt(0) : null}
          </Avatar>
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: "PSI",
      dataIndex: "psi",
      key: "psi",
      render: (psi) =>
        psi ? (
          <Progress
            percent={psi}
            size="small"
            status="active"
            strokeColor={{
              "0%": "#108ee9",
              "100%": "#87d068",
            }}
            format={(percent) => `${percent?.toFixed(1)}%`}
          />
        ) : (
          <Text type="secondary">N/A</Text>
        ),
    },
    {
      title: "Retention",
      dataIndex: "retention_rate",
      key: "retention_rate",
      render: (rate) =>
        rate ? (
          <Progress
            percent={rate}
            size="small"
            status="active"
            strokeColor={{
              "0%": "#ff4d4f",
              "100%": "#ff7a45",
            }}
            format={(percent) => `${percent}%`}
          />
        ) : (
          <Text type="secondary">N/A</Text>
        ),
    },
    {
      title: "Engagement",
      dataIndex: "engagement_score",
      key: "engagement_score",
      render: (score) =>
        score ? (
          <Progress
            percent={score}
            size="small"
            status="active"
            strokeColor={{
              "0%": "#722ed1",
              "100%": "#2f54eb",
            }}
            format={(percent) => `${percent?.toFixed(1)}%`}
          />
        ) : (
          <Text type="secondary">N/A</Text>
        ),
    },
    {
      title: "Employees",
      dataIndex: "total_employees",
      key: "total_employees",
      render: (total) => <Text strong>{total || 0}</Text>,
    },
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <Text>Loading dashboard metrics...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2} className={styles.title}>
          Dashboard Overview
        </Title>
        <Text type="secondary" className={styles.subtitle}>
          Real-time metrics and insights
        </Text>
      </div>

      {/* Total Stats Section */}
      <div className={styles.section}>
        <Title level={4} className={styles.sectionTitle}>
          Platform Statistics
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card bordered={false} className={styles.statsCard}>
              <Statistic
                title="Companies"
                value={metrics?.totalStats.total_companies || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card bordered={false} className={styles.statsCard}>
              <Statistic
                title="Users"
                value={metrics?.totalStats.total_users || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card bordered={false} className={styles.statsCard}>
              <Statistic
                title="Soundscapes"
                value={metrics?.totalStats.total_soundscapes || 0}
                prefix={<SoundOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card bordered={false} className={styles.statsCard}>
              <Statistic
                title="Articles"
                value={metrics?.totalStats.total_articles || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card bordered={false} className={styles.statsCard}>
              <Statistic
                title="Workshops"
                value={metrics?.totalStats.total_workshops || 0}
                prefix={<VideoCameraOutlined />}
                valueStyle={{ color: "#eb2f96" }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Company Metrics Section */}
      <div className={styles.section}>
        <Title level={4} className={styles.sectionTitle}>
          Company Performance
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className={styles.metricsCard}>
              <Statistic
                title="Avg. Stress Level"
                value={parseFloat(
                  metrics?.companyMetrics.average_stress_level || 0
                ).toFixed(1)}
                suffix="%"
                prefix={<HeartOutlined />}
                valueStyle={{ color: "#ff4d4f" }}
              />
              <Text type="secondary">Across all companies</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className={styles.metricsCard}>
              <Statistic
                title="Avg. PSI"
                value={parseFloat(
                  metrics?.companyMetrics.average_psi || 0
                ).toFixed(1)}
                suffix="%"
                prefix={<RiseOutlined />}
                valueStyle={{ color: "#1677ff" }}
              />
              <Text type="secondary">Psychological Safety Index</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className={styles.metricsCard}>
              <Statistic
                title="Avg. Retention Rate"
                value={metrics?.companyMetrics.average_retention_rate || 0}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
              <Text type="secondary">Employee retention</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className={styles.metricsCard}>
              <Statistic
                title="Avg. Engagement"
                value={parseFloat(
                  metrics?.companyMetrics.average_engagement_score || 0
                ).toFixed(1)}
                suffix="%"
                prefix={<LineChartOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
              <Text type="secondary">Platform engagement</Text>
            </Card>
          </Col>
        </Row>
      </div>

      {/* User Engagement Section */}
      <div className={styles.section}>
        <Title level={4} className={styles.sectionTitle}>
          User Engagement
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className={styles.engagementCard}>
              <Statistic
                title="Workshop Engaged"
                value={metrics?.userEngagement.workshop_engaged_users || 0}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className={styles.engagementCard}>
              <Statistic
                title="Content Engaged"
                value={metrics?.userEngagement.content_engaged_users || 0}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className={styles.engagementCard}>
              <Statistic
                title="Stress Tracking"
                value={metrics?.userEngagement.stress_tracking_users || 0}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className={styles.engagementCard}>
              <Statistic
                title="Assessment Complete"
                value={metrics?.userEngagement.assessment_complete_users || 0}
                valueStyle={{ color: "#eb2f96" }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Top Companies Table */}
      <div className={styles.section}>
        <Title level={4} className={styles.sectionTitle}>
          Top Companies
        </Title>
        <Card bordered={false} className={styles.tableCard}>
          <Table
            dataSource={metrics?.topCompanies || []}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </div>
    </div>
  );
};

export default Home;
