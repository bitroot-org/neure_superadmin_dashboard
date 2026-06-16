import React, { useState, useEffect, useCallback } from "react";
import {
  Table, Input, Select, Space, Tag, Button, Drawer,
  message, Typography, Descriptions, Divider, Spin, Badge,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { prodeskGetSubscriptions, prodeskGetSubscriptionDetail } from "../../services/api";

const { Title } = Typography;
const { Option } = Select;

const PLAN_COLORS   = { starter: "blue", professional: "purple", clinic: "gold" };
const STATUS_COLORS = { active: "green", expired: "red", cancelled: "orange", pending_payment: "gold" };
const PAY_COLORS    = { captured: "green", created: "blue", failed: "red", refunded: "orange" };

const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
    <span style={{ color: "#888", fontSize: 13 }}>{label}</span>
    <span style={{ fontWeight: 500, fontSize: 13 }}>{value || "—"}</span>
  </div>
);

const Subscriptions = () => {
  const [subs, setSubs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [billingFilter, setBillingFilter] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchSubs = useCallback(async (p = 1, s = "", plan = "", status = "", billing = "") => {
    setLoading(true);
    try {
      const res = await prodeskGetSubscriptions({ page: p, limit: 15, search: s, plan_type: plan, status, billing_cycle: billing });
      setSubs(res?.data || []);
      setTotal(res?.meta?.total || 0);
    } catch {
      message.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const handleSearch = () => { setPage(1); fetchSubs(1, search, planFilter, statusFilter, billingFilter); };
  const handleReset = () => {
    setSearch(""); setPlanFilter(""); setStatusFilter(""); setBillingFilter(""); setPage(1);
    fetchSubs(1, "", "", "", "");
  };

  const openDetail = async (record) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await prodeskGetSubscriptionDetail(record.subscription_id);
      setDetail(res?.data || null);
    } catch {
      message.error("Failed to load subscription detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      title: "Therapist",
      key: "therapist",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.therapist_name}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{r.email}</div>
        </div>
      ),
    },
    {
      title: "Plan",
      key: "plan",
      render: (_, r) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Tag color={PLAN_COLORS[r.plan_type] || "default"}>{r.plan_name}</Tag>
          {r.access_type === "early_access" && <Tag color="cyan" style={{ fontSize: 10 }}>Early Access</Tag>}
        </div>
      ),
    },
    {
      title: "Billing",
      dataIndex: "billing_cycle",
      key: "billing_cycle",
      render: v => v ? <Tag>{v}</Tag> : "—",
    },
    {
      title: "Amount",
      dataIndex: "amount_paid",
      key: "amount_paid",
      render: v => v != null ? `₹${Number(v).toLocaleString()}` : "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: v => <Tag color={STATUS_COLORS[v] || "default"}>{v}</Tag>,
    },
    {
      title: "Period",
      key: "period",
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <div>{r.period_start ? dayjs(r.period_start).format("DD MMM YYYY") : "—"}</div>
          <div style={{ color: "#888" }}>→ {r.period_end ? dayjs(r.period_end).format("DD MMM YYYY") : "—"}</div>
        </div>
      ),
    },
    {
      title: "Offer",
      dataIndex: "offer_code",
      key: "offer_code",
      render: v => v ? <code style={{ fontSize: 12, color: "#1677ff" }}>{v}</code> : "—",
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: v => v ? dayjs(v).format("DD MMM YYYY") : "—",
    },
  ];

  const d = detail;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>Subscriptions</Title>
        <p style={{ margin: 0, color: "#888", fontSize: 13 }}>All ProDesk subscription records</p>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Search therapist / email"
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 220 }}
        />
        <Select value={planFilter} onChange={v => setPlanFilter(v)} style={{ width: 160 }} placeholder="All Plans">
          <Option value="">All Plans</Option>
          <Option value="starter">Starter</Option>
          <Option value="professional">Professional</Option>
          <Option value="clinic">Clinic + Staff</Option>
        </Select>
        <Select value={statusFilter} onChange={v => setStatusFilter(v)} style={{ width: 160 }} placeholder="All Statuses">
          <Option value="">All Statuses</Option>
          <Option value="active">Active</Option>
          <Option value="expired">Expired</Option>
          <Option value="cancelled">Cancelled</Option>
          <Option value="pending_payment">Pending Payment</Option>
        </Select>
        <Select value={billingFilter} onChange={v => setBillingFilter(v)} style={{ width: 140 }} placeholder="All Billing">
          <Option value="">All Billing</Option>
          <Option value="monthly">Monthly</Option>
          <Option value="annual">Annual</Option>
        </Select>
        <Button type="primary" onClick={handleSearch}>Search</Button>
        <Button icon={<ReloadOutlined />} onClick={handleReset} />
      </Space>

      <Table
        columns={columns}
        dataSource={subs}
        rowKey="subscription_id"
        loading={loading}
        onRow={record => ({
          onClick: () => openDetail(record),
          style: { cursor: "pointer" },
        })}
        pagination={{
          current: page,
          pageSize: 15,
          total,
          onChange: p => { setPage(p); fetchSubs(p, search, planFilter, statusFilter, billingFilter); },
          showTotal: t => `Total ${t} subscriptions`,
        }}
        scroll={{ x: "max-content" }}
      />

      {/* Detail Drawer */}
      <Drawer
        title={d ? `Subscription #${d.subscription_id} — ${d.therapist_name}` : "Subscription Detail"}
        width={560}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      >
        {detailLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : d ? (
          <div>
            {/* Status badges */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              <Tag color={STATUS_COLORS[d.status] || "default"} style={{ fontSize: 13, padding: "2px 10px" }}>{d.status}</Tag>
              <Tag color={PLAN_COLORS[d.plan_type] || "default"}>{d.plan_name}</Tag>
              {d.access_type === "early_access" && <Tag color="cyan">Early Access</Tag>}
            </div>

            {/* Subscription Info */}
            <div style={{ background: "rgba(0,0,0,0.02)", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Subscription Info</div>
              <InfoRow label="Therapist" value={d.therapist_name} />
              <InfoRow label="Email" value={d.email} />
              <InfoRow label="Plan" value={d.plan_name} />
              <InfoRow label="Billing Cycle" value={d.billing_cycle} />
              <InfoRow label="Price" value={`₹${Number(d.price_inr || 0).toLocaleString()}`} />
              <InfoRow label="Period Start" value={d.period_start ? dayjs(d.period_start).format("DD MMM YYYY") : null} />
              <InfoRow label="Period End" value={d.period_end ? dayjs(d.period_end).format("DD MMM YYYY") : null} />
              {d.offer_code && (
                <InfoRow
                  label="Offer Applied"
                  value={`${d.offer_code}${d.offer_name ? ` — ${d.offer_name}` : ""}`}
                />
              )}
            </div>

            {/* Payment History */}
            {d.payment_history?.length > 0 && (
              <>
                <Divider orientation="left">Payment History ({d.payment_history.length})</Divider>
                {d.payment_history.map((p, i) => (
                  <div key={p.payment_id || i} style={{
                    border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: "14px 16px",
                    marginBottom: 12,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Tag color={PAY_COLORS[p.status] || "default"}>{p.status}</Tag>
                        {p.payment_for && <Tag>{p.payment_for}</Tag>}
                      </div>
                      <span style={{ fontWeight: 700, color: "#1677ff", fontSize: 15 }}>
                        ₹{Number(p.amount || 0).toLocaleString()}
                      </span>
                    </div>
                    <InfoRow label="Razorpay Order" value={p.razorpay_order_id} />
                    <InfoRow label="Razorpay Payment" value={p.razorpay_payment_id} />
                    <InfoRow label="Paid At" value={p.paid_at ? dayjs(p.paid_at).format("DD MMM YYYY, HH:mm") : null} />
                    <InfoRow label="Created At" value={p.created_at ? dayjs(p.created_at).format("DD MMM YYYY, HH:mm") : null} />
                  </div>
                ))}
              </>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "#aaa", padding: 40 }}>No data available</div>
        )}
      </Drawer>
    </div>
  );
};

export default Subscriptions;
