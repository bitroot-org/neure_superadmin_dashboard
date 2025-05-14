import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  DatePicker,
  Breadcrumb,
  Spin,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Timeline,
  Select,
  message,
} from "antd";
import {
  BarChartOutlined,
  LineChartOutlined,
  TeamOutlined,
  DashboardOutlined,
  ArrowLeftOutlined,
  SendOutlined,
} from "@ant-design/icons";
// Removed unused import
import dayjs from "dayjs";
import styles from "./CompanyAnalytics.module.css";
import { getCompanyAnalytics, getCompanyList, generateReport } from "../../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const { RangePicker } = DatePicker;
const { Option } = Select;

const CompanyAnalytics = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(companyId);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);

  const [companiesLoading, setCompaniesLoading] = useState(true);

  const fetchCompanies = async (search = "") => {
    setCompaniesLoading(true);
    try {
      const params = {};
      if (search) {
        params.search = search;
      }
      const response = await getCompanyList(params);
      if (response.status && response.data) {
        setCompanies(response.data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setCompaniesLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await getCompanyAnalytics({
        company_id: companyId,
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReport = async () => {
    try {
      await generateReport(companyId, {
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD")
      });
      message.success('Report sent successfully');
    } catch (error) {
      console.error('Error sending report:', error);
      message.error('Failed to send report');
    }
  };

  // Initial load of companies
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== "") {
        fetchCompanies(searchTerm);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  useEffect(() => {
    fetchAnalytics();
  }, [companyId, dateRange]);

  const handleBackClick = () => {
    navigate("/companies");
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleCompanyChange = (value) => {
    setSelectedCompany(value);
    navigate(`/companies/${value}/analytics`);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <p>Loading company analytics...</p>
      </div>
    );
  }

  // Update the trend data preparation
  const trendData =
    analytics?.trends.map((item) => ({
      date: dayjs(item.date).format("MMM DD"),
      "Engagement Score": parseFloat(item.avg_engagement_score),
      "Stress Level": parseFloat(item.avg_stress_level),
    })) || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.breadcrumbSection}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <a onClick={handleBackClick}>Companies</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{analytics?.company_name}</Breadcrumb.Item>
            <Breadcrumb.Item>Analytics</Breadcrumb.Item>
          </Breadcrumb>
          {/* <div className={styles.titleRow}>
            <Typography.Title level={2} className={styles.title}>
              <span className={styles.companyName}>{analytics?.company_name}</span> Analytics
            </Typography.Title>
            <Select
              showSearch
              value={selectedCompany}
              placeholder="Select a company"
              defaultActiveFirstOption={false}
              filterOption={false}
              onSearch={handleSearch}
              onChange={handleCompanyChange}
              notFoundContent={companiesLoading ? <Spin size="small" /> : null}
              className={styles.companySelect}
              loading={companiesLoading}
            >
              {companies.map((company) => (
                <Option key={company.id} value={company.id}>
                  {company.company_name}
                </Option>
              ))}
            </Select>
          </div> */}
        </div>
        <div className={styles.actions}>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            className={styles.datePicker}
          />
          <Button 
            type="primary"
            icon={<SendOutlined />} 
            onClick={handleSendReport}
          >
            Send Report
          </Button>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBackClick}>
            Back
          </Button>
        </div>
      </div>
      <div className={styles.titleRow}>
        <Typography.Title level={2} className={styles.title}>
          <span className={styles.companyName}>{analytics?.company_name}</span>{" "}
          Analytics
        </Typography.Title>
        <Select
          showSearch
          value={selectedCompany}
          placeholder="Select a company"
          defaultActiveFirstOption={false}
          filterOption={false}
          onSearch={handleSearch}
          onChange={handleCompanyChange}
          notFoundContent={companiesLoading ? <Spin size="small" /> : null}
          className={styles.companySelect}
          loading={companiesLoading}
        >
          {companies.map((company) => (
            <Option key={company.id} value={company.id}>
              {company.company_name}
            </Option>
          ))}
        </Select>
      </div>

      <div className={styles.content}>
        {/* Key Metrics Section */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.metricCard}>
              <Statistic
                title="Engagement Score"
                value={analytics?.engagement_score}
                precision={2}
                suffix="%"
                prefix={<LineChartOutlined className={styles.statIcon} />}
              />
              <Progress
                percent={analytics?.engagement_score}
                status="active"
                strokeColor={{
                  "0%": "var(--primary-light)",
                  "100%": "var(--primary-dark)",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.metricCard}>
              <Statistic
                title="PSI Score"
                value={analytics?.psi}
                precision={2}
                suffix="%"
                prefix={<BarChartOutlined className={styles.statIcon} />}
              />
              <Progress
                percent={analytics?.psi}
                status="active"
                strokeColor={{
                  "0%": "var(--primary)",
                  "100%": "var(--primary-dark)",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.metricCard}>
              <Statistic
                title="Retention Rate"
                value={analytics?.retention_rate}
                precision={2}
                suffix="%"
                prefix={<TeamOutlined className={styles.statIcon} />}
                valueStyle={{
                  color:
                    analytics?.retention_rate > 90
                      ? "var(--primary-dark)"
                      : "var(--error)",
                }}
              />
              <Progress
                percent={analytics?.retention_rate}
                status="active"
                strokeColor={
                  analytics?.retention_rate > 90
                    ? "var(--primary-dark)"
                    : "var(--error)"
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.metricCard}>
              <Statistic
                title="Stress Level"
                value={analytics?.stress_level}
                precision={2}
                suffix="%"
                prefix={<DashboardOutlined className={styles.statIcon} />}
                valueStyle={{
                  color:
                    analytics?.stress_level > 50
                      ? "var(--error)"
                      : "var(--primary-dark)",
                }}
              />
              <Progress
                percent={analytics?.stress_level}
                status="active"
                strokeColor={
                  analytics?.stress_level > 50
                    ? "var(--error)"
                    : "var(--primary-dark)"
                }
              />
            </Card>
          </Col>
        </Row>

        {/* Employee Stats Section */}
        <Row gutter={[16, 16]} className={styles.statsSection}>
          <Col xs={24} lg={16}>
            <Card
              title="Engagement & Stress Level Trends"
              className={styles.chartCard}
            >
              <ResponsiveContainer width="100%" height={350} minHeight={200}>
                <LineChart
                  data={trendData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Line
                    type="monotone"
                    dataKey="Engagement Score"
                    stroke="var(--primary-dark)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Stress Level"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Employee Statistics" className={styles.statsCard}>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Total Employees</div>
                  <div className={styles.statValue}>{analytics?.total_employees}</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Active Employees</div>
                  <div className={styles.statValue}>{analytics?.active_employees}</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Inactive Employees</div>
                  <div className={styles.statValue}>{analytics?.inactive_employees}</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Total Departments</div>
                  <div className={styles.statValue}>{analytics?.total_departments}</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>New Users</div>
                  <div className={styles.statValue}>{analytics?.new_users}</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Last Employee Joined</div>
                  <div className={styles.statValue}>
                    {dayjs(analytics?.last_employee_joined).format("MMM D, YYYY")}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CompanyAnalytics;
