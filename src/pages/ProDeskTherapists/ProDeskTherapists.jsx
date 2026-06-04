import React, { useState, useEffect } from "react";
import {
  Table, Button, Drawer, Form, Input, Select,
  Space, message, Modal, Tag, Tooltip,
} from "antd";
import {
  PlusOutlined, CopyOutlined, DownloadOutlined,
  CheckOutlined, EyeInvisibleOutlined, EyeTwoTone,
} from "@ant-design/icons";
import { getProdeskTherapists, createProdeskTherapist, updateTherapist, deleteTherapist } from "../../services/api";

const ProDeskTherapists = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const [credsModal, setCredsModal] = useState(false);
  const [newCreds, setNewCreds] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => { fetchTherapists(); }, []);

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const res = await getProdeskTherapists();
      setTherapists(res?.data?.therapists || []);
    } catch {
      message.error("Failed to fetch therapists");
    } finally {
      setLoading(false);
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
        fetchTherapists();
        setNewCreds({
          name: `${values.first_name} ${values.last_name}`,
          email: values.email,
          password: values.password,
        });
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

  const handleEditOpen = (record) => {
    setSelectedTherapist(record);
    editForm.setFieldsValue({
      first_name: record.first_name,
      last_name: record.last_name,
      email: record.email,
      phone: record.phone,
      gender: record.gender,
      specialization: record.specialization,
      years_of_experience: record.years_of_experience,
      bio: record.bio,
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
        fetchTherapists();
      } else {
        message.error(res?.message || "Failed to update");
      }
    } catch {
      message.error("Failed to update therapist");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete this therapist?",
      content: `${record.first_name} ${record.last_name} will be removed permanently.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteTherapist(record.user_id);
          message.success("Therapist deleted");
          fetchTherapists();
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
    const a = document.createElement("a");
    a.href = url;
    a.download = `credentials-${creds.email}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllCSV = () => {
    if (!therapists.length) return;
    const rows = [["Name", "Email", "Phone", "Specialization", "Experience", "Status"]];
    therapists.forEach((t) => {
      rows.push([
        `${t.first_name} ${t.last_name}`,
        t.email,
        t.phone || "",
        t.specialization || "",
        t.years_of_experience || "",
        t.is_active ? "Active" : "Inactive",
      ]);
    });
    const csv = rows.map((r) => r.map((v) => `"${v ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `therapists-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", background: "#4f8ef7",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 600, fontSize: 14, flexShrink: 0,
          }}>
            {r.first_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{r.first_name} {r.last_name}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{r.email}</div>
          </div>
        </div>
      ),
    },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Specialization", dataIndex: "specialization", key: "specialization" },
    {
      title: "Experience",
      dataIndex: "years_of_experience",
      key: "experience",
      render: (v) => v ? `${v} yrs` : "—",
    },
    {
      title: "Status",
      key: "status",
      render: (_, r) => (
        <Tag color={r.is_active ? "green" : "red"}>
          {r.is_active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEditOpen(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>Delete</Button>
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
      <Form.Item name="bio" label="Bio" rules={[{ required: true, message: "Required" }]}>
        <Input.TextArea rows={3} />
      </Form.Item>
    </>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
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

      <Table
        columns={columns}
        dataSource={therapists}
        rowKey="user_id"
        loading={loading}
        pagination={{ pageSize: 10, showTotal: (t) => `Total ${t} therapists` }}
        scroll={{ x: "max-content" }}
      />

      {/* Create Drawer */}
      <Drawer title="Add New Therapist" width={520} open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); }}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="email" label="Email"
            rules={[{ required: true, type: "email", message: "Valid email required" }]}>
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
          <Form.Item name="email" label="Email"
            rules={[{ required: true, type: "email", message: "Valid email required" }]}>
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
