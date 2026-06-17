import React, { useState, useEffect, useCallback } from "react";
import {
  Table, Button, Input, Select, Space, Tag, Modal, Form,
  Drawer, Switch, DatePicker, message, Divider, Upload,
  Typography, Badge, Tooltip, Tabs,
} from "antd";
import {
  PlusOutlined, SearchOutlined, ReloadOutlined, UploadOutlined,
  EditOutlined, DownloadOutlined, MailOutlined,
  CheckCircleOutlined, ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  prodeskGetOffers, prodeskGetOfferTags, prodeskCreateOffer,
  prodeskUpdateOffer, prodeskGetOfferDetail, prodeskUploadOfferEmails,
  prodeskCreateOfferTag, prodeskGetOfferEmails, prodeskEditOfferEmail,
  prodeskAddOfferEmails,
} from "../../services/api";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const SAMPLE_CSV_URL =
  "https://neure-staging.s3.ap-south-1.amazonaws.com/prodesk/samples/offer_emails_sample.csv";

const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
    <span style={{ color: "#888", fontSize: 13 }}>{label}</span>
    <span style={{ fontWeight: 500, fontSize: 13 }}>{value || "—"}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1 — OFFERS
// ─────────────────────────────────────────────────────────────────────────────
const OffersTab = ({ tags, fetchTags }) => {
  const [offers, setOffers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [offerDetail, setOfferDetail] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm] = Form.useForm();
  const [editingOffer, setEditingOffer] = useState(null);

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm] = Form.useForm();
  const [isPercent, setIsPercent] = useState(false);
  const [isEmailRestricted, setIsEmailRestricted] = useState(false);

  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [tagForm] = Form.useForm();
  const [creatingTag, setCreatingTag] = useState(false);

  const fetchOffers = useCallback(async (p = 1, s = "", tag_id = null, is_active = null) => {
    setLoading(true);
    try {
      const res = await prodeskGetOffers({ page: p, limit: 10, search: s, tag_id, is_active });
      setOffers(res?.data || []);
      setTotal(res?.meta?.total || 0);
    } catch { message.error("Failed to load offers"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  const handleSearch = () => { setPage(1); fetchOffers(1, search, tagFilter, activeFilter); };
  const handleReset  = () => {
    setSearch(""); setTagFilter(null); setActiveFilter(null); setPage(1);
    fetchOffers(1, "", null, null);
  };

  const openDetail = async (record) => {
    setDetailOpen(true); setOfferDetail(null); setDetailLoading(true);
    try {
      const res = await prodeskGetOfferDetail(record.id);
      setOfferDetail(res?.data || null);
    } catch { message.error("Failed to load offer detail"); }
    finally { setDetailLoading(false); }
  };

  const handleCreate = async (values) => {
    setCreating(true);
    try {
      const res = await prodeskCreateOffer({
        code: values.code, name: values.name, description: values.description || "",
        tag_id: values.tag_id, is_percent: isPercent ? 1 : 0,
        percent_discount: isPercent ? values.percent_discount : null,
        is_email_restricted: isEmailRestricted ? 1 : 0,
        valid_from: values.valid_range?.[0]?.format("YYYY-MM-DD HH:mm:ss") || null,
        valid_till: values.valid_range?.[1]?.format("YYYY-MM-DD HH:mm:ss") || null,
        max_uses_per_email: values.max_uses_per_email || 1,
        total_max_uses: values.total_max_uses || null,
      });
      if (res?.status) {
        message.success("Offer created"); setCreateDrawerOpen(false); createForm.resetFields();
        setIsPercent(false); setIsEmailRestricted(false);
        fetchOffers(page, search, tagFilter, activeFilter);
      } else { message.error(res?.message || "Failed to create offer"); }
    } catch (err) { message.error(err?.message || "Failed to create offer"); }
    finally { setCreating(false); }
  };

  const handleUpdate = async (values) => {
    setEditing(true);
    try {
      const res = await prodeskUpdateOffer({
        offer_id: editingOffer.id, name: values.name,
        valid_till: values.valid_till ? values.valid_till.format("YYYY-MM-DD HH:mm:ss") : undefined,
        is_active: values.is_active ? 1 : 0,
      });
      if (res?.status) {
        message.success("Offer updated"); setEditModalOpen(false);
        fetchOffers(page, search, tagFilter, activeFilter);
      } else { message.error(res?.message || "Failed to update"); }
    } catch { message.error("Failed to update offer"); }
    finally { setEditing(false); }
  };

  const handleCreateTag = async (values) => {
    setCreatingTag(true);
    try {
      const res = await prodeskCreateOfferTag(values);
      if (res?.status) {
        message.success("Tag created"); setTagModalOpen(false); tagForm.resetFields(); fetchTags();
      } else { message.error(res?.message || "Failed to create tag"); }
    } catch { message.error("Failed to create tag"); }
    finally { setCreatingTag(false); }
  };

  const d = offerDetail;

  const columns = [
    { title: "Code", dataIndex: "code", key: "code", render: v => <code style={{ fontWeight: 700, fontSize: 13 }}>{v}</code> },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Tag", dataIndex: "tag_name", key: "tag_name", render: v => v ? <Tag color="geekblue">{v}</Tag> : "—" },
    {
      title: "Type", key: "type",
      render: (_, r) => r.is_percent ? <Tag color="purple">{r.percent_discount}% OFF</Tag>
        : r.is_email_restricted ? <Tag color="cyan">Email Restricted</Tag> : <Tag>Open</Tag>,
    },
    { title: "Valid Till", dataIndex: "valid_till", key: "valid_till", render: v => v ? dayjs(v).format("DD MMM YYYY") : "—" },
    { title: "Used", key: "used", render: (_, r) => `${r.total_used || 0}${r.total_emails_whitelisted ? ` / ${r.total_emails_whitelisted}` : ""}` },
    { title: "Active", dataIndex: "is_active", key: "is_active", render: v => <Badge status={v ? "success" : "error"} text={v ? "Active" : "Inactive"} /> },
    {
      title: "Actions", key: "actions",
      render: (_, record) => (
        <Button size="small" icon={<EditOutlined />}
          onClick={e => {
            e.stopPropagation();
            setEditingOffer(record);
            editForm.setFieldsValue({ name: record.name, valid_till: record.valid_till ? dayjs(record.valid_till) : null, is_active: !!record.is_active });
            setEditModalOpen(true);
          }}
        >Edit</Button>
      ),
    },
  ];

  return (
    <>
      {/* Sub-header actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
        <Button onClick={() => setTagModalOpen(true)}>Manage Tags</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateDrawerOpen(true)}>Create Offer</Button>
      </div>

      {/* Filters */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input placeholder="Search code / name" prefix={<SearchOutlined />} value={search}
          onChange={e => setSearch(e.target.value)} onPressEnter={handleSearch} style={{ width: 220 }} />
        <Select value={tagFilter} onChange={v => setTagFilter(v)} style={{ width: 160 }} placeholder="All Tags" allowClear>
          {tags.map(t => <Option key={t.id} value={t.id}>{t.name}</Option>)}
        </Select>
        <Select value={activeFilter} onChange={v => setActiveFilter(v)} style={{ width: 130 }} placeholder="All Status" allowClear>
          <Option value={1}>Active</Option>
          <Option value={0}>Inactive</Option>
        </Select>
        <Button type="primary" onClick={handleSearch}>Search</Button>
        <Button icon={<ReloadOutlined />} onClick={handleReset} />
      </Space>

      <Table
        columns={columns} dataSource={offers} rowKey="id" loading={loading}
        onRow={record => ({ onClick: () => openDetail(record), style: { cursor: "pointer" } })}
        pagination={{ current: page, pageSize: 10, total, onChange: p => { setPage(p); fetchOffers(p, search, tagFilter, activeFilter); }, showTotal: t => `Total ${t} offers` }}
        scroll={{ x: "max-content" }}
      />

      {/* Offer detail drawer */}
      <Drawer
        title={d ? <><code style={{ fontSize: 15, fontWeight: 800 }}>{d.code}</code><span style={{ marginLeft: 10, fontSize: 13, fontWeight: 400, color: "#888" }}>{d.name}</span></> : "Offer Detail"}
        width={480} open={detailOpen} onClose={() => setDetailOpen(false)} loading={detailLoading}
      >
        {d && (
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              <Badge status={d.is_active ? "success" : "error"} text={d.is_active ? "Active" : "Inactive"} />
              <Tag color={d.is_percent ? "purple" : d.is_email_restricted ? "cyan" : "default"}>
                {d.is_percent ? `${d.percent_discount}% OFF` : d.is_email_restricted ? "Email Restricted" : "Open"}
              </Tag>
              {d.tag_name && <Tag color="geekblue">{d.tag_name}</Tag>}
            </div>
            {[
              ["Name", d.name],
              ["Valid From", d.valid_from ? dayjs(d.valid_from).format("DD MMM YYYY, HH:mm") : "—"],
              ["Valid Till", d.valid_till ? dayjs(d.valid_till).format("DD MMM YYYY, HH:mm") : "—"],
              ["Total Used", d.total_used || 0],
              ["Whitelisted Emails", d.total_emails_whitelisted || "—"],
            ].map(([k, v]) => <InfoRow key={k} label={k} value={v} />)}
          </div>
        )}
      </Drawer>

      {/* Edit offer modal */}
      <Modal title="Edit Offer" open={editModalOpen} onCancel={() => setEditModalOpen(false)} footer={null}>
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="name" label="Offer Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="valid_till" label="Valid Till"><DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} /></Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked"><Switch /></Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={editing}>Update</Button>
          </div>
        </Form>
      </Modal>

      {/* Create offer drawer */}
      <Drawer title="Create New Offer" width={540} open={createDrawerOpen}
        onClose={() => { setCreateDrawerOpen(false); createForm.resetFields(); setIsPercent(false); setIsEmailRestricted(false); }}>
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Form.Item name="code" label="Offer Code" rules={[{ required: true }]}><Input placeholder="e.g. PSY10" /></Form.Item>
            <Form.Item name="tag_id" label="Tag" rules={[{ required: true }]}>
              <Select placeholder="Select tag">{tags.map(t => <Option key={t.id} value={t.id}>{t.name}</Option>)}</Select>
            </Form.Item>
          </div>
          <Form.Item name="name" label="Offer Name" rules={[{ required: true }]}><Input placeholder="e.g. World Psychology Day Promo" /></Form.Item>
          <Form.Item name="description" label="Description"><TextArea rows={2} /></Form.Item>
          <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
            <div><div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>Percentage Discount</div><Switch checked={isPercent} onChange={setIsPercent} /></div>
            <div><div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>Email Restricted</div><Switch checked={isEmailRestricted} onChange={setIsEmailRestricted} /></div>
          </div>
          {isPercent && <Form.Item name="percent_discount" label="Discount %" rules={[{ required: true }]}><Input type="number" min={1} max={100} suffix="%" /></Form.Item>}
          <Form.Item name="valid_range" label="Validity Period"><RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} /></Form.Item>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Form.Item name="max_uses_per_email" label="Max Uses / Email"><Input type="number" min={1} defaultValue={1} /></Form.Item>
            <Form.Item name="total_max_uses" label="Total Max Uses"><Input type="number" min={1} placeholder="Blank = unlimited" /></Form.Item>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <Button onClick={() => { setCreateDrawerOpen(false); createForm.resetFields(); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={creating}>Create Offer</Button>
          </div>
        </Form>
      </Drawer>

      {/* Tags modal */}
      <Modal title="Manage Offer Tags" open={tagModalOpen} onCancel={() => setTagModalOpen(false)} footer={null} width={480}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>Existing Tags</div>
          {tags.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Tag color="geekblue">{t.name}</Tag>
              <span style={{ fontSize: 12, color: "#888" }}>{t.description}</span>
            </div>
          ))}
        </div>
        <Divider />
        <div style={{ fontWeight: 500, marginBottom: 12 }}>Create New Tag</div>
        <Form form={tagForm} layout="vertical" onFinish={handleCreateTag}>
          <Form.Item name="name" label="Tag Name" rules={[{ required: true }]}><Input placeholder="e.g. loyalty" /></Form.Item>
          <Form.Item name="description" label="Description"><Input placeholder="e.g. Loyalty reward for returning users" /></Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setTagModalOpen(false)}>Close</Button>
            <Button type="primary" htmlType="submit" loading={creatingTag}>Create Tag</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2 — WHITELISTED EMAILS
// ─────────────────────────────────────────────────────────────────────────────
const EmailsTab = () => {
  const [emails, setEmails] = useState([]);
  const [emailsTotal, setEmailsTotal] = useState(0);
  const [emailsPage, setEmailsPage] = useState(1);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [emailSearch, setEmailSearch] = useState("");
  const [usedFilter, setUsedFilter] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);

  // offer options for add/upload modals
  const [offerOptions, setOfferOptions] = useState([]);
  const [actionOfferId, setActionOfferId] = useState(null);

  const [editEmailModalOpen, setEditEmailModalOpen] = useState(false);
  const [editEmailValue, setEditEmailValue] = useState("");
  const [editingEmail, setEditingEmail] = useState(false);

  const [addEmailsModalOpen, setAddEmailsModalOpen] = useState(false);
  const [addEmailsValue, setAddEmailsValue] = useState("");
  const [addingEmails, setAddingEmails] = useState(false);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  // load email-restricted offers for picker
  useEffect(() => {
    prodeskGetOffers({ page: 1, limit: 200 }).then(res => {
      setOfferOptions((res?.data || []).filter(o => o.is_email_restricted));
    }).catch(() => {});
  }, []);

  // offer_id omitted → fetch all
  const fetchEmails = useCallback(async (p = 1, s = "", is_used = null) => {
    setEmailsLoading(true);
    try {
      const res = await prodeskGetOfferEmails({ page: p, limit: 20, search: s, is_used });
      setEmails(res?.data || []);
      setEmailsTotal(res?.meta?.total || 0);
    } catch { message.error("Failed to load emails"); }
    finally { setEmailsLoading(false); }
  }, []);

  useEffect(() => { fetchEmails(); }, [fetchEmails]);

  const handleEmailSearch = () => { setEmailsPage(1); setSelectedEmail(null); fetchEmails(1, emailSearch, usedFilter); };
  const handleEmailReset  = () => {
    setEmailSearch(""); setUsedFilter(null); setEmailsPage(1); setSelectedEmail(null);
    fetchEmails(1, "", null);
  };

  const openEditEmail = () => { setEditEmailValue(selectedEmail.email); setEditEmailModalOpen(true); };

  const handleEditEmail = async () => {
    if (!editEmailValue.trim()) { message.warning("Email cannot be empty"); return; }
    setEditingEmail(true);
    try {
      const res = await prodeskEditOfferEmail({ email_id: selectedEmail.id, email: editEmailValue.trim() });
      if (res?.status) {
        message.success("Email updated"); setEditEmailModalOpen(false);
        setSelectedEmail(prev => ({ ...prev, email: editEmailValue.trim() }));
        fetchEmails(emailsPage, emailSearch, usedFilter);
      } else { message.error(res?.message || "Failed to update email"); }
    } catch { message.error("Failed to update email"); }
    finally { setEditingEmail(false); }
  };

  const handleAddEmails = async () => {
    if (!actionOfferId) { message.warning("Please select an offer first"); return; }
    const lines = addEmailsValue.split(/[\n,]+/).map(e => e.trim()).filter(Boolean);
    if (!lines.length) { message.warning("Enter at least one email"); return; }
    setAddingEmails(true);
    try {
      const res = await prodeskAddOfferEmails(actionOfferId, lines);
      if (res?.status) {
        const d = res.data;
        message.success(`Added: ${d.inserted} inserted, ${d.skipped_duplicates} skipped${d.invalid_emails?.length ? `, ${d.invalid_emails.length} invalid` : ""}`);
        setAddEmailsModalOpen(false); setAddEmailsValue(""); setActionOfferId(null);
        fetchEmails(emailsPage, emailSearch, usedFilter);
      } else { message.error(res?.message || "Failed to add emails"); }
    } catch { message.error("Failed to add emails"); }
    finally { setAddingEmails(false); }
  };

  const handleUpload = async () => {
    if (!actionOfferId) { message.warning("Please select an offer first"); return; }
    if (!uploadFile) { message.warning("Please select a CSV file"); return; }
    setUploading(true);
    try {
      const res = await prodeskUploadOfferEmails(actionOfferId, uploadFile);
      if (res?.status) {
        const d = res.data;
        message.success(`Uploaded: ${d.inserted} inserted, ${d.skipped_duplicates} skipped`);
        setUploadModalOpen(false); setUploadFile(null); setActionOfferId(null);
        fetchEmails(emailsPage, emailSearch, usedFilter);
      } else { message.error(res?.message || "Upload failed"); }
    } catch { message.error("Failed to upload emails"); }
    finally { setUploading(false); }
  };

  const emailColumns = [
    {
      title: "Offer Code", dataIndex: "offer_code", key: "offer_code",
      render: v => v ? <code style={{ fontWeight: 700, fontSize: 12, color: "#1677ff" }}>{v}</code> : "—",
    },
    {
      title: "Offer Name", dataIndex: "offer_name", key: "offer_name",
      render: v => v || "—",
    },
    {
      title: "Email", dataIndex: "email", key: "email",
      render: v => <span style={{ fontWeight: 500 }}><MailOutlined style={{ color: "#888", marginRight: 8, fontSize: 12 }} />{v}</span>,
    },
    {
      title: "Status", dataIndex: "is_used", key: "is_used", width: 110,
      render: v => v
        ? <Tag color="green" icon={<CheckCircleOutlined />}>Used</Tag>
        : <Tag icon={<ClockCircleOutlined />}>Unused</Tag>,
    },
    { title: "Used By", dataIndex: "used_by_name", key: "used_by_name", render: v => v || "—" },
    { title: "Used At", dataIndex: "used_at", key: "used_at", render: v => v ? dayjs(v).format("DD MMM YYYY, HH:mm") : "—" },
    { title: "Added On", dataIndex: "created_at", key: "created_at", render: v => v ? dayjs(v).format("DD MMM YYYY") : "—" },
  ];

  return (
    <div style={{ outline: "none" }} tabIndex={-1}>
      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <Space wrap>
          <Input
            placeholder="Search email / offer" prefix={<SearchOutlined />}
            value={emailSearch} onChange={e => setEmailSearch(e.target.value)}
            onPressEnter={handleEmailSearch} style={{ width: 240 }}
          />
          <Select
            value={usedFilter}
            onChange={v => { setUsedFilter(v); setEmailsPage(1); setSelectedEmail(null); fetchEmails(1, emailSearch, v); }}
            style={{ width: 130 }} placeholder="All"
          >
            <Option value={null}>All</Option>
            <Option value={1}>Used</Option>
            <Option value={0}>Unused</Option>
          </Select>
          <Button type="primary" onClick={handleEmailSearch}>Search</Button>
          <Button icon={<ReloadOutlined />} onClick={handleEmailReset} />
        </Space>
        <Space>
          <Button icon={<UploadOutlined />} onClick={() => { setActionOfferId(selectedEmail?.offer_id ?? null); setUploadModalOpen(true); }}>
            Upload CSV
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setActionOfferId(selectedEmail?.offer_id ?? null); setAddEmailsModalOpen(true); }}>
            Add Emails
          </Button>
        </Space>
      </div>

      {/* Email table */}
      <Table
        columns={emailColumns} dataSource={emails} rowKey="id" loading={emailsLoading} size="small"
        style={{ outline: "none" }}
        onRow={record => ({ onClick: () => setSelectedEmail(record), style: { cursor: "pointer" } })}
        pagination={{
          current: emailsPage, pageSize: 20, total: emailsTotal,
          onChange: p => { setEmailsPage(p); fetchEmails(p, emailSearch, usedFilter); },
          showTotal: t => `Total ${t} emails`, size: "small",
        }}
        scroll={{ x: "max-content" }}
      />

      {/* Email detail drawer */}
      <Drawer
        title={
          selectedEmail ? (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                <MailOutlined style={{ marginRight: 8, color: "#1677ff" }} />
                {selectedEmail.email}
              </div>
              <div style={{ fontSize: 12, fontWeight: 400, color: "#888", marginTop: 2 }}>
                {selectedEmail.offer_code && <><code style={{ color: "#1677ff" }}>{selectedEmail.offer_code}</code> — {selectedEmail.offer_name}</>}
              </div>
            </div>
          ) : "Email Detail"
        }
        width={400}
        open={!!selectedEmail}
        onClose={() => setSelectedEmail(null)}
      >
        {selectedEmail && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 20 }}>
                {selectedEmail.is_used
                  ? <Tag color="green" icon={<CheckCircleOutlined />} style={{ fontSize: 13, padding: "3px 10px" }}>Used</Tag>
                  : <Tag icon={<ClockCircleOutlined />} style={{ fontSize: 13, padding: "3px 10px" }}>Unused</Tag>
                }
              </div>
              {[
                ["Offer Code", selectedEmail.offer_code ? <code style={{ color: "#1677ff", fontWeight: 700 }}>{selectedEmail.offer_code}</code> : "—"],
                ["Offer Name", selectedEmail.offer_name],
                ["Email", selectedEmail.email],
                ["Used By", selectedEmail.used_by_name],
                ["Used At", selectedEmail.used_at ? dayjs(selectedEmail.used_at).format("DD MMM YYYY, HH:mm") : null],
                ["Added On", selectedEmail.created_at ? dayjs(selectedEmail.created_at).format("DD MMM YYYY") : null],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <span style={{ color: "#888", fontSize: 13 }}>{label}</span>
                  <span style={{ fontWeight: 500, fontSize: 13, textAlign: "right", maxWidth: "60%" }}>{value || "—"}</span>
                </div>
              ))}
            </div>

            {/* Edit button at bottom */}
            <div style={{ paddingTop: 24, borderTop: "1px solid rgba(0,0,0,0.06)", marginTop: 24 }}>
              {!selectedEmail.is_used ? (
                <Button type="primary" icon={<EditOutlined />} onClick={openEditEmail} block size="large">
                  Edit Email
                </Button>
              ) : (
                <Tooltip title="Cannot edit — this email has already been used">
                  <Button icon={<EditOutlined />} disabled block size="large">Edit Email</Button>
                </Tooltip>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Edit email modal */}
      <Modal title="Edit Email Address" open={editEmailModalOpen} onCancel={() => setEditEmailModalOpen(false)}
        onOk={handleEditEmail} okText="Save" confirmLoading={editingEmail}>
        <div style={{ marginBottom: 10, fontSize: 13, color: "#888" }}>Current: <code style={{ color: "#333" }}>{selectedEmail?.email}</code></div>
        <Input value={editEmailValue} onChange={e => setEditEmailValue(e.target.value)}
          placeholder="Enter new email address" onPressEnter={handleEditEmail} autoFocus />
      </Modal>

      {/* Add emails modal */}
      <Modal title="Add Emails Manually" open={addEmailsModalOpen}
        onCancel={() => { setAddEmailsModalOpen(false); setAddEmailsValue(""); setActionOfferId(null); }}
        onOk={handleAddEmails} okText="Add Emails" confirmLoading={addingEmails} width={480}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Select Offer <span style={{ color: "#ff4d4f" }}>*</span></div>
          <Select
            showSearch placeholder="Select offer to add emails to"
            value={actionOfferId} onChange={setActionOfferId}
            style={{ width: "100%" }}
            filterOption={(input, option) => option?.children?.toLowerCase?.().includes(input.toLowerCase())}
          >
            {offerOptions.map(o => (
              <Option key={o.id} value={o.id}>
                <code style={{ marginRight: 8, color: "#1677ff" }}>{o.code}</code>{o.name}
              </Option>
            ))}
          </Select>
        </div>
        <div style={{ marginBottom: 10, fontSize: 13, color: "#555" }}>
          Enter one email per line or separate with commas. Duplicates will be skipped automatically.
        </div>
        <TextArea value={addEmailsValue} onChange={e => setAddEmailsValue(e.target.value)}
          rows={7} placeholder={"email1@example.com\nemail2@example.com"} />
        <div style={{ marginTop: 6, fontSize: 12, color: "#aaa" }}>Only valid email addresses will be accepted.</div>
      </Modal>

      {/* Upload CSV modal */}
      <Modal title="Upload Email List via CSV" open={uploadModalOpen}
        onCancel={() => { setUploadModalOpen(false); setUploadFile(null); setActionOfferId(null); }} footer={null} width={500}>
        {/* Offer picker */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Select Offer <span style={{ color: "#ff4d4f" }}>*</span></div>
          <Select
            showSearch placeholder="Select offer to upload emails to"
            value={actionOfferId} onChange={setActionOfferId}
            style={{ width: "100%" }}
            filterOption={(input, option) => option?.children?.toLowerCase?.().includes(input.toLowerCase())}
          >
            {offerOptions.map(o => (
              <Option key={o.id} value={o.id}>
                <code style={{ marginRight: 8, color: "#1677ff" }}>{o.code}</code>{o.name}
              </Option>
            ))}
          </Select>
        </div>

        <div style={{ background: "rgba(22,119,255,0.04)", border: "1px solid #1677ff22", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>CSV Format Instructions</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#555", lineHeight: 1.8 }}>
            <li>Upload a CSV with <strong>one email per row</strong> under the column header <code>"email"</code>.</li>
            <li>Only valid email addresses will be accepted.</li>
            <li>Duplicates will be skipped automatically.</li>
          </ul>
          <div style={{ marginTop: 12 }}>
            <a href={SAMPLE_CSV_URL} download="offer_emails_sample.csv" target="_blank" rel="noreferrer"
              style={{ color: "#1677ff", fontWeight: 500, fontSize: 13 }}>
              <DownloadOutlined style={{ marginRight: 6 }} />Download Sample CSV
            </a>
          </div>
        </div>
        <div style={{ background: "#f6f8fa", border: "1px solid #e8e8e8", borderRadius: 6, padding: "10px 14px", fontFamily: "monospace", fontSize: 12, marginBottom: 20, color: "#444" }}>
          <div style={{ color: "#1677ff", fontWeight: 600 }}>email</div>
          <div>varun@gmail.com</div><div>yash@gmail.com</div><div>abc@gmail.com</div>
        </div>
        <Upload accept=".csv" beforeUpload={file => { setUploadFile(file); return false; }}
          onRemove={() => setUploadFile(null)} maxCount={1} fileList={uploadFile ? [uploadFile] : []}>
          <Button icon={<UploadOutlined />}>Select CSV File</Button>
        </Upload>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <Button onClick={() => { setUploadModalOpen(false); setUploadFile(null); }}>Cancel</Button>
          <Button type="primary" onClick={handleUpload} loading={uploading} disabled={!uploadFile}>Upload</Button>
        </div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const CodesPromotions = () => {
  const [tags, setTags] = useState([]);
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);

  const fetchTags = useCallback(async () => {
    try { const res = await prodeskGetOfferTags(); setTags(res?.data || []); } catch {}
  }, []);

  const fetchAllOffers = useCallback(async () => {
    setOffersLoading(true);
    try {
      const res = await prodeskGetOffers({ page: 1, limit: 200 });
      setOffers(res?.data || []);
    } catch {}
    finally { setOffersLoading(false); }
  }, []);

  useEffect(() => { fetchTags(); fetchAllOffers(); }, [fetchTags, fetchAllOffers]);

  const tabItems = [
    {
      key: "offers",
      label: "Offers",
      children: <OffersTab tags={tags} fetchTags={fetchTags} />,
    },
    {
      key: "emails",
      label: <span><MailOutlined style={{ marginRight: 6 }} />Whitelisted Emails</span>,
      children: <EmailsTab />,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>Codes & Promotions</Title>
        <p style={{ margin: 0, color: "#888", fontSize: 13 }}>Manage coupon codes and promotional offers</p>
      </div>
      <Tabs items={tabItems} defaultActiveKey="offers" destroyInactiveTabPane={false} />
    </div>
  );
};

export default CodesPromotions;
