import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Avatar,
  Progress,
  Spin,
} from "antd";
import CountUp from 'react-countup';
import { FaUsers, FaUser, FaHeadphones, FaFileAlt, FaVideo, FaChartLine, FaHeart, FaTrophy } from 'react-icons/fa';
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
        <div className={styles.statsGrid}>
          <div className={styles.statsBox}>
            <div className={styles.statTitle}>Companies</div>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ color: '#1677ff' }}>
                <FaUsers />
              </div>
              <div className={styles.statValue}>
                <CountUp
                  end={metrics?.totalStats.total_companies || 0}
                  duration={2.5}
                  separator=","
                />
              </div>
            </div>
          </div>
          <div className={styles.statsBox}>
            <div className={styles.statTitle}>Users</div>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ color: '#52c41a' }}>
                <FaUser />
              </div>
              <div className={styles.statValue}>
                <CountUp
                  end={metrics?.totalStats.total_users || 0}
                  duration={2.5}
                  separator=","
                />
              </div>
            </div>
          </div>
          <div className={styles.statsBox}>
            <div className={styles.statTitle}>Soundscapes</div>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ color: '#722ed1' }}>
                <FaHeadphones />
              </div>
              <div className={styles.statValue}>
                <CountUp
                  end={metrics?.totalStats.total_soundscapes || 0}
                  duration={2.5}
                  separator=","
                />
              </div>
            </div>
          </div>
          <div className={styles.statsBox}>
            <div className={styles.statTitle}>Articles</div>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ color: '#fa8c16' }}>
                <FaFileAlt />
              </div>
              <div className={styles.statValue}>
                <CountUp
                  end={metrics?.totalStats.total_articles || 0}
                  duration={2.5}
                  separator=","
                />
              </div>
            </div>
          </div>
          <div className={styles.statsBox}>
            <div className={styles.statTitle}>Workshops</div>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ color: '#eb2f96' }}>
                <FaVideo />
              </div>
              <div className={styles.statValue}>
                <CountUp
                  end={metrics?.totalStats.total_workshops || 0}
                  duration={2.5}
                  separator=","
                />
              </div>
            </div>
          </div>
          <div className={styles.statsBox}>
            <div className={styles.statTitle}>Therapists</div>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ color: '#722ed1' }}>
                <FaUser />
              </div>
              <div className={styles.statValue}>
                <CountUp
                  end={metrics?.totalStats.total_therapists || 0}
                  duration={2.5}
                  separator=","
                />
              </div>
            </div>
          </div>
          <div className={styles.statsBox}>
            <div className={styles.statTitle}>Assessments</div>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ color: '#13c2c2' }}>
                <FaFileAlt />
              </div>
              <div className={styles.statValue}>
                <CountUp
                  end={metrics?.totalStats.total_assessments || 0}
                  duration={2.5}
                  separator=","
                />
              </div>
            </div>
          </div>
          <div className={styles.statsBox}>
            <div className={styles.statTitle}>Rewards</div>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ color: '#faad14' }}>
                <FaTrophy />
              </div>
              <div className={styles.statValue}>
                <CountUp
                  end={metrics?.totalStats.total_rewards || 0}
                  duration={2.5}
                  separator=","
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Metrics Section */}
      <div className={styles.section}>
        <Title level={4} className={styles.sectionTitle}>
          Company Performance
        </Title>
        <div className={styles.metricsGrid}>
          <div className={styles.metricsBox}>
            <div className={styles.statTitle}>Avg. Stress Level</div>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ color: "#ff4d4f" }}>
                <FaHeart />
              </div>
              <div className={styles.statValue} style={{ color: "#ff4d4f" }}>
                <CountUp
                  end={parseFloat(metrics?.companyMetrics.average_stress_level || 0)}
                  duration={2.5}
                  decimals={1}
                />
                <span className={styles.percentSymbol}>%</span>
              </div>
            </div>
          </div>
          <div className={styles.metricsBox}>
            <div className={styles.statTitle}>Avg. PSI</div>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ color: "#1677ff" }}>
                <FaChartLine />
              </div>
              <div className={styles.statValue} style={{ color: "#1677ff" }}>
                <CountUp
                  end={parseFloat(metrics?.companyMetrics.average_psi || 0)}
                  duration={2.5}
                  decimals={1}
                />
                <span className={styles.percentSymbol}>%</span>
              </div>
            </div>
          </div>
          <div className={styles.metricsBox}>
            <div className={styles.statTitle}>Avg. Retention Rate</div>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ color: "#52c41a" }}>
                <FaTrophy />
              </div>
              <div className={styles.statValue} style={{ color: "#52c41a" }}>
                <CountUp
                  end={parseFloat(metrics?.companyMetrics.average_retention_rate || 0)}
                  duration={2.5}
                  decimals={0}
                />
                <span className={styles.percentSymbol}>%</span>
              </div>
            </div>
          </div>
          <div className={styles.metricsBox}>
            <div className={styles.statTitle}>Avg. Engagement</div>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ color: "#722ed1" }}>
                <FaChartLine />
              </div>
              <div className={styles.statValue} style={{ color: "#722ed1" }}>
                <CountUp
                  end={parseFloat(metrics?.companyMetrics.average_engagement_score || 0)}
                  duration={2.5}
                  decimals={1}
                />
                <span className={styles.percentSymbol}>%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Engagement Section */}
      {/* <div className={styles.section}>
        <Title level={4} className={styles.sectionTitle}>
          User Engagement
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.engagementCard}>
              <div className={styles.statTitle}>Workshop Engaged</div>
              <div className={styles.statValue} style={{ color: "#1677ff" }}>
                <CountUp
                  end={metrics?.userEngagement.workshop_engaged_users || 0}
                  duration={2.5}
                  separator=","
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.engagementCard}>
              <div className={styles.statTitle}>Content Engaged</div>
              <div className={styles.statValue} style={{ color: "#52c41a" }}>
                <CountUp
                  end={metrics?.userEngagement.content_engaged_users || 0}
                  duration={2.5}
                  separator=","
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.engagementCard}>
              <div className={styles.statTitle}>Stress Tracking</div>
              <div className={styles.statValue} style={{ color: "#fa8c16" }}>
                <CountUp
                  end={metrics?.userEngagement.stress_tracking_users || 0}
                  duration={2.5}
                  separator=","
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.engagementCard}>
              <div className={styles.statTitle}>Assessment Complete</div>
              <div className={styles.statValue} style={{ color: "#eb2f96" }}>
                <CountUp
                  end={metrics?.userEngagement.assessment_complete_users || 0}
                  duration={2.5}
                  separator=","
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div> */}

      {/* Top Companies Table */}
      <div className={styles.section}>
        <Title level={4} className={styles.sectionTitle}>
          Top Companies
        </Title>
        <Card className={styles.tableCard}>
          <Table
            dataSource={metrics?.topCompanies || []}
            columns={columns}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>
    </div>
  );
};

export default Home;
