import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Typography, Spin, Tabs, DatePicker,
  Statistic, Select, Empty, Alert
} from 'antd';
import {
  UserAddOutlined,
  TeamOutlined,
  RiseOutlined,
  HeartOutlined,
  InteractionOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import moment from 'moment';
import { getTrends } from '../../services/api';
import styles from './Analytics.module.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dateRange, setDateRange] = useState([
    moment().subtract(30, 'days'),
    moment()
  ]);
  const [timeFrame, setTimeFrame] = useState('daily');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await getTrends();
      setAnalyticsData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load analytics data');
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
      // In a real implementation, you might want to refetch data with the new date range
      // fetchAnalyticsData(dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD'));
    }
  };

  const handleTimeFrameChange = (value) => {
    setTimeFrame(value);
    // In a real implementation, you might want to aggregate data based on the timeframe
  };

  const filterDataByDateRange = (data) => {
    if (!data) return [];

    const startDate = dateRange[0].format('YYYY-MM-DD');
    const endDate = dateRange[1].format('YYYY-MM-DD');

    return data.filter(item => {
      return item.date >= startDate && item.date <= endDate;
    });
  };

  const aggregateDataByTimeFrame = (data) => {
    if (!data || data.length === 0) return [];

    if (timeFrame === 'daily') return data;

    const aggregatedData = [];
    const groupedData = {};

    data.forEach(item => {
      let key;
      if (timeFrame === 'weekly') {
        // Group by week
        const weekNumber = moment(item.date).week();
        const year = moment(item.date).year();
        key = `${year}-W${weekNumber}`;
      } else if (timeFrame === 'monthly') {
        // Group by month
        key = moment(item.date).format('YYYY-MM');
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          date: key,
          new_users: 0,
          total_users: 0,
          avg_psi: 0,
          avg_stress: 0,
          avg_engagement: 0,
          active_companies: 0,
          count: 0
        };
      }

      groupedData[key].new_users += item.new_users || 0;
      groupedData[key].total_users = Math.max(groupedData[key].total_users, item.total_users || 0);
      groupedData[key].avg_psi += parseFloat(item.avg_psi || 0);
      groupedData[key].avg_stress += parseFloat(item.avg_stress || 0);
      groupedData[key].avg_engagement += parseFloat(item.avg_engagement || 0);
      groupedData[key].active_companies = Math.max(groupedData[key].active_companies, item.active_companies || 0);
      groupedData[key].count += 1;
    });

    // Calculate averages for the aggregated data
    Object.keys(groupedData).forEach(key => {
      const item = groupedData[key];
      if (item.count > 0) {
        item.avg_psi = (item.avg_psi / item.count).toFixed(2);
        item.avg_stress = (item.avg_stress / item.count).toFixed(2);
        item.avg_engagement = (item.avg_engagement / item.count).toFixed(2);
        delete item.count;
      }
      aggregatedData.push(item);
    });

    return aggregatedData.sort((a, b) => a.date.localeCompare(b.date));
  };

  const formatDate = (date) => {
    if (timeFrame === 'daily') {
      return moment(date).format('MMM DD');
    } else if (timeFrame === 'weekly') {
      const [year, week] = date.split('-W');
      return `Week ${week}, ${year}`;
    } else if (timeFrame === 'monthly') {
      return moment(date).format('MMM YYYY');
    }
    return date;
  };

  const userTrendsData = analyticsData ?
    aggregateDataByTimeFrame(filterDataByDateRange(analyticsData.userTrends)) : [];

  const companyTrendsData = analyticsData ?
    aggregateDataByTimeFrame(filterDataByDateRange(analyticsData.companyTrends)) : [];

  const engagementTrendsData = analyticsData && analyticsData.engagementTrends ?
    aggregateDataByTimeFrame(filterDataByDateRange(analyticsData.engagementTrends)) : [];

  const contentUsageTrendsData = analyticsData && analyticsData.contentUsageTrends ?
    aggregateDataByTimeFrame(filterDataByDateRange(analyticsData.contentUsageTrends)) : [];

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!analyticsData) return null;

    const userTrends = analyticsData.userTrends;
    const companyTrends = analyticsData.companyTrends;

    const latestUserData = userTrends[userTrends.length - 1] || {};
    const latestCompanyData = companyTrends[companyTrends.length - 1] || {};

    const totalNewUsers = userTrends.reduce((sum, item) => sum + (item.new_users || 0), 0);

    return {
      totalUsers: latestUserData.total_users || 0,
      newUsers: totalNewUsers,
      activeCompanies: latestCompanyData.active_companies || 0,
      avgPsi: latestCompanyData.avg_psi || 0,
      avgStress: latestCompanyData.avg_stress || 0,
      avgEngagement: latestCompanyData.avg_engagement || 0
    };
  };

  const summaryData = calculateSummary();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <Text>Loading analytics data...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2} className={styles.title}>Analytics Dashboard</Title>
        <div className={styles.controls}>
          <Select
            defaultValue="daily"
            style={{ width: 120, marginRight: 16 }}
            onChange={handleTimeFrameChange}
          >
            <Option value="daily">Daily</Option>
            <Option value="weekly">Weekly</Option>
            <Option value="monthly">Monthly</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            allowClear={false}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <Row gutter={[24, 24]} className={styles.summaryRow}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card bordered={false} className={styles.summaryCard}>
            <Statistic
              title="Total Users"
              value={summaryData?.totalUsers || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: 'var(--primary-dark)' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card bordered={false} className={styles.summaryCard}>
            <Statistic
              title="New Users"
              value={summaryData?.newUsers || 0}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: 'var(--primary)' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card bordered={false} className={styles.summaryCard}>
            <Statistic
              title="Active Companies"
              value={summaryData?.activeCompanies || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: 'var(--primary)' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card bordered={false} className={styles.summaryCard}>
            <Statistic
              title="Avg. PSI"
              value={summaryData?.avgPsi || 0}
              precision={2}
              prefix={<RiseOutlined />}
              valueStyle={{ color: 'var(--primary-dark)' }}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card bordered={false} className={styles.summaryCard}>
            <Statistic
              title="Avg. Stress"
              value={summaryData?.avgStress || 0}
              precision={2}
              prefix={<HeartOutlined />}
              valueStyle={{ color: 'var(--primary-dark)' }}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card bordered={false} className={styles.summaryCard}>
            <Statistic
              title="Avg. Engagement"
              value={summaryData?.avgEngagement || 0}
              precision={2}
              prefix={<InteractionOutlined />}
              valueStyle={{ color: 'var(--primary)' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Tabs */}
      <Card bordered={false} className={styles.chartsCard}>
        <Tabs defaultActiveKey="users" size="large">
          <TabPane tab="User Trends" key="users">
            {userTrendsData.length > 0 ? (
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Card title="Total Users" bordered={false} className={styles.chartCard}>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={userTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [value, 'Total Users']}
                          labelFormatter={formatDate}
                        />
                        <Area
                          type="monotone"
                          dataKey="total_users"
                          name="Total Users"
                          stroke="var(--primary-dark)"
                          fill="var(--primary-dark)"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="New User Registrations" bordered={false} className={styles.chartCard}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={userTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [value, 'New Users']}
                          labelFormatter={formatDate}
                        />
                        <Bar
                          dataKey="new_users"
                          name="New Users"
                          fill="var(--primary)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
              </Row>
            ) : (
              <Empty description="No user trend data available for the selected period" />
            )}
          </TabPane>
          <TabPane tab="Company Metrics" key="companies">
            {companyTrendsData.length > 0 ? (
              <Row gutter={[24, 24]}>
                <Col xs={24}>
                  <Card title="Company Performance Metrics" bordered={false} className={styles.chartCard}>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={companyTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip
                          formatter={(value, name) => [value, name]}
                          labelFormatter={formatDate}
                        />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="avg_psi"
                          name="Avg. PSI (%)"
                          stroke="var(--primary-dark)"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="avg_stress"
                          name="Avg. Stress Level (%)"
                          stroke="var(--primary)"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="avg_engagement"
                          name="Avg. Engagement (%)"
                          stroke="var(--primary-light)"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="active_companies"
                          name="Active Companies"
                          stroke="var(--primary-light)"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
              </Row>
            ) : (
              <Empty description="No company trend data available for the selected period" />
            )}
          </TabPane>
          <TabPane tab="Engagement Trends" key="engagement">
            {engagementTrendsData.length > 0 ? (
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Card title="User Activity" bordered={false} className={styles.chartCard}>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={engagementTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [value || 0, name]}
                          labelFormatter={formatDate}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="daily_active_users"
                          name="Daily Active Users"
                          stroke="var(--primary-dark)"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="workshop_active_users"
                          name="Workshop Active Users"
                          stroke="var(--primary)"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="content_active_users"
                          name="Content Active Users"
                          stroke="var(--primary-light)"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="stress_tracking_users"
                          name="Stress Tracking Users"
                          stroke="var(--primary-dark)"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="Engagement Metrics" bordered={false} className={styles.chartCard}>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={engagementTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [value ? `${value}%` : 'N/A', name]}
                          labelFormatter={formatDate}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="avg_workshop_attendance"
                          name="Avg. Workshop Attendance"
                          stroke="var(--primary-dark)"
                          fill="var(--primary-dark)"
                          fillOpacity={0.2}
                        />
                        <Area
                          type="monotone"
                          dataKey="avg_content_engagement"
                          name="Avg. Content Engagement"
                          stroke="var(--primary)"
                          fill="var(--primary)"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col xs={24}>
                  <Card title="User Engagement Distribution" bordered={false} className={styles.chartCard}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={engagementTrendsData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [value || 0, 'Users']}
                          labelFormatter={formatDate}
                        />
                        <Legend />
                        <Bar dataKey="daily_active_users" name="Daily Active" stackId="a" fill="var(--primary-dark)" />
                        <Bar dataKey="workshop_active_users" name="Workshop Active" stackId="a" fill="var(--primary)" />
                        <Bar dataKey="content_active_users" name="Content Active" stackId="a" fill="var(--primary-light)" />
                        <Bar dataKey="stress_tracking_users" name="Stress Tracking" stackId="a" fill="rgba(0, 106, 113, 0.5)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
              </Row>
            ) : (
              <Empty description="No engagement trend data available for the selected period" />
            )}
          </TabPane>
          <TabPane tab="Content Usage" key="content">
            {contentUsageTrendsData.length > 0 ? (
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Card title="New Content Added" bordered={false} className={styles.chartCard}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={contentUsageTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [value || 0, name]}
                          labelFormatter={formatDate}
                        />
                        <Legend />
                        <Bar dataKey="new_soundscapes" name="Soundscapes" fill="var(--primary-dark)" />
                        <Bar dataKey="new_articles" name="Articles" fill="var(--primary)" />
                        <Bar dataKey="new_workshops" name="Workshops" fill="var(--primary-light)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="New Media Added" bordered={false} className={styles.chartCard}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={contentUsageTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [value || 0, name]}
                          labelFormatter={formatDate}
                        />
                        <Legend />
                        <Bar dataKey="new_images" name="Images" fill="var(--primary-dark)" />
                        <Bar dataKey="new_videos" name="Videos" fill="var(--primary)" />
                        <Bar dataKey="new_documents" name="Documents" fill="var(--primary-light)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col xs={24}>
                  <Card title="Companies Using Resources" bordered={false} className={styles.chartCard}>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={contentUsageTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [value || 0, 'Companies']}
                          labelFormatter={formatDate}
                        />
                        <Area
                          type="monotone"
                          dataKey="companies_using_resources"
                          name="Companies Using Resources"
                          stroke="var(--primary-dark)"
                          fill="var(--primary-dark)"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col xs={24}>
                  <Card title="Content Creation Overview" bordered={false} className={styles.chartCard}>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={contentUsageTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [value || 0, name]}
                          labelFormatter={formatDate}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="new_soundscapes"
                          name="Soundscapes"
                          stroke="var(--primary-dark)"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="new_articles"
                          name="Articles"
                          stroke="var(--primary)"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="new_workshops"
                          name="Workshops"
                          stroke="var(--primary-light)"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="new_images"
                          name="Images"
                          stroke="rgba(0, 106, 113, 0.7)"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="new_videos"
                          name="Videos"
                          stroke="rgba(0, 106, 113, 0.5)"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="new_documents"
                          name="Documents"
                          stroke="rgba(0, 106, 113, 0.3)"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
              </Row>
            ) : (
              <Empty description="No content usage data available for the selected period" />
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Analytics;