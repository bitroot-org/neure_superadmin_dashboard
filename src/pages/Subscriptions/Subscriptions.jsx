import React, { useState, useEffect, useCallback } from "react";
import {
  Table, Input, Select, Space, Tag, Button, message, Typography,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { prodeskGetSubscriptions, prodeskGetSubscriptionDetail } from "../../services/api";
import {
  DetailDrawer, Section, Summary, Field, Person, StatusBadge, Count, Progress,
  Timeline, TimelineItem, Row, Amount, Meta, Mono, formatINR, formatDate, byDateAsc,
} from "../../components/DetailDrawer/DetailDrawer";

const { Title } = Typography;
const { Option } = Select;

const STATUS_COLORS = { active: "green", expired: "red", cancelled: "orange", pending_payment: "gold" };
const SUB_TONE = { active: "success", expired: "error", cancelled: "pending", pending_payment: "warning", pending: "warning" };
const PAY_TONE = { captured: "success", failed: "error", created: "pending", refunded: "warning" };

const label = (v) => (v ? String(v).replace(/_/g, " ") : "unknown");

// Where "today" sits inside the current billing period.
const periodProgress = (start, end) => {
  if (!start || !end) return null;
  const s = dayjs(start), e = dayjs(end), now = dayjs();
  const total = e.diff(s, "day") || 1;
  const pct = Math.round((now.diff(s, "day") / total) * 100);
  const left = e.diff(now, "day");
  const caption = now.isBefore(s)
    ? `Starts ${s.format("DD MMM YYYY")}`
    : left < 0
      ? `Ended ${e.format("DD MMM YYYY")}`
      : `${left} day${left === 1 ? "" : "s"} left · renews ${e.format("DD MMM YYYY")}`;
  return { pct: Math.max(0, Math.min(100, pct)), caption, tone: left < 0 ? "error" : left <= 3 ? "warning" : "success" };
};

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
          <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{r.email}</div>
        </div>
      ),
    },
    {
      title: "Plan",
      key: "plan",
      render: (_, r) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Tag>{r.plan_name}</Tag>
          {r.access_type === "early_access" && <Tag style={{ fontSize: 10 }}>Early Access</Tag>}
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
          <div style={{ color: "var(--text-tertiary)" }}>→ {r.period_end ? dayjs(r.period_end).format("DD MMM YYYY") : "—"}</div>
        </div>
      ),
    },
    {
      title: "Offer",
      dataIndex: "offer_code",
      key: "offer_code",
      render: v => v ? <code style={{ fontSize: 12, color: "var(--accent-text)" }}>{v}</code> : "—",
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
        <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: 13 }}>All ProDesk subscription records</p>
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
      <DetailDrawer
        title={d ? `Subscription #${d.subscription_id}` : "Subscription detail"}
        badge={d && <StatusBadge tone={SUB_TONE[d.status] || "pending"}>{label(d.status)}</StatusBadge>}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        loading={detailLoading}
      >
        {d && (() => {
          const period = periodProgress(d.period_start, d.period_end);
          return (
            <>
              <Summary
                label={d.plan_name || "Plan"}
                value={formatINR(d.price_inr)}
                suffix={d.billing_cycle === "annual" ? "/ year" : d.billing_cycle === "monthly" ? "/ month" : null}
                meta={<>
                  {d.billing_cycle && <Tag>{d.billing_cycle}</Tag>}
                  {d.access_type === "early_access" && <Tag>Early Access</Tag>}
                </>}
              >
                {period && <Progress percent={period.pct} caption={period.caption} tone={period.tone} />}
              </Summary>

              <Section title="Customer">
                <Person name={d.therapist_name} email={d.email} />
              </Section>

              <Section title="Plan & billing">
                <Field label="Plan" value={d.plan_name} />
                <Field label="Billing cycle" value={d.billing_cycle} />
                <Field label="Price" value={formatINR(d.price_inr)} />
                <Field label="Period start" value={formatDate(d.period_start)} />
                <Field label="Period end" value={formatDate(d.period_end)} />
                <Field
                  label="Offer applied"
                  value={d.offer_code ? `${d.offer_code}${d.offer_name ? ` · ${d.offer_name}` : ""}` : null}
                />
              </Section>

              {d.payment_history?.length > 0 && (
                <Section title="Payment history" extra={<Count>{d.payment_history.length}</Count>}>
                  <Timeline>
                    {[...d.payment_history].sort(byDateAsc("paid_at", "created_at")).map((p, i) => (
                      <TimelineItem
                        key={p.payment_id || i}
                        tone={PAY_TONE[p.status] || "pending"}
                        label={`Payment ${i + 1}${p.payment_for ? ` · ${p.payment_for}` : ""}`}
                        time={formatDate(p.paid_at || p.created_at, { time: true })}
                      >
                        <Row
                          left={<StatusBadge tone={PAY_TONE[p.status] || "pending"}>{label(p.status)}</StatusBadge>}
                          right={<Amount>{formatINR(p.amount)}</Amount>}
                        />
                        {p.razorpay_payment_id && (
                          <Meta label="Payment"><Mono copy={p.razorpay_payment_id}>{p.razorpay_payment_id}</Mono></Meta>
                        )}
                        {p.razorpay_order_id && (
                          <Meta label="Order"><Mono copy={p.razorpay_order_id}>{p.razorpay_order_id}</Mono></Meta>
                        )}
                      </TimelineItem>
                    ))}
                  </Timeline>
                </Section>
              )}
            </>
          );
        })()}
      </DetailDrawer>
    </div>
  );
};

export default Subscriptions;
