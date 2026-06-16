import React, { useState, useEffect } from "react";
import {
  Table, Button, Drawer, Form, Input, Select,
  Space, message, Modal, Tag, Tooltip, Descriptions,
  Avatar, Divider, Spin, Badge,
} from "antd";
import {
  PlusOutlined, CopyOutlined, DownloadOutlined,
  CheckOutlined, EyeInvisibleOutlined, EyeTwoTone,
  SearchOutlined, ReloadOutlined, EditOutlined,
  CalendarOutlined, TeamOutlined, FileTextOutlined, WalletOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  prodeskGetTherapists,
  prodeskGetTherapistById,
  createProdeskTherapist,
  updateTherapist,
  deleteTherapist,
} from "../../services/api";

const PLAN_COLORS = { starter: "blue", professional: "purple", clinic: "gold" };
const SUB_STATUS_COLORS = { active: "green", expired: "red", cancelled: "orange", pending_payment: "gold" };

const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-primary, #f0f0f0)" }}>
    <span style={{ color: "#888", fontSize: 13 }}>{label}</span>
    <span style={{ fontWeight: 500, fontSize: 13, textAlign: "right", maxWidth: "60%" }}>{value || "—"}</span>
  </div>
);

const SectionCard = ({ title, children }) => (
  <div style={{ background: "rgba(0,0,0,0.02)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
    <div style={{ fontWeight: 600, fontSize: 13, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>
    {children}
  </div>
);

const StatPill = ({ label, value, color }) => (
  <div style={{ flex: 1, textAlign: "center", padding: "10px 8px", background: "rgba(0,0,0,0.03)", borderRadius: 8 }}>
    <div style={{ fontSize: 18, fontWeight: 700, color: color || "inherit" }}>{value}</div>
    <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{label}</div>
  </div>
);

const ProDeskTherapists = () => {
  const [therapists, setTherapists] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // Detail drawer
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Edit drawer
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [editForm] = Form.useForm();

  // Credentials modal
  const [credsModal, setCredsModal] = useState(false);
  const [newCreds, setNewCreds] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => { fetchTherapists(); }, []);

  const fetchTherapists = async (p = 1, s = "", plan = "", sub_status = "") => {
    setLoading(true);
    try {
      const res = await prodeskGetTherapists({ page: p, limit: 10, search: s, plan_type: plan, subscription_status: sub_status });
      setTherapists(res?.data || []);
      setTotal(res?.meta?.total || 0);
    } catch {
      message.error("Failed to fetch therapists");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchTherapists(1, search, planFilter, statusFilter);
  };

  const handleReset = () => {
    setSearch(""); setPlanFilter(""); setStatusFilter(""); setPage(1);
    fetchTherapists(1, "", "", "");
  };

  const openDetail = async (record) => {
    setDetailOpen(true);
    setDetailData(null);
    setDetailLoading(true);
    try {
      const res = await prodeskGetTherapistById(record.therapist_id || record.user_id);
      setDetailData(res?.data || null);
    } catch {
      message.error("Failed to load therapist details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreate = async (values) => {
    setSubmitting(true);
    try {
      const res = await createProdeskTherapist({ ...values, username: values.email });
      if (res?.status) {
        message.success("Therapist created successfully");
        setDrawerOpen(false);
        form.resetFields();
        fetchTherapists(page, search, planFilter, statusFilter);
        setNewCreds({ name: `${values.first_name} ${values.last_name}`, email: values.email, password: values.password });
        setCredsModal(true);
      } else {
        message.error(res?.message || "Failed to create therapist");
      }
    } catch (err) {
      message.error(err?.message || "Failed to create therapist");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOpen = (record, e) => {
    e?.stopPropagation();
    setSelectedTherapist(record);
    editForm.setFieldsValue({
      first_name: record.first_name || record.name?.split(" ")[0],
      last_name: record.last_name || record.name?.split(" ").slice(1).join(" "),
      email: record.email,
      phone: record.phone,
      gender: record.gender,
      designation: record.designation,
      qualification: record.qualification,
      specialization: record.specialization,
      years_of_experience: record.years_of_experience || record.experience_years,
      booking_slug: record.booking_slug,
      bio: record.bio,
      about_me: record.about_me,
    });
    setEditDrawerOpen(true);
  };

  const handleUpdate = async (values) => {
    setUpdating(true);
    try {
      const id = selectedTherapist?.user_id;
      const res = await updateTherapist(id, values);
      if (res?.status) {
        message.success("Therapist updated successfully");
        setEditDrawerOpen(false);
        fetchTherapists(page, search, planFilter, statusFilter);
        if (detailOpen && detailData?.user_id === id) {
          openDetail(selectedTherapist);
        }
      } else {
        message.error(res?.message || "Failed to update");
      }
    } catch {
      message.error("Failed to update therapist");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = (record, e) => {
    e?.stopPropagation();
    Modal.confirm({
      title: "Delete this therapist?",
      content: `${record.name || `${record.first_name} ${record.last_name}`} will be removed permanently.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteTherapist(record.user_id);
          message.success("Therapist deleted");
          fetchTherapists(page, search, planFilter, statusFilter);
          if (detailOpen) setDetailOpen(false);
        } catch {
          message.error("Failed to delete therapist");
        }
      },
    });
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1800);
    });
  };

  const downloadCSV = (creds) => {
    const rows = [
      ["Name", "Email", "Password", "Login URL"],
      [creds.name, creds.email, creds.password, window.location.origin.replace(":5173", ":3000") + "/login"],
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `credentials-${creds.email}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllCSV = () => {
    if (!therapists.length) return;
    const rows = [["Name", "Email", "Phone", "Plan", "Sub Status", "Account Status"]];
    therapists.forEach((t) => {
      rows.push([
        t.name || `${t.first_name} ${t.last_name}`,
        t.email, t.phone || "",
        t.subscription?.plan_name || "No Plan",
        t.subscription?.status || "—",
        t.is_active ? "Active" : "Inactive",
      ]);
    });
    const csv = rows.map((r) => r.map((v) => `"${v ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `therapists-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar
            src={r.profile_url}
            style={{ background: "#4f8ef7", fontWeight: 600, fontSize: 14, flexShrink: 0 }}
            size={36}
          >
            {(r.first_name || r.name)?.[0]?.toUpperCase() || "?"}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{r.name || `${r.first_name} ${r.last_name}`}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{r.email}</div>
          </div>
        </div>
      ),
    },
    { title: "Phone", dataIndex: "phone", key: "phone", render: v => v || "—" },
    {
      title: "Plan",
      key: "plan",
      render: (_, r) => {
        const sub = r.subscription;
        if (!sub) return <Tag>No Plan</Tag>;
        return (
          <div>
            <Tag color={PLAN_COLORS[sub.plan_type] || "default"}>{sub.plan_name || sub.plan_type}</Tag>
            {sub.access_type === "early_access" && <Tag color="cyan" style={{ fontSize: 10 }}>Early Access</Tag>}
          </div>
        );
      },
    },
    {
      title: "Billing",
      key: "billing",
      render: (_, r) => r.subscription?.billing_cycle ? <Tag>{r.subscription.billing_cycle}</Tag> : "—",
    },
    {
      title: "Sub. Status",
      key: "sub_status",
      render: (_, r) => {
        const s = r.subscription?.status;
        return s ? <Tag color={SUB_STATUS_COLORS[s] || "default"}>{s}</Tag> : "—";
      },
    },
    {
      title: "Account",
      key: "is_active",
      render: (_, r) => (
        <Tag color={r.is_active ? "green" : "red"}>{r.is_active ? "Active" : "Inactive"}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space onClick={e => e.stopPropagation()}>
          <Button size="small" icon={<EditOutlined />} onClick={(e) => handleEditOpen(record, e)}>Edit</Button>
          <Button size="small" danger onClick={(e) => handleDelete(record, e)}>Delete</Button>
        </Space>
      ),
    },
  ];

  const profileFields = (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "Required" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Required" }]}>
          <Input />
        </Form.Item>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Form.Item name="designation" label="Designation">
          <Input placeholder="e.g. Clinical Psychologist" />
        </Form.Item>
        <Form.Item name="qualification" label="Qualification">
          <Input placeholder="e.g. PhD Psychology" />
        </Form.Item>
      </div>
      <Form.Item name="phone" label="Phone">
        <Input maxLength={13} />
      </Form.Item>
      <Form.Item name="gender" label="Gender" rules={[{ required: true, message: "Required" }]}>
        <Select>
          <Select.Option value="male">Male</Select.Option>
          <Select.Option value="female">Female</Select.Option>
          <Select.Option value="other">Other</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="specialization" label="Specialization" rules={[{ required: true, message: "Required" }]}>
        <Input.TextArea rows={2} />
      </Form.Item>
      <Form.Item name="years_of_experience" label="Years of Experience" rules={[{ required: true, message: "Required" }]}>
        <Input type="number" min={0} />
      </Form.Item>
      <Form.Item name="booking_slug" label="Booking Slug"
        extra="Unique URL for therapist's public booking page (e.g. dr-priya)">
        <Input placeholder="e.g. dr-priya-sharma" />
      </Form.Item>
      <Form.Item name="bio" label="Bio" rules={[{ required: true, message: "Required" }]}>
        <Input.TextArea rows={3} placeholder="Short bio shown in the app" />
      </Form.Item>
      <Form.Item name="about_me" label="About Me (Public Booking Page)">
        <Input.TextArea rows={3} placeholder="Detailed bio shown on public booking page" />
      </Form.Item>
    </>
  );

  // Detail drawer content
  const d = detailData;
  const sub = d?.subscription;
  const avail = d?.availability;
  const stats = d?.stats;
  const wallet = d?.wallet;
  const branding = d?.branding;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Therapists</h1>
          <p style={{ margin: 0, color: "#888", fontSize: 13 }}>Manage therapists and their ProDesk login access</p>
        </div>
        <Space>
          <Tooltip title="Download list of all therapists">
            <Button icon={<DownloadOutlined />} onClick={downloadAllCSV}>Export CSV</Button>
          </Tooltip>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
            Add Therapist
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Search name / email"
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 220 }}
        />
        <Select value={planFilter} onChange={v => setPlanFilter(v)} style={{ width: 170 }}>
          <Select.Option value="">All Plans</Select.Option>
          <Select.Option value="starter">Starter (Free)</Select.Option>
          <Select.Option value="professional">Professional</Select.Option>
          <Select.Option value="clinic">Clinic + Staff</Select.Option>
        </Select>
        <Select value={statusFilter} onChange={v => setStatusFilter(v)} style={{ width: 170 }}>
          <Select.Option value="">All Statuses</Select.Option>
          <Select.Option value="active">Active</Select.Option>
          <Select.Option value="expired">Expired</Select.Option>
          <Select.Option value="cancelled">Cancelled</Select.Option>
          <Select.Option value="pending_payment">Pending Payment</Select.Option>
        </Select>
        <Button type="primary" onClick={handleSearch}>Search</Button>
        <Button icon={<ReloadOutlined />} onClick={handleReset} />
      </Space>

      <Table
        columns={columns}
        dataSource={therapists}
        rowKey={r => r.user_id || r.therapist_id}
        loading={loading}
        onRow={record => ({
          onClick: () => openDetail(record),
          style: { cursor: "pointer" },
        })}
        pagination={{
          current: page,
          pageSize: 10,
          total,
          onChange: p => { setPage(p); fetchTherapists(p, search, planFilter, statusFilter); },
          showTotal: t => `Total ${t} therapists`,
        }}
        scroll={{ x: "max-content" }}
      />

      {/* ── Therapist Detail Drawer ── */}
      <Drawer
        title={
          d ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar src={d.profile_url} size={40} style={{ background: "#4f8ef7", fontWeight: 700 }}>
                {d.name?.[0]?.toUpperCase()}
              </Avatar>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: "#888", fontWeight: 400 }}>{d.email}</div>
              </div>
            </div>
          ) : "Therapist Details"
        }
        width={480}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        extra={
          d && (
            <Space>
              <Button icon={<EditOutlined />} onClick={(e) => handleEditOpen(d, e)}>Edit</Button>
            </Space>
          )
        }
      >
        {detailLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : d ? (
          <div>
            {/* Status badges */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              <Badge status={d.is_active ? "success" : "error"} text={d.is_active ? "Account Active" : "Account Inactive"} />
              {sub && <Tag color={SUB_STATUS_COLORS[sub.status] || "default"}>{sub.status}</Tag>}
              {sub && <Tag color={PLAN_COLORS[sub.plan_type] || "default"}>{sub.plan_name}</Tag>}
              {sub?.access_type === "early_access" && <Tag color="cyan">Early Access</Tag>}
            </div>

            {/* Stats strip */}
            {stats && (
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <StatPill label="Clients" value={stats.total_clients} color="#1677ff" />
                <StatPill label="Sessions" value={stats.total_sessions} color="#52c41a" />
                <StatPill label="Invoices" value={stats.total_invoices} color="#722ed1" />
                <StatPill label="Revenue" value={`₹${Number(stats.total_invoice_amount || 0).toLocaleString()}`} color="#fa8c16" />
              </div>
            )}

            {/* Profile */}
            <SectionCard title="Profile">
              <InfoRow label="Phone" value={d.phone} />
              <InfoRow label="Experience" value={d.experience_years ? `${d.experience_years} years` : null} />
              <InfoRow label="Qualification" value={d.qualification} />
              <InfoRow label="Registration No." value={d.registration_number} />
              <InfoRow label="Booking Slug" value={d.booking_slug} />
              <InfoRow label="Referral Code" value={d.referral_code} />
              <InfoRow label="Joined" value={d.created_at ? dayjs(d.created_at).format("DD MMM YYYY") : null} />
              {d.about_me && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>About</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: "#444" }}>{d.about_me}</div>
                </div>
              )}
            </SectionCard>

            {/* Subscription */}
            {sub && (
              <SectionCard title="Subscription">
                <InfoRow label="Plan" value={sub.plan_name} />
                <InfoRow label="Billing" value={sub.billing_cycle} />
                <InfoRow label="Amount Paid" value={`₹${Number(sub.amount_paid || 0).toLocaleString()}`} />
                <InfoRow label="Offer Code" value={sub.offer_code} />
                <InfoRow label="Period Start" value={sub.period_start ? dayjs(sub.period_start).format("DD MMM YYYY") : null} />
                <InfoRow label="Period End" value={sub.period_end ? dayjs(sub.period_end).format("DD MMM YYYY") : null} />
              </SectionCard>
            )}

            {/* Availability */}
            {avail && (
              <SectionCard title="Availability">
                <InfoRow label="Days" value={avail.days?.join(", ")} />
                <InfoRow label="Hours" value={avail.from_time && avail.to_time ? `${avail.from_time} – ${avail.to_time}` : null} />
                <InfoRow label="Slot Duration" value={avail.slot_minutes ? `${avail.slot_minutes} min` : null} />
              </SectionCard>
            )}

            {/* Wallet */}
            {wallet && (
              <SectionCard title="Referral Wallet">
                <div style={{ display: "flex", gap: 8 }}>
                  <StatPill label="Balance" value={`₹${wallet.balance || 0}`} color="#1677ff" />
                  <StatPill label="Pending" value={`₹${wallet.pending_balance || 0}`} color="#fa8c16" />
                  <StatPill label="Total Earned" value={`₹${wallet.total_earned || 0}`} color="#52c41a" />
                  <StatPill label="Total Paid" value={`₹${wallet.total_paid || 0}`} color="#722ed1" />
                </div>
              </SectionCard>
            )}

            {/* Branding */}
            {branding && (
              <SectionCard title="Branding">
                <InfoRow label="Brand Name" value={branding.brand_name} />
                <InfoRow label="Theme" value={branding.theme} />
                <InfoRow label="Accent" value={branding.accent} />
              </SectionCard>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "#aaa", padding: 40 }}>No data available</div>
        )}
      </Drawer>

      {/* Create Drawer */}
      <Drawer title="Add New Therapist" width={520} open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); }}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Valid email required" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password"
            rules={[{ required: true, message: "Required" }, { min: 8, message: "Minimum 8 characters" }]}>
            <Input.Password
              iconRender={(v) => v ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
              placeholder="Set login password"
            />
          </Form.Item>
          {profileFields}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <Button onClick={() => { setDrawerOpen(false); form.resetFields(); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>Create & Get Credentials</Button>
          </div>
        </Form>
      </Drawer>

      {/* Edit Drawer */}
      <Drawer title="Edit Therapist" width={520} open={editDrawerOpen}
        onClose={() => { setEditDrawerOpen(false); editForm.resetFields(); }}>
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Valid email required" }]}>
            <Input />
          </Form.Item>
          {profileFields}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <Button onClick={() => { setEditDrawerOpen(false); editForm.resetFields(); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updating}>Update</Button>
          </div>
        </Form>
      </Drawer>

      {/* Credentials Modal */}
      <Modal
        title="✅ Therapist Created — Login Credentials"
        open={credsModal}
        onCancel={() => setCredsModal(false)}
        footer={[
          <Button key="csv" type="primary" icon={<DownloadOutlined />}
            onClick={() => newCreds && downloadCSV(newCreds)}>
            Download CSV
          </Button>,
          <Button key="close" onClick={() => setCredsModal(false)}>Close</Button>,
        ]}
        width={480}
      >
        {newCreds && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
            <p style={{ margin: 0, color: "#888", fontSize: 13 }}>
              Share these credentials with <strong>{newCreds.name}</strong>.
              Save them now — the password cannot be retrieved later.
            </p>
            {[
              { label: "Name", value: newCreds.name, field: "name" },
              { label: "Email", value: newCreds.email, field: "email" },
              { label: "Password", value: newCreds.password, field: "password" },
              { label: "Login URL", value: window.location.origin.replace(":5173", ":3000") + "/login", field: "url" },
            ].map(({ label, value, field }) => (
              <div key={field} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(0,0,0,0.04)", borderRadius: 8, padding: "10px 14px",
              }}>
                <div>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                  <div style={{ fontWeight: 600, marginTop: 2, fontFamily: field === "password" ? "monospace" : "inherit" }}>{value}</div>
                </div>
                <Button type="text"
                  icon={copiedField === field ? <CheckOutlined style={{ color: "#52c41a" }} /> : <CopyOutlined />}
                  onClick={() => copyToClipboard(value, field)}
                />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProDeskTherapists;
