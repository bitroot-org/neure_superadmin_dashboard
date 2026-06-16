import React, { useState, useEffect, useCallback } from "react";
import {
  Table, Input, Select, DatePicker, Space, Tag, Button,
  Drawer, message, Typography, Divider, Spin, Timeline,
} from "antd";
import { SearchOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { prodeskGetPayments, prodeskGetPaymentDetail } from "../../services/api";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const STATUS_COLORS = { captured: "green", created: "blue", failed: "red", refunded: "orange" };
const STATUS_ICONS  = {
  captured: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
  failed:   <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
  created:  <ClockCircleOutlined style={{ color: "#1677ff" }} />,
  refunded: <ClockCircleOutlined style={{ color: "#fa8c16" }} />,
};

const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
    <span style={{ color: "#888", fontSize: 13 }}>{label}</span>
    <span style={{ fontWeight: 500, fontSize: 13, maxWidth: "65%", textAlign: "right", wordBreak: "break-all" }}>{value || "—"}</span>
  </div>
);

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentForFilter, setPaymentForFilter] = useState("");
  const [dateRange, setDateRange] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchPayments = useCallback(async (p = 1, s = "", status = "", payment_for = "", dr = null) => {
    setLoading(true);
    try {
      const res = await prodeskGetPayments({
        page: p, limit: 15, search: s, status, payment_for,
        start_date: dr?.[0] ? dr[0].format("YYYY-MM-DD") : "",
        end_date: dr?.[1] ? dr[1].format("YYYY-MM-DD") : "",
      });
      setPayments(res?.data || []);
      setTotal(res?.meta?.total || 0);
    } catch {
      message.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleSearch = () => { setPage(1); fetchPayments(1, search, statusFilter, paymentForFilter, dateRange); };
  const handleReset = () => {
    setSearch(""); setStatusFilter(""); setPaymentForFilter(""); setDateRange(null); setPage(1);
    fetchPayments(1, "", "", "", null);
  };

  const openDetail = async (record) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await prodeskGetPaymentDetail(record.payment_id);
      setDetail(res?.data || null);
    } catch {
      message.error("Failed to load payment detail");
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
      dataIndex: "plan_name",
      key: "plan_name",
      render: v => v ? <Tag>{v}</Tag> : "—",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: v => (
        <span style={{ fontWeight: 600, color: "#1677ff" }}>
          ₹{Number(v || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: v => <Tag color={STATUS_COLORS[v] || "default"}>{v}</Tag>,
    },
    {
      title: "Type",
      dataIndex: "payment_for",
      key: "payment_for",
      render: v => v ? <Tag color={v === "new" ? "geekblue" : "purple"}>{v}</Tag> : "—",
    },
    {
      title: "Razorpay Order",
      dataIndex: "razorpay_order_id",
      key: "razorpay_order_id",
      render: v => v ? <code style={{ fontSize: 11 }}>{v}</code> : "—",
    },
    {
      title: "Razorpay Payment",
      dataIndex: "razorpay_payment_id",
      key: "razorpay_payment_id",
      render: v => v ? <code style={{ fontSize: 11 }}>{v}</code> : <span style={{ color: "#ccc" }}>—</span>,
    },
    {
      title: "Paid At",
      dataIndex: "paid_at",
      key: "paid_at",
      render: v => v ? dayjs(v).format("DD MMM YYYY, HH:mm") : "—",
    },
  ];

  const d = detail;

  // Build timeline items from payment_logs
  const timelineItems = d?.payment_logs?.map((log, i) => ({
    dot: STATUS_ICONS[log.status] || <ClockCircleOutlined />,
    color: STATUS_COLORS[log.status] || "gray",
    children: (
      <div style={{ paddingBottom: 4 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
          <Tag color={STATUS_COLORS[log.status] || "default"}>{log.status}</Tag>
          {log.razorpay_payment_id && (
            <code style={{ fontSize: 11, color: "#52c41a" }}>{log.razorpay_payment_id}</code>
          )}
        </div>
        {log.razorpay_order_id && (
          <div style={{ fontSize: 12, color: "#888" }}>
            Order: <code style={{ fontSize: 11 }}>{log.razorpay_order_id}</code>
          </div>
        )}
        {log.amount && (
          <div style={{ fontSize: 12, color: "#888" }}>
            Amount: <strong>₹{Number(log.amount).toLocaleString()}</strong>
          </div>
        )}
        <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
          {log.paid_at
            ? dayjs(log.paid_at).format("DD MMM YYYY, HH:mm:ss")
            : log.created_at
              ? dayjs(log.created_at).format("DD MMM YYYY, HH:mm:ss")
              : ""}
        </div>
      </div>
    ),
  })) || [];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>Payments</Title>
        <p style={{ margin: 0, color: "#888", fontSize: 13 }}>All Razorpay payment transactions</p>
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
        <Select value={statusFilter} onChange={v => setStatusFilter(v)} style={{ width: 150 }} placeholder="All Statuses">
          <Option value="">All Statuses</Option>
          <Option value="captured">Captured</Option>
          <Option value="created">Created</Option>
          <Option value="failed">Failed</Option>
          <Option value="refunded">Refunded</Option>
        </Select>
        <Select value={paymentForFilter} onChange={v => setPaymentForFilter(v)} style={{ width: 130 }} placeholder="All Types">
          <Option value="">All Types</Option>
          <Option value="new">New</Option>
          <Option value="renewal">Renewal</Option>
        </Select>
        <RangePicker value={dateRange} onChange={setDateRange} format="YYYY-MM-DD" />
        <Button type="primary" onClick={handleSearch}>Search</Button>
        <Button icon={<ReloadOutlined />} onClick={handleReset} />
      </Space>

      <Table
        columns={columns}
        dataSource={payments}
        rowKey="payment_id"
        loading={loading}
        onRow={record => ({
          onClick: () => openDetail(record),
          style: { cursor: "pointer" },
        })}
        pagination={{
          current: page,
          pageSize: 15,
          total,
          onChange: p => { setPage(p); fetchPayments(p, search, statusFilter, paymentForFilter, dateRange); },
          showTotal: t => `Total ${t} payments`,
        }}
        scroll={{ x: "max-content" }}
      />

      {/* Detail Drawer */}
      <Drawer
        title={
          d ? (
            <div>
              <div style={{ fontWeight: 700 }}>Payment #{d.payment_id}</div>
              <div style={{ fontSize: 12, fontWeight: 400, color: "#888" }}>{d.therapist_name} — {d.email}</div>
            </div>
          ) : "Payment Detail"
        }
        width={520}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      >
        {detailLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : d ? (
          <div>
            {/* Amount + status hero */}
            <div style={{
              textAlign: "center", padding: "20px 16px", marginBottom: 20,
              background: "rgba(0,0,0,0.03)", borderRadius: 12,
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: d.status === "captured" ? "#52c41a" : d.status === "failed" ? "#ff4d4f" : "#1677ff" }}>
                ₹{Number(d.amount || 0).toLocaleString()}
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                <Tag color={STATUS_COLORS[d.status] || "default"} style={{ fontSize: 13, padding: "2px 10px" }}>{d.status}</Tag>
                {d.payment_for && <Tag color={d.payment_for === "new" ? "geekblue" : "purple"}>{d.payment_for}</Tag>}
              </div>
            </div>

            {/* Payment Info */}
            <div style={{ background: "rgba(0,0,0,0.02)", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment Info</div>
              <InfoRow label="Therapist" value={d.therapist_name} />
              <InfoRow label="Email" value={d.email} />
              <InfoRow label="Plan" value={d.plan_name} />
              <InfoRow label="Subscription ID" value={d.subscription_id ? `#${d.subscription_id}` : null} />
              <InfoRow label="Razorpay Order ID" value={d.razorpay_order_id} />
              <InfoRow label="Razorpay Payment ID" value={d.razorpay_payment_id} />
              <InfoRow label="Paid At" value={d.paid_at ? dayjs(d.paid_at).format("DD MMM YYYY, HH:mm:ss") : null} />
            </div>

            {/* Payment Logs Timeline */}
            {timelineItems.length > 0 && (
              <>
                <Divider orientation="left">
                  Payment Attempts ({timelineItems.length})
                </Divider>
                <div style={{ paddingLeft: 8 }}>
                  <Timeline items={timelineItems} />
                </div>
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

export default Payments;
