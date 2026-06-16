import React, { useState, useEffect, useCallback } from "react";
import { Table, Input, Tag, Button, Space, Typography, message } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { prodeskGetDeactivatedAccounts } from "../../services/api";
import styles from "./AccountsDeactivation.module.css";

const { Title } = Typography;

const PLAN_COLORS = { starter: "blue", professional: "purple", clinic: "gold" };

const AccountsDeactivation = () => {
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchAccounts = useCallback(async (p = 1, s = "") => {
    setLoading(true);
    try {
      const res = await prodeskGetDeactivatedAccounts({ page: p, limit: 10, search: s });
      setAccounts(res?.data || []);
      setTotal(res?.meta?.total || 0);
    } catch {
      message.error("Failed to load deactivated accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleSearch = () => {
    setPage(1);
    fetchAccounts(1, search);
  };

  const handleReset = () => {
    setSearch("");
    setPage(1);
    fetchAccounts(1, "");
  };

  const columns = [
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
    { title: "Phone", dataIndex: "phone", key: "phone", render: v => v || "—" },
    {
      title: "Plan",
      key: "plan",
      render: (_, r) => (
        <Tag color={PLAN_COLORS[r.plan_type] || "default"}>{r.plan_name || r.plan_type || "—"}</Tag>
      ),
    },
    {
      title: "Billing",
      dataIndex: "billing_cycle",
      key: "billing_cycle",
      render: v => v ? <Tag>{v}</Tag> : "—",
    },
    {
      title: "Amount Paid",
      dataIndex: "amount_paid",
      key: "amount_paid",
      render: v => v != null ? `₹${Number(v).toLocaleString()}` : "—",
    },
    {
      title: "Activated On",
      dataIndex: "activation_date",
      key: "activation_date",
      render: v => v ? dayjs(v).format("DD MMM YYYY") : "—",
    },
    {
      title: "Deactivated On",
      dataIndex: "deactivated_on",
      key: "deactivated_on",
      render: v => v ? dayjs(v).format("DD MMM YYYY") : "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: v => <Tag color="red">{v || "cancelled"}</Tag>,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>Accounts Deactivated</Title>
        <p style={{ margin: 0, color: "#888", fontSize: 13 }}>
          ProDesk psychologists who have discontinued their subscription
        </p>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Search name / email"
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
        columns={columns}
        dataSource={accounts}
        rowKey={r => r.therapist_id}
        loading={loading}
        pagination={{
          current: page,
          pageSize: 10,
          total,
          onChange: p => { setPage(p); fetchAccounts(p, search); },
          showTotal: t => `Total ${t} deactivated accounts`,
        }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default AccountsDeactivation;
