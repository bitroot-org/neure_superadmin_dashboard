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
  message,
  Select,
} from "antd";
import {
  BarChartOutlined,
  LineChartOutlined,
  TeamOutlined,
  DashboardOutlined,
  ArrowLeftOutlined,
  SendOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./CompanyAnalytics.module.css";
import { getCompanyAnalytics, getCompanyList, generateReport, getCompanyReport } from "../../services/api";
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

// Add a new function to handle report download
const handleDownloadReport = async (companyId, dateRange, setDownloadButtonLoading) => {
  setDownloadButtonLoading(true);
  try {
    const response = await getCompanyReport(companyId, {
      startDate: dateRange[0].format("YYYY-MM-DD"),
      endDate: dateRange[1].format("YYYY-MM-DD")
    });
    
    // Check if response contains a PDF URL
    if (response.status && response.data && response.data.pdfUrl) {
      // Open the PDF in a new tab
      window.open(response.data.pdfUrl, '_blank');
      
      message.success('Report downloaded successfully');
    } else {
      throw new Error('No PDF URL found in the response');
    }
  } catch (error) {
    console.error('Error downloading report:', error);
    message.error(error.message || 'Failed to download report');
  } finally {
    setDownloadButtonLoading(false);
  }
};

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
  const [reportButtonLoading, setReportButtonLoading] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  
  // Add new state for download button loading
  const [downloadButtonLoading, setDownloadButtonLoading] = useState(false);

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
    setReportButtonLoading(true); // Set loading state to true when starting
    try {
      const response = await generateReport(companyId, {
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD")
      });
      message.success('Report sent successfully');
    } catch (error) {
      console.error('Error sending report:', error);
      // Show more specific error message if available
      message.error(error.message || 'Failed to send report');
    } finally {
      setReportButtonLoading(false); // Reset loading state when done
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

  // Prepare stress trend data
  const stressTrendData = analytics?.stressTrends?.map((item) => ({
    date: dayjs(item.date).format("MMM DD"),
    "Stress Level": item.stress_level !== null ? parseFloat(item.stress_level) : 0,
  })) || [];

  // Prepare combined engagement and wellbeing trend data
  const prepareEngagementWellbeingData = () => {
    // Create a map to store data by date
    const dataByDate = new Map();
    
    // Add wellbeing data to the map
    analytics?.wellbeingTrends?.forEach(item => {
      const dateKey = item.date;
      if (!dataByDate.has(dateKey)) {
        dataByDate.set(dateKey, {
          date: dateKey,
          formattedDate: dayjs(dateKey).format("MMM DD"),
          "Wellbeing Score": null,
          "Engagement Score": null
        });
      }
      dataByDate.get(dateKey)["Wellbeing Score"] = 
        item.wellbeing_score !== null ? parseFloat(item.wellbeing_score) : 0;
    });
    
    // Add engagement data to the map
    analytics?.engagementTrends?.forEach(item => {
      const dateKey = item.date;
      if (!dataByDate.has(dateKey)) {
        dataByDate.set(dateKey, {
          date: dateKey,
          formattedDate: dayjs(dateKey).format("MMM DD"),
          "Wellbeing Score": null,
          "Engagement Score": null
        });
      }
      dataByDate.get(dateKey)["Engagement Score"] = 
        item.engagement_score !== null ? parseFloat(item.engagement_score) : 0;
    });
    
    // Convert map to array and sort by date
    return Array.from(dataByDate.values())
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  };
  
  const combinedTrendData = prepareEngagementWellbeingData();

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
          {/* Add Download Report button */}
          <Button 
            type="primary"
            icon={<DownloadOutlined />} 
            onClick={() => handleDownloadReport(companyId, dateRange, setDownloadButtonLoading)}
            disabled={downloadButtonLoading}
            className={styles.downloadButton}
          >
            {downloadButtonLoading ? <Spin size="small" /> : "Download Report"}
          </Button>
          <Button 
            type="primary"
            icon={<SendOutlined />} 
            onClick={handleSendReport}
            disabled={reportButtonLoading}
          >
            {reportButtonLoading ? <Spin size="small" /> : "Send Report"}
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

        {/* Updated Charts Section with separate graphs */}
        <Row gutter={[16, 16]} className={styles.statsSection}>
          <Col xs={24} lg={12}>
            <Card
              title="Stress Level Trends"
              className={styles.chartCard}
            >
              <ResponsiveContainer width="100%" height={350} minHeight={200}>
                <LineChart
                  data={stressTrendData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10 }} 
                    label={{ 
                      value: '%', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <Tooltip formatter={(value) => [`${value}%`, 'Stress Level']} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Line
                    type="monotone"
                    dataKey="Stress Level"
                    stroke="#ff4d4f"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              {stressTrendData.length === 0 && (
                <div className={styles.noDataOverlay}>
                  <p>No stress data available for the selected period</p>
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title="Engagement & Wellbeing Trends"
              className={styles.chartCard}
            >
              <ResponsiveContainer width="100%" height={350} minHeight={200}>
                <LineChart
                  data={combinedTrendData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 10 }}
                    type="category"
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10 }} 
                    label={{ 
                      value: '%', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <Tooltip formatter={(value) => [`${value}%`, value === 'Wellbeing Score' ? 'Wellbeing' : 'Engagement']} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Line
                    type="monotone"
                    dataKey="Wellbeing Score"
                    stroke="#52c41a"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    connectNulls={true}
                  />
                  <Line
                    type="monotone"
                    dataKey="Engagement Score"
                    stroke="var(--primary-dark)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    connectNulls={true}
                  />
                </LineChart>
              </ResponsiveContainer>
              {combinedTrendData.length === 0 && (
                <div className={styles.noDataOverlay}>
                  <p>No engagement or wellbeing data available for the selected period</p>
                </div>
              )}
            </Card>
          </Col>
          
          {/* Employee Statistics Card remains the same */}
          <Col xs={24} lg={24}>
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
                    {analytics?.last_employee_joined ? dayjs(analytics.last_employee_joined).format("MMM D, YYYY") : "N/A"}
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
