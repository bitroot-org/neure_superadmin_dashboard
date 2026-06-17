import React, { useState, useEffect, useCallback } from "react";
import {
  Table, Button, Input, Space, Tag, Drawer, Modal, Form,
  message, Typography, Divider, Tabs, Descriptions,
} from "antd";
import {
  SearchOutlined, ReloadOutlined, EyeOutlined, DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  prodeskGetReferrals, prodeskGetReferralDetail,
  prodeskGetPendingPayouts, prodeskProcessPayout,
} from "../../services/api";

const { Title } = Typography;

const Referrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [referralDetail, setReferralDetail] = useState(null);

  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [payoutForm] = Form.useForm();
  const [processing, setProcessing] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const fetchReferrals = useCallback(async (p = 1, s = "") => {
    setLoading(true);
    try {
      const res = await prodeskGetReferrals({ page: p, limit: 10, search: s });
      setReferrals(res?.data || []);
      setTotal(res?.meta?.total || 0);
    } catch {
      message.error("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingPayouts = useCallback(async () => {
    setPendingLoading(true);
    try {
      const res = await prodeskGetPendingPayouts();
      setPendingPayouts(res?.data || []);
    } catch {
      message.error("Failed to load pending payouts");
    } finally {
      setPendingLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
    fetchPendingPayouts();
  }, [fetchReferrals, fetchPendingPayouts]);

  const handleSearch = () => {
    setPage(1);
    fetchReferrals(1, search);
  };

  const handleReset = () => {
    setSearch(""); setPage(1);
    fetchReferrals(1, "");
  };

  const openDetail = async (record) => {
    setDetailDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await prodeskGetReferralDetail(record.therapist_id);
      setReferralDetail(res?.data || null);
    } catch {
      message.error("Failed to load referral detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleProcessPayout = async (values) => {
    if (!selectedRowKeys.length) { message.warning("Select at least one therapist"); return; }
    setProcessing(true);
    try {
      const bank_transfer_refs = {};
      selectedRowKeys.forEach(id => {
        bank_transfer_refs[id] = values[`utr_${id}`] || "";
      });
      const res = await prodeskProcessPayout({
        therapist_ids: selectedRowKeys,
        payout_month: values.payout_month.format("YYYY-MM-DD"),
        bank_transfer_refs,
      });
      if (res?.status) {
        message.success(`Processed ${res.data.processed} payouts — ₹${res.data.total_disbursed}`);
        setPayoutModalOpen(false);
        payoutForm.resetFields();
        setSelectedRowKeys([]);
        fetchPendingPayouts();
      } else {
        message.error(res?.message || "Failed to process payouts");
      }
    } catch {
      message.error("Failed to process payouts");
    } finally {
      setProcessing(false);
    }
  };

  const referralColumns = [
    {
      title: "Therapist",
      key: "therapist",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.name}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{r.email}</div>
        </div>
      ),
    },
    {
      title: "Referral Code",
      dataIndex: "referral_code",
      key: "referral_code",
      render: v => <code style={{ fontWeight: 600, color: "#1677ff" }}>{v}</code>,
    },
    { title: "Referred", dataIndex: "referred_count", key: "referred_count", render: v => v || 0 },
    {
      title: "Total Earned",
      dataIndex: "total_earned",
      key: "total_earned",
      render: v => `₹${Number(v || 0).toLocaleString()}`,
    },
    {
      title: "Pending Balance",
      dataIndex: "pending_balance",
      key: "pending_balance",
      render: v => <span style={{ color: v > 0 ? "#fa8c16" : "inherit" }}>₹{Number(v || 0).toLocaleString()}</span>,
    },
    {
      title: "Total Paid",
      dataIndex: "total_paid",
      key: "total_paid",
      render: v => `₹${Number(v || 0).toLocaleString()}`,
    },
    {
      title: "Last Disbursement",
      key: "last_disbursement",
      render: (_, r) => (
        <div>
          <div>{r.last_disbursement_date ? dayjs(r.last_disbursement_date).format("DD MMM YYYY") : "—"}</div>
          {r.last_disbursement_status && (
            <Tag color={r.last_disbursement_status === "paid" ? "green" : "orange"} style={{ fontSize: 10 }}>
              {r.last_disbursement_status}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(record)}>Detail</Button>
      ),
    },
  ];

  const pendingColumns = [
    {
      title: "Therapist",
      key: "therapist",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.name}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{r.email}</div>
        </div>
      ),
    },
    {
      title: "Pending Balance",
      dataIndex: "pending_balance",
      key: "pending_balance",
      render: v => <strong style={{ color: "#fa8c16" }}>₹{Number(v || 0).toLocaleString()}</strong>,
    },
    {
      title: "Bank Account",
      dataIndex: "bank_account",
      key: "bank_account",
      render: v => v || "Not provided",
    },
  ];

  const detailTabs = referralDetail ? [
    {
      key: "referred",
      label: "Referrals",
      children: (
        <Table
          size="small"
          dataSource={referralDetail.referrals || []}
          rowKey="referred_email"
          pagination={false}
          columns={[
            { title: "Name", dataIndex: "referred_name" },
            { title: "Email", dataIndex: "referred_email" },
            { title: "Status", dataIndex: "status", render: v => <Tag color={v === "rewarded" ? "green" : "blue"}>{v}</Tag> },
            { title: "Reward", dataIndex: "reward_amount", render: v => `₹${v || 0}` },
            { title: "Converted", dataIndex: "converted_at", render: v => v ? dayjs(v).format("DD MMM YYYY") : "—" },
          ]}
        />
      ),
    },
    {
      key: "payouts",
      label: "Payouts",
      children: (
        <Table
          size="small"
          dataSource={referralDetail.payouts || []}
          rowKey="payout_month"
          pagination={false}
          columns={[
            { title: "Month", dataIndex: "payout_month", render: v => v ? dayjs(v).format("MMM YYYY") : "—" },
            { title: "Amount", dataIndex: "amount", render: v => `₹${v || 0}` },
            { title: "Status", dataIndex: "status", render: v => <Tag color={v === "paid" ? "green" : "orange"}>{v}</Tag> },
            { title: "Paid On", dataIndex: "paid_on", render: v => v ? dayjs(v).format("DD MMM YYYY") : "—" },
            { title: "UTR Ref", dataIndex: "bank_transfer_ref", render: v => v || "—" },
          ]}
        />
      ),
    },
    {
      key: "ledger",
      label: "Ledger",
      children: (
        <Table
          size="small"
          dataSource={referralDetail.ledger || []}
          rowKey={(r, i) => i}
          pagination={false}
          columns={[
            {
              title: "Type",
              dataIndex: "type",
              render: v => <Tag color={v === "credit" ? "green" : "red"}>{v}</Tag>,
            },
            { title: "Amount", dataIndex: "amount", render: v => `₹${v || 0}` },
            { title: "Description", dataIndex: "description" },
            { title: "Balance After", dataIndex: "balance_after", render: v => `₹${v || 0}` },
            { title: "Date", dataIndex: "created_at", render: v => v ? dayjs(v).format("DD MMM YYYY") : "—" },
          ]}
        />
      ),
    },
  ] : [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Referral Program</Title>
          <p style={{ margin: 0, color: "#888", fontSize: 13 }}>Track referrals, earnings, and process payouts</p>
        </div>
        <Button
          type="primary"
          icon={<DollarOutlined />}
          onClick={() => { setPayoutModalOpen(true); }}
          disabled={!pendingPayouts.length}
        >
          Process Payouts ({pendingPayouts.length})
        </Button>
      </div>

      {/* Pending Payouts Summary */}
      {pendingPayouts.length > 0 && (
        <div style={{
          background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: 8,
          padding: "12px 16px", marginBottom: 20,
        }}>
          <strong>⏳ {pendingPayouts.length} therapists have pending payouts</strong>
          <span style={{ color: "#888", fontSize: 13, marginLeft: 8 }}>
            Total: ₹{pendingPayouts.reduce((s, p) => s + (parseFloat(p.pending_balance) || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {/* Referrals Table */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Search therapist / email"
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 240 }}
        />
        <Button type="primary" onClick={handleSearch}>Search</Button>
        <Button icon={<ReloadOutlined />} onClick={handleReset} />
      </Space>

      <Table
        columns={referralColumns}
        dataSource={referrals}
        rowKey="therapist_id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: 10,
          total,
          onChange: p => { setPage(p); fetchReferrals(p, search); },
          showTotal: t => `Total ${t} therapists`,
        }}
        scroll={{ x: "max-content" }}
      />

      {/* Referral Detail Drawer */}
      <Drawer
        title={referralDetail ? `${referralDetail.name} — ${referralDetail.referral_code}` : "Referral Detail"}
        width={700}
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        loading={detailLoading}
      >
        {referralDetail && (
          <div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
              {[
                { label: "Total Earned", value: `₹${Number(referralDetail.wallet?.total_earned || 0).toLocaleString()}`, color: "#52c41a" },
                { label: "Pending Balance", value: `₹${Number(referralDetail.wallet?.pending_balance || 0).toLocaleString()}`, color: "#fa8c16" },
                { label: "Total Paid", value: `₹${Number(referralDetail.wallet?.total_paid || 0).toLocaleString()}`, color: "#1677ff" },
                { label: "Current Balance", value: `₹${Number(referralDetail.wallet?.balance || 0).toLocaleString()}`, color: "#722ed1" },
              ].map(c => (
                <div key={c.label} style={{ flex: 1, minWidth: 120, padding: "12px 16px", background: "rgba(0,0,0,0.03)", borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#888" }}>{c.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: c.color }}>{c.value}</div>
                </div>
              ))}
            </div>
            <Tabs items={detailTabs} />
          </div>
        )}
      </Drawer>

      {/* Process Payout Modal */}
      <Modal
        title="Process Payouts"
        open={payoutModalOpen}
        onCancel={() => { setPayoutModalOpen(false); payoutForm.resetFields(); setSelectedRowKeys([]); }}
        footer={null}
        width={680}
      >
        <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>
          Select therapists to process payouts for and enter their bank transfer UTR references.
        </p>
        <Table
          size="small"
          rowSelection={{
            selectedRowKeys,
            onChange: keys => setSelectedRowKeys(keys),
          }}
          dataSource={pendingPayouts}
          rowKey="therapist_id"
          loading={pendingLoading}
          pagination={false}
          columns={pendingColumns}
          style={{ marginBottom: 20 }}
        />
        {selectedRowKeys.length > 0 && (
          <Form form={payoutForm} layout="vertical" onFinish={handleProcessPayout}>
            <Form.Item name="payout_month" label="Payout Month" rules={[{ required: true, message: "Required" }]}>
              <DatePicker picker="month" style={{ width: "100%" }} />
            </Form.Item>
            <Divider orientation="left">UTR References</Divider>
            {selectedRowKeys.map(id => {
              const t = pendingPayouts.find(p => p.therapist_id === id);
              return t ? (
                <Form.Item key={id} name={`utr_${id}`} label={`${t.name} (₹${t.pending_balance})`} rules={[{ required: true, message: "UTR required" }]}>
                  <Input placeholder="Bank transfer UTR reference" />
                </Form.Item>
              ) : null;
            })}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button onClick={() => { setPayoutModalOpen(false); payoutForm.resetFields(); setSelectedRowKeys([]); }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={processing}>
                Process {selectedRowKeys.length} Payout{selectedRowKeys.length > 1 ? "s" : ""}
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default Referrals;
