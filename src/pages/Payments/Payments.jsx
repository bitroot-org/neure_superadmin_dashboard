import React, { useState, useEffect, useCallback } from "react";
import {
  Table, Input, Select, DatePicker, Space, Tag, Button, message, Typography,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { prodeskGetPayments, prodeskGetPaymentDetail } from "../../services/api";
import {
  DetailDrawer, Section, Summary, Field, Person, StatusBadge, Count,
  Timeline, TimelineItem, Row, Amount, Meta, Mono, formatINR, formatDate, byDateAsc,
} from "../../components/DetailDrawer/DetailDrawer";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const STATUS_COLORS = { captured: "green", created: "blue", failed: "red", refunded: "orange" };
const STATUS_TONE = { captured: "success", failed: "error", created: "pending", refunded: "warning" };

const PaymentStatus = ({ status }) => (
  <StatusBadge tone={STATUS_TONE[status] || "pending"}>{status || "unknown"}</StatusBadge>
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
          <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{r.email}</div>
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
        <span style={{ fontWeight: 600 }}>{formatINR(v)}</span>
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
      render: v => v ? <Tag>{v}</Tag> : "—",
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
      render: v => v ? <code style={{ fontSize: 11 }}>{v}</code> : <span style={{ color: "var(--text-quaternary, var(--text-tertiary))" }}>—</span>,
    },
    {
      title: "Paid At",
      dataIndex: "paid_at",
      key: "paid_at",
      render: v => v ? dayjs(v).format("DD MMM YYYY, HH:mm") : "—",
    },
  ];

  const d = detail;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>Payments</Title>
        <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: 13 }}>All Razorpay payment transactions</p>
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
      <DetailDrawer
        title={d ? `Payment #${d.payment_id}` : "Payment detail"}
        badge={d && <PaymentStatus status={d.status} />}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        loading={detailLoading}
      >
        {d && (
          <>
            <Summary
              label="Amount"
              value={formatINR(d.amount)}
              meta={<>
                {d.payment_for && <Tag>{d.payment_for}</Tag>}
                {d.paid_at && <span>Paid {formatDate(d.paid_at, { time: true })}</span>}
              </>}
            />

            <Section title="Customer">
              <Person name={d.therapist_name} email={d.email} extra={d.plan_name && <Tag style={{ margin: 0 }}>{d.plan_name}</Tag>} />
            </Section>

            <Section title="Transaction">
              <Field label="Subscription" value={d.subscription_id ? `#${d.subscription_id}` : null} />
              <Field label="Razorpay order" value={d.razorpay_order_id} copyable mono />
              <Field label="Razorpay payment" value={d.razorpay_payment_id} copyable mono />
              <Field label="Paid at" value={formatDate(d.paid_at, { seconds: true })} />
            </Section>

            {d.payment_logs?.length > 0 && (
              <Section title="Payment attempts" extra={<Count>{d.payment_logs.length}</Count>}>
                <Timeline>
                  {[...d.payment_logs].sort(byDateAsc("paid_at", "created_at")).map((log, i) => (
                    <TimelineItem
                      key={log.razorpay_payment_id || i}
                      tone={STATUS_TONE[log.status] || "pending"}
                      label={`Attempt ${i + 1}`}
                      time={formatDate(log.paid_at || log.created_at, { seconds: true })}
                    >
                      <Row left={<PaymentStatus status={log.status} />} right={log.amount && <Amount>{formatINR(log.amount)}</Amount>} />
                      {log.razorpay_payment_id && (
                        <Meta label="Payment"><Mono copy={log.razorpay_payment_id}>{log.razorpay_payment_id}</Mono></Meta>
                      )}
                      {log.razorpay_order_id && (
                        <Meta label="Order"><Mono copy={log.razorpay_order_id}>{log.razorpay_order_id}</Mono></Meta>
                      )}
                    </TimelineItem>
                  ))}
                </Timeline>
              </Section>
            )}
          </>
        )}
      </DetailDrawer>
    </div>
  );
};

export default Payments;
