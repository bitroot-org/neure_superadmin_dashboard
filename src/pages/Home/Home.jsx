import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Row, Col, Table, Tag, Spin, Button, Input, Select,
  DatePicker, Space, Tabs, Statistic, message,
} from "antd";
import {
  UserOutlined, StopOutlined, CreditCardOutlined, GiftOutlined,
  CalendarOutlined, TeamOutlined, FileTextOutlined, SearchOutlined,
  ReloadOutlined, DollarOutlined,
} from "@ant-design/icons";
import CountUp from "react-countup";
import dayjs from "dayjs";
import {
  prodeskGetOverview,
  prodeskGetRevenue,
  prodeskGetActiveUsers,
  prodeskGetDiscontinuedUsers,
} from "../../services/api";
import styles from "./Home.module.css";

const { RangePicker } = DatePicker;
const { Option } = Select;

const PLAN_COLORS = {
  starter: "blue",
  professional: "purple",
  clinic: "gold",
};

const StatCard = ({ title, value, icon, color, prefix }) => (
  <div className={styles.statsBox}>
    <div className={styles.statTitle}>{title}</div>
    <div className={styles.statContent}>
      <div className={styles.statIcon} style={{ color }}>
        {icon}
      </div>
      <div className={styles.statValue}>
        <CountUp end={value || 0} duration={2} separator="," prefix={prefix} />
      </div>
    </div>
  </div>
);

const RevenueCard = ({ label, value }) => (
  <Card size="small" style={{ textAlign: "center", minWidth: 0, overflow: "hidden" }}>
    <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: "clamp(14px, 2vw, 20px)", fontWeight: 700, color: "#1677ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
      ₹<CountUp end={value || 0} duration={2} separator="," />
    </div>
  </Card>
);

const Home = () => {
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const [customRevenue, setCustomRevenue] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  const [activeUsers, setActiveUsers] = useState([]);
  const [activeTotal, setActiveTotal] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [activeSearch, setActiveSearch] = useState("");
  const [activePlan, setActivePlan] = useState("");
  const [activeLoading, setActiveLoading] = useState(false);

  const [discUsers, setDiscUsers] = useState([]);
  const [discTotal, setDiscTotal] = useState(0);
  const [discPage, setDiscPage] = useState(1);
  const [discSearch, setDiscSearch] = useState("");
  const [discLoading, setDiscLoading] = useState(false);

  useEffect(() => {
    fetchOverview();
    fetchActiveUsers();
    fetchDiscontinuedUsers();
  }, []);

  const fetchOverview = async () => {
    setOverviewLoading(true);
    try {
      const res = await prodeskGetOverview();
      setOverview(res?.data || null);
    } catch {
      message.error("Failed to load overview stats");
    } finally {
      setOverviewLoading(false);
    }
  };

  const fetchRevenue = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return;
    setRevenueLoading(true);
    try {
      const res = await prodeskGetRevenue(
        dateRange[0].format("YYYY-MM-DD"),
        dateRange[1].format("YYYY-MM-DD")
      );
      setCustomRevenue(res?.data || null);
    } catch {
      message.error("Failed to fetch revenue");
    } finally {
      setRevenueLoading(false);
    }
  };

  const fetchActiveUsers = useCallback(async (page = 1, search = "", plan_type = "") => {
    setActiveLoading(true);
    try {
      const res = await prodeskGetActiveUsers({ page, limit: 10, search, plan_type });
      setActiveUsers(res?.data || []);
      setActiveTotal(res?.meta?.total || 0);
    } catch {
      message.error("Failed to load active users");
    } finally {
      setActiveLoading(false);
    }
  }, []);

  const fetchDiscontinuedUsers = useCallback(async (page = 1, search = "") => {
    setDiscLoading(true);
    try {
      const res = await prodeskGetDiscontinuedUsers({ page, limit: 10, search });
      setDiscUsers(res?.data || []);
      setDiscTotal(res?.meta?.total || 0);
    } catch {
      message.error("Failed to load discontinued users");
    } finally {
      setDiscLoading(false);
    }
  }, []);

  const handleActiveSearch = () => {
    setActivePage(1);
    fetchActiveUsers(1, activeSearch, activePlan);
  };

  const handleDiscSearch = () => {
    setDiscPage(1);
    fetchDiscontinuedUsers(1, discSearch);
  };

  const activeColumns = [
    {
      title: "Name",
      key: "name",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.name}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{r.email}</div>
        </div>
      ),
    },
    { title: "Phone", dataIndex: "phone", key: "phone", render: v => v || "—" },
    {
      title: "Plan",
      key: "plan",
      render: (_, r) => (
        <Tag color={PLAN_COLORS[r.plan_type] || "default"}>
          {r.plan_name || r.plan_type || "—"}
        </Tag>
      ),
    },
    {
      title: "Billing",
      dataIndex: "billing_cycle",
      key: "billing_cycle",
      render: v => v ? <Tag>{v}</Tag> : "—",
    },
    {
      title: "Activated",
      dataIndex: "activation_date",
      key: "activation_date",
      render: v => v ? dayjs(v).format("DD MMM YYYY") : "—",
    },
    {
      title: "Expires",
      dataIndex: "period_end",
      key: "period_end",
      render: v => v ? dayjs(v).format("DD MMM YYYY") : "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: v => <Tag color="green">{v || "active"}</Tag>,
    },
  ];

  const discColumns = [
    {
      title: "Name",
      key: "name",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.name}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{r.email}</div>
        </div>
      ),
    },
    { title: "Phone", dataIndex: "phone", key: "phone", render: v => v || "—" },
    {
      title: "Plan",
      key: "plan",
      render: (_, r) => (
        <Tag color={PLAN_COLORS[r.plan_type] || "default"}>
          {r.plan_name || r.plan_type || "—"}
        </Tag>
      ),
    },
    {
      title: "Activated",
      dataIndex: "activation_date",
      key: "activation_date",
      render: v => v ? dayjs(v).format("DD MMM YYYY") : "—",
    },
    {
      title: "Cancelled On",
      dataIndex: "cancelled_on",
      key: "cancelled_on",
      render: v => v ? dayjs(v).format("DD MMM YYYY") : "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: v => <Tag color="red">{v || "cancelled"}</Tag>,
    },
  ];

  const tabItems = [
    {
      key: "active",
      label: `Active Users (${activeTotal})`,
      children: (
        <div>
          <Space style={{ marginBottom: 12 }} wrap>
            <Input
              placeholder="Search name / email"
              prefix={<SearchOutlined />}
              value={activeSearch}
              onChange={e => setActiveSearch(e.target.value)}
              onPressEnter={handleActiveSearch}
              style={{ width: 220 }}
            />
            <Select
              value={activePlan}
              onChange={v => setActivePlan(v)}
              style={{ width: 160 }}
              placeholder="All Plans"
            >
              <Option value="">All Plans</Option>
              <Option value="starter">Starter (Free)</Option>
              <Option value="professional">Professional</Option>
              <Option value="clinic">Clinic + Staff</Option>
            </Select>
            <Button type="primary" onClick={handleActiveSearch}>Search</Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setActiveSearch("");
                setActivePlan("");
                setActivePage(1);
                fetchActiveUsers(1, "", "");
              }}
            />
          </Space>
          <Table
            columns={activeColumns}
            dataSource={activeUsers}
            rowKey={r => r.therapist_id || r.user_id}
            loading={activeLoading}
            pagination={{
              current: activePage,
              pageSize: 10,
              total: activeTotal,
              onChange: page => {
                setActivePage(page);
                fetchActiveUsers(page, activeSearch, activePlan);
              },
              showTotal: t => `Total ${t} users`,
            }}
            scroll={{ x: "max-content" }}
            size="small"
          />
        </div>
      ),
    },
    {
      key: "discontinued",
      label: `Discontinued (${discTotal})`,
      children: (
        <div>
          <Space style={{ marginBottom: 12 }} wrap>
            <Input
              placeholder="Search name / email"
              prefix={<SearchOutlined />}
              value={discSearch}
              onChange={e => setDiscSearch(e.target.value)}
              onPressEnter={handleDiscSearch}
              style={{ width: 220 }}
            />
            <Button type="primary" onClick={handleDiscSearch}>Search</Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setDiscSearch("");
                setDiscPage(1);
                fetchDiscontinuedUsers(1, "");
              }}
            />
          </Space>
          <Table
            columns={discColumns}
            dataSource={discUsers}
            rowKey={r => r.therapist_id}
            loading={discLoading}
            pagination={{
              current: discPage,
              pageSize: 10,
              total: discTotal,
              onChange: page => {
                setDiscPage(page);
                fetchDiscontinuedUsers(page, discSearch);
              },
              showTotal: t => `Total ${t} users`,
            }}
            scroll={{ x: "max-content" }}
            size="small"
          />
        </div>
      ),
    },
  ];

  if (overviewLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Business Overview</h1>
        <h2 className={styles.subtitle}>ProDesk platform metrics</h2>
      </div>

      {/* Stat Cards */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Platform Statistics</h2>
        <div className={styles.statsGrid}>
          <StatCard title="Active Users" value={overview?.active_users} icon={<UserOutlined />} color="#52c41a" />
          <StatCard title="Discontinued" value={overview?.discontinued_users} icon={<StopOutlined />} color="#ff4d4f" />
          <StatCard title="Paid Users" value={overview?.total_paid_users} icon={<CreditCardOutlined />} color="#1677ff" />
          <StatCard title="Free Users" value={overview?.total_free_users} icon={<GiftOutlined />} color="#fa8c16" />
          <StatCard title="Total Sessions" value={overview?.total_sessions} icon={<CalendarOutlined />} color="#722ed1" />
          <StatCard title="Total Clients" value={overview?.total_clients} icon={<TeamOutlined />} color="#13c2c2" />
          <StatCard title="Total Invoices" value={overview?.total_invoice_amount} icon={<FileTextOutlined />} color="#eb2f96" prefix="₹" />
        </div>
      </div>

      {/* Revenue Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Revenue</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
          <RevenueCard label="Weekly" value={overview?.revenue?.weekly} />
          <RevenueCard label="Monthly" value={overview?.revenue?.monthly} />
          <RevenueCard label="Quarterly" value={overview?.revenue?.quarterly} />
          <RevenueCard label="Annual" value={overview?.revenue?.annual} />
        </div>

        {/* Custom Date Range */}
        <Card size="small" title={<span><DollarOutlined style={{ marginRight: 6 }} />Custom Date Range Revenue</span>}>
          <Space wrap>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="YYYY-MM-DD"
            />
            <Button
              type="primary"
              onClick={fetchRevenue}
              loading={revenueLoading}
              disabled={!dateRange}
            >
              Get Revenue
            </Button>
          </Space>
          {customRevenue && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#1677ff", marginBottom: 12 }}>
                Total: ₹{customRevenue.total_revenue?.toLocaleString()}
              </div>
              {customRevenue.breakdown?.length > 0 && (
                <Row gutter={[8, 8]}>
                  {customRevenue.breakdown.map(b => (
                    <Col key={b.month} xs={12} sm={8} md={6}>
                      <Card size="small" style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#888" }}>{b.month}</div>
                        <div style={{ fontWeight: 600 }}>₹{b.revenue?.toLocaleString()}</div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Users Tables */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>User Details</h2>
        <Card>
          <Tabs items={tabItems} defaultActiveKey="active" />
        </Card>
      </div>
    </div>
  );
};

export default Home;
