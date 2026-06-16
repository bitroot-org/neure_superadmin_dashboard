import React, { useState, useEffect, useCallback } from "react";
import {
  Table, Button, Input, Select, Space, Tag, Modal, Form,
  Drawer, Switch, DatePicker, message, Divider, Upload, Tabs,
  Typography, Descriptions, Badge,
} from "antd";
import {
  PlusOutlined, SearchOutlined, ReloadOutlined, UploadOutlined,
  EyeOutlined, EditOutlined, DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  prodeskGetOffers, prodeskGetOfferTags, prodeskCreateOffer,
  prodeskUpdateOffer, prodeskGetOfferDetail, prodeskUploadOfferEmails,
  prodeskCreateOfferTag,
} from "../../services/api";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const CodesPromotions = () => {
  const [offers, setOffers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const [tags, setTags] = useState([]);

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm] = Form.useForm();
  const [isPercent, setIsPercent] = useState(false);
  const [isEmailRestricted, setIsEmailRestricted] = useState(false);

  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [offerDetail, setOfferDetail] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm] = Form.useForm();
  const [editingOffer, setEditingOffer] = useState(null);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadOffer, setUploadOffer] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [tagForm] = Form.useForm();
  const [creatingTag, setCreatingTag] = useState(false);

  const fetchTags = useCallback(async () => {
    try {
      const res = await prodeskGetOfferTags();
      setTags(res?.data || []);
    } catch {
      message.error("Failed to load tags");
    }
  }, []);

  const fetchOffers = useCallback(async (p = 1, s = "", tag_id = null, is_active = null) => {
    setLoading(true);
    try {
      const res = await prodeskGetOffers({ page: p, limit: 10, search: s, tag_id, is_active });
      setOffers(res?.data || []);
      setTotal(res?.meta?.total || 0);
    } catch {
      message.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
    fetchOffers();
  }, [fetchTags, fetchOffers]);

  const handleSearch = () => {
    setPage(1);
    fetchOffers(1, search, tagFilter, activeFilter);
  };

  const handleReset = () => {
    setSearch(""); setTagFilter(null); setActiveFilter(null); setPage(1);
    fetchOffers(1, "", null, null);
  };

  const openDetail = async (offer) => {
    setDetailDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await prodeskGetOfferDetail(offer.id);
      setOfferDetail(res?.data || null);
    } catch {
      message.error("Failed to load offer detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const openEdit = (offer) => {
    setEditingOffer(offer);
    editForm.setFieldsValue({
      name: offer.name,
      valid_till: offer.valid_till ? dayjs(offer.valid_till) : null,
      is_active: !!offer.is_active,
    });
    setEditModalOpen(true);
  };

  const handleCreate = async (values) => {
    setCreating(true);
    try {
      const payload = {
        code: values.code,
        name: values.name,
        description: values.description || "",
        tag_id: values.tag_id,
        is_percent: isPercent ? 1 : 0,
        percent_discount: isPercent ? values.percent_discount : null,
        is_email_restricted: isEmailRestricted ? 1 : 0,
        valid_from: values.valid_range?.[0]?.format("YYYY-MM-DD HH:mm:ss") || null,
        valid_till: values.valid_range?.[1]?.format("YYYY-MM-DD HH:mm:ss") || null,
        max_uses_per_email: values.max_uses_per_email || 1,
        total_max_uses: values.total_max_uses || null,
      };
      const res = await prodeskCreateOffer(payload);
      if (res?.status) {
        message.success("Offer created successfully");
        setCreateDrawerOpen(false);
        createForm.resetFields();
        setIsPercent(false);
        setIsEmailRestricted(false);
        fetchOffers(1, search, tagFilter, activeFilter);
      } else {
        message.error(res?.message || "Failed to create offer");
      }
    } catch (err) {
      message.error(err?.message || "Failed to create offer");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (values) => {
    setEditing(true);
    try {
      const res = await prodeskUpdateOffer({
        offer_id: editingOffer.id,
        name: values.name,
        valid_till: values.valid_till ? values.valid_till.format("YYYY-MM-DD HH:mm:ss") : undefined,
        is_active: values.is_active ? 1 : 0,
      });
      if (res?.status) {
        message.success("Offer updated");
        setEditModalOpen(false);
        fetchOffers(page, search, tagFilter, activeFilter);
      } else {
        message.error(res?.message || "Failed to update");
      }
    } catch {
      message.error("Failed to update offer");
    } finally {
      setEditing(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) { message.warning("Please select a CSV file"); return; }
    setUploading(true);
    try {
      const res = await prodeskUploadOfferEmails(uploadOffer.id, uploadFile);
      if (res?.status) {
        const d = res.data;
        message.success(`Uploaded: ${d.inserted} inserted, ${d.skipped_duplicates} skipped`);
        setUploadModalOpen(false);
        setUploadFile(null);
      } else {
        message.error(res?.message || "Upload failed");
      }
    } catch {
      message.error("Failed to upload emails");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateTag = async (values) => {
    setCreatingTag(true);
    try {
      const res = await prodeskCreateOfferTag(values);
      if (res?.status) {
        message.success("Tag created");
        setTagModalOpen(false);
        tagForm.resetFields();
        fetchTags();
      } else {
        message.error(res?.message || "Failed to create tag");
      }
    } catch {
      message.error("Failed to create tag");
    } finally {
      setCreatingTag(false);
    }
  };

  const downloadSampleCSV = () => {
    const csv = "email\ntherapist1@example.com\ntherapist2@example.com";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "offer_emails_sample.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: v => <code style={{ fontWeight: 700, fontSize: 13 }}>{v}</code>,
    },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Tag",
      dataIndex: "tag_name",
      key: "tag_name",
      render: v => v ? <Tag color="geekblue">{v}</Tag> : "—",
    },
    {
      title: "Type",
      key: "type",
      render: (_, r) => r.is_percent
        ? <Tag color="purple">{r.percent_discount}% OFF</Tag>
        : r.is_email_restricted
          ? <Tag color="cyan">Email Restricted</Tag>
          : <Tag>Open</Tag>,
    },
    {
      title: "Valid From",
      dataIndex: "valid_from",
      key: "valid_from",
      render: v => v ? dayjs(v).format("DD MMM YYYY") : "—",
    },
    {
      title: "Valid Till",
      dataIndex: "valid_till",
      key: "valid_till",
      render: v => v ? dayjs(v).format("DD MMM YYYY") : "—",
    },
    {
      title: "Used",
      dataIndex: "total_used",
      key: "total_used",
      render: (v, r) => `${v || 0}${r.total_emails_whitelisted ? ` / ${r.total_emails_whitelisted}` : ""}`,
    },
    {
      title: "Active",
      dataIndex: "is_active",
      key: "is_active",
      render: v => <Badge status={v ? "success" : "error"} text={v ? "Active" : "Inactive"} />,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(record)}>View</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>Edit</Button>
          {record.is_email_restricted ? (
            <Button size="small" icon={<UploadOutlined />} onClick={() => { setUploadOffer(record); setUploadModalOpen(true); }}>
              Emails
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Codes & Promotions</Title>
          <p style={{ margin: 0, color: "#888", fontSize: 13 }}>Manage coupon codes and promotional offers</p>
        </div>
        <Space>
          <Button onClick={() => setTagModalOpen(true)}>Manage Tags</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateDrawerOpen(true)}>
            Create Offer
          </Button>
        </Space>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Search code / name"
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 220 }}
        />
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
        columns={columns}
        dataSource={offers}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: 10,
          total,
          onChange: p => { setPage(p); fetchOffers(p, search, tagFilter, activeFilter); },
          showTotal: t => `Total ${t} offers`,
        }}
        scroll={{ x: "max-content" }}
      />

      {/* Create Offer Drawer */}
      <Drawer
        title="Create New Offer"
        width={540}
        open={createDrawerOpen}
        onClose={() => { setCreateDrawerOpen(false); createForm.resetFields(); setIsPercent(false); setIsEmailRestricted(false); }}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Form.Item name="code" label="Offer Code" rules={[{ required: true, message: "Required" }]}>
              <Input placeholder="e.g. PSY10" style={{ textTransform: "uppercase" }} />
            </Form.Item>
            <Form.Item name="tag_id" label="Tag" rules={[{ required: true, message: "Required" }]}>
              <Select placeholder="Select tag">
                {tags.map(t => <Option key={t.id} value={t.id}>{t.name}</Option>)}
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="name" label="Offer Name" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. World Psychology Day Promo" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Internal description" />
          </Form.Item>
          <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>Percentage Discount</div>
              <Switch checked={isPercent} onChange={setIsPercent} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>Email Restricted</div>
              <Switch checked={isEmailRestricted} onChange={setIsEmailRestricted} />
            </div>
          </div>
          {isPercent && (
            <Form.Item name="percent_discount" label="Discount %" rules={[{ required: true, message: "Required" }]}>
              <Input type="number" min={1} max={100} suffix="%" />
            </Form.Item>
          )}
          <Form.Item name="valid_range" label="Validity Period">
            <RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Form.Item name="max_uses_per_email" label="Max Uses / Email">
              <Input type="number" min={1} defaultValue={1} />
            </Form.Item>
            <Form.Item name="total_max_uses" label="Total Max Uses">
              <Input type="number" min={1} placeholder="Leave blank = unlimited" />
            </Form.Item>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <Button onClick={() => { setCreateDrawerOpen(false); createForm.resetFields(); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={creating}>Create Offer</Button>
          </div>
        </Form>
      </Drawer>

      {/* Edit Offer Modal */}
      <Modal
        title="Edit Offer"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="name" label="Offer Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="valid_till" label="Valid Till">
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={editing}>Update</Button>
          </div>
        </Form>
      </Modal>

      {/* Offer Detail Drawer */}
      <Drawer
        title={offerDetail ? `Offer: ${offerDetail.code}` : "Offer Detail"}
        width={600}
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        loading={detailLoading}
      >
        {offerDetail && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Code"><code style={{ fontWeight: 700 }}>{offerDetail.code}</code></Descriptions.Item>
              <Descriptions.Item label="Name">{offerDetail.name}</Descriptions.Item>
              <Descriptions.Item label="Tag">{offerDetail.tag_name || "—"}</Descriptions.Item>
              <Descriptions.Item label="Type">
                {offerDetail.is_percent ? `${offerDetail.percent_discount}% OFF` : offerDetail.is_email_restricted ? "Email Restricted" : "Open"}
              </Descriptions.Item>
              <Descriptions.Item label="Valid From">{offerDetail.valid_from ? dayjs(offerDetail.valid_from).format("DD MMM YYYY") : "—"}</Descriptions.Item>
              <Descriptions.Item label="Valid Till">{offerDetail.valid_till ? dayjs(offerDetail.valid_till).format("DD MMM YYYY") : "—"}</Descriptions.Item>
              <Descriptions.Item label="Total Used">{offerDetail.total_used || 0}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Badge status={offerDetail.is_active ? "success" : "error"} text={offerDetail.is_active ? "Active" : "Inactive"} />
              </Descriptions.Item>
            </Descriptions>

            {offerDetail.emails?.length > 0 && (
              <>
                <Divider orientation="left">Whitelisted Emails ({offerDetail.emails.length})</Divider>
                <Table
                  size="small"
                  dataSource={offerDetail.emails}
                  rowKey="email"
                  pagination={{ pageSize: 8 }}
                  columns={[
                    { title: "Email", dataIndex: "email", key: "email" },
                    {
                      title: "Used",
                      dataIndex: "is_used",
                      key: "is_used",
                      render: v => <Tag color={v ? "green" : "default"}>{v ? "Used" : "Unused"}</Tag>,
                    },
                    {
                      title: "Used At",
                      dataIndex: "used_at",
                      key: "used_at",
                      render: v => v ? dayjs(v).format("DD MMM YYYY") : "—",
                    },
                  ]}
                />
              </>
            )}
          </div>
        )}
      </Drawer>

      {/* Upload Emails Modal */}
      <Modal
        title={`Upload Emails — ${uploadOffer?.code}`}
        open={uploadModalOpen}
        onCancel={() => { setUploadModalOpen(false); setUploadFile(null); }}
        footer={null}
      >
        <div style={{ marginBottom: 16 }}>
          <Button size="small" icon={<DownloadOutlined />} onClick={downloadSampleCSV}>
            Download Sample CSV
          </Button>
          <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>CSV must have a single column: "email"</div>
        </div>
        <Upload
          accept=".csv"
          beforeUpload={file => { setUploadFile(file); return false; }}
          onRemove={() => setUploadFile(null)}
          maxCount={1}
          fileList={uploadFile ? [uploadFile] : []}
        >
          <Button icon={<UploadOutlined />}>Select CSV File</Button>
        </Upload>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <Button onClick={() => { setUploadModalOpen(false); setUploadFile(null); }}>Cancel</Button>
          <Button type="primary" onClick={handleUpload} loading={uploading} disabled={!uploadFile}>
            Upload
          </Button>
        </div>
      </Modal>

      {/* Manage Tags Modal */}
      <Modal
        title="Manage Offer Tags"
        open={tagModalOpen}
        onCancel={() => setTagModalOpen(false)}
        footer={null}
        width={480}
      >
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
          <Form.Item name="name" label="Tag Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. loyalty" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input placeholder="e.g. Loyalty reward for returning users" />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setTagModalOpen(false)}>Close</Button>
            <Button type="primary" htmlType="submit" loading={creatingTag}>Create Tag</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CodesPromotions;
