import React, { useState, useEffect, useCallback } from "react";
import {
  Table, Tag, Button, Input, Select, DatePicker, Space, Tabs, message,
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

const StatCard = ({ title, value, icon, accent, prefix, index }) => (
  <div className={styles.statCard} style={{ "--accent": accent, "--i": index }}>
    <div className={styles.statTop}>
      <span className={styles.statTitle}>{title}</span>
      <span className={styles.statIcon}>{icon}</span>
    </div>
    <div className={styles.statValue} title={`${prefix || ""}${(value || 0).toLocaleString("en-IN")}`}>
      <CountUp end={value || 0} duration={1.4} separator="," prefix={prefix} preserveValue />
    </div>
  </div>
);

const RevenueTile = ({ label, value, featured }) => (
  <div className={`${styles.revenueTile} ${featured ? styles.revenueFeatured : ""}`}>
    <span className={styles.revenueLabel}>{label}</span>
    <span className={styles.revenueValue}>
      <span className={styles.rupee}>₹</span>
      <CountUp end={value || 0} duration={1.4} separator="," preserveValue />
    </span>
  </div>
);

const DashboardSkeleton = () => (
  <div className={styles.container}>
    <div className={styles.skeletonHeader} />
    <div className={styles.statsGrid}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className={`${styles.statCard} ${styles.skeleton}`} style={{ "--i": i }} />
      ))}
    </div>
    <div className={`${styles.panel} ${styles.skeleton}`} style={{ height: 120, marginTop: 28 }} />
  </div>
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

  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setOverviewLoading(true);
    try {
      const res = await prodeskGetOverview();
      setOverview(res?.data || null);
    } catch {
      message.error("Failed to load overview stats");
    } finally {
      silent ? setRefreshing(false) : setOverviewLoading(false);
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
          <div className={styles.cellName}>{r.name}</div>
          <div className={styles.cellSub}>{r.email}</div>
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
          <div className={styles.cellName}>{r.name}</div>
          <div className={styles.cellSub}>{r.email}</div>
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

  if (overviewLoading) return <DashboardSkeleton />;

  const stats = [
    { title: "Active Users", value: overview?.active_users, icon: <UserOutlined />, accent: "#52c41a" },
    { title: "Discontinued", value: overview?.discontinued_users, icon: <StopOutlined />, accent: "#ff4d4f" },
    { title: "Paid Users", value: overview?.total_paid_users, icon: <CreditCardOutlined />, accent: "#1677ff" },
    { title: "Free Users", value: overview?.total_free_users, icon: <GiftOutlined />, accent: "#faad14" },
    { title: "Total Sessions", value: overview?.total_sessions, icon: <CalendarOutlined />, accent: "#722ed1" },
    { title: "Total Clients", value: overview?.total_clients, icon: <TeamOutlined />, accent: "#13c2c2" },
    { title: "Total Invoices", value: overview?.total_invoice_amount, icon: <FileTextOutlined />, accent: "#eb2f96", prefix: "₹" },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Dashboard
          <span className={styles.date}>{dayjs().format("ddd, D MMM YYYY")}</span>
        </h1>
        <button
          type="button"
          className={`${styles.refresh} ${refreshing ? styles.refreshing : ""}`}
          onClick={() => {
            fetchOverview({ silent: true });
            fetchActiveUsers(activePage, activeSearch, activePlan);
            fetchDiscontinuedUsers(discPage, discSearch);
          }}
          disabled={refreshing}
          aria-label="Refresh dashboard"
        >
          <ReloadOutlined className={styles.refreshIcon} />
          <span>Refresh</span>
        </button>
      </header>

      {/* Stat Cards */}
      <section className={styles.section}>
        <div className={styles.statsGrid}>
          {stats.map((st, i) => <StatCard key={st.title} index={i} {...st} />)}
        </div>
      </section>

      {/* Revenue Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Revenue</h2>
        <div className={styles.panel} style={{ "--i": 7 }}>
          <div className={styles.revenueGrid}>
            <RevenueTile label="Weekly" value={overview?.revenue?.weekly} />
            <RevenueTile label="Monthly" value={overview?.revenue?.monthly} />
            <RevenueTile label="Quarterly" value={overview?.revenue?.quarterly} />
            <RevenueTile label="Annual" value={overview?.revenue?.annual} featured />
          </div>

          <div className={styles.rangeRow}>
            <div className={styles.rangeLabel}>
              <DollarOutlined /> Custom date range
            </div>
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
          </div>

          {customRevenue && (
            <div className={styles.rangeResult}>
              <div className={styles.rangeTotal}>
                <span className={styles.rangeTotalLabel}>Total</span>
                <span className={styles.rangeTotalValue}>₹{customRevenue.total_revenue?.toLocaleString()}</span>
              </div>
              {customRevenue.breakdown?.length > 0 && (
                <div className={styles.breakdownGrid}>
                  {customRevenue.breakdown.map((b, i) => (
                    <div key={b.month} className={styles.breakdownItem} style={{ "--i": i }}>
                      <span className={styles.breakdownMonth}>{b.month}</span>
                      <span className={styles.breakdownValue}>₹{b.revenue?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Users Tables */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Users</h2>
        <div className={`${styles.panel} ${styles.tablePanel}`} style={{ "--i": 8 }}>
          <Tabs items={tabItems} defaultActiveKey="active" />
        </div>
      </section>
    </div>
  );
};

export default Home;
