import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Table,
  Space,
  Drawer,
  Form,
  Input,
  Upload,
  Select,
  message,
  Modal,
  Tag,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  SearchOutlined,
  FileTextOutlined,
  AudioOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import debounce from "lodash/debounce";
import styles from "../Resources/Resources.module.css";
import {
  getCatalogueResources,
  uploadCatalogueResource,
  deleteCatalogueResource,
} from "../../services/api";

const TYPE_ICONS = {
  PDF: <FileTextOutlined style={{ color: "#ff4d4f" }} />,
  Worksheet: <FileDoneOutlined style={{ color: "#1890ff" }} />,
  Audio: <AudioOutlined style={{ color: "#52c41a" }} />,
};

const TherapistResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [form] = Form.useForm();

  const fetchResources = async (page = 1, limit = 10, q = "") => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (q) params.q = q;
      const response = await getCatalogueResources(params);
      if (response.status) {
        setResources(response.data || []);
        const pg = response.pagination;
        setPagination({ current: pg.current_page, pageSize: pg.per_page, total: pg.total });
      }
    } catch (error) {
      message.error("Failed to load therapist resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  const debouncedSearch = useCallback(
    debounce((q) => fetchResources(1, 10, q), 500),
    []
  );

  const handleSearch = (value) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleUpload = async (values) => {
    const file = values.file?.fileList?.[0]?.originFileObj;
    if (!file) { message.error("Please upload a file"); return; }

    setCreateLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", values.title);
      formData.append("type", values.type);
      if (values.category) formData.append("category", values.category);

      const response = await uploadCatalogueResource(formData);
      if (response.status) {
        message.success("Resource uploaded successfully");
        setDrawerVisible(false);
        form.resetFields();
        fetchResources(pagination.current, pagination.pageSize, searchTerm);
      } else {
        message.error(response.message || "Upload failed");
      }
    } catch (error) {
      message.error("Failed to upload resource");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete Resource",
      content: `Are you sure you want to delete "${record.title}"? Therapists will no longer see it in their Pre-loaded library.`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        setDeleteLoading(true);
        try {
          const response = await deleteCatalogueResource(record.id);
          if (response.status) {
            message.success("Resource deleted");
            fetchResources(pagination.current, pagination.pageSize, searchTerm);
          } else {
            message.error(response.message || "Delete failed");
          }
        } catch {
          message.error("Failed to delete resource");
        } finally {
          setDeleteLoading(false);
        }
      },
    });
  };

  const getAcceptedTypes = (type) => {
    if (type === "PDF") return ".pdf";
    if (type === "Audio") return ".mp3,.wav,.m4a,.aac";
    if (type === "Worksheet") return ".pdf,.doc,.docx";
    return ".pdf,.doc,.docx,.mp3,.wav";
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type) => (
        <Space>
          {TYPE_ICONS[type] || <FileTextOutlined />}
          <Tag>{type}</Tag>
        </Space>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat) => cat || <span style={{ color: "#999" }}>—</span>,
    },
    {
      title: "Size",
      dataIndex: "size_bytes",
      key: "size_bytes",
      render: (bytes) =>
        bytes ? (bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`) : "—",
    },
    {
      title: "Date Added",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => window.open(record.file_url, "_blank")}>
            View
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record)} loading={deleteLoading}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const selectedType = Form.useWatch("type", form);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Therapist Resources</h1>
      <p style={{ color: "#888", marginBottom: 16 }}>
        Resources uploaded here appear in every therapist's <strong>Pre-loaded library</strong> in ProDesk.
      </p>

      <div className={styles.actionBar}>
        <Input
          placeholder="Search resources..."
          allowClear
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
          disabled={loading}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerVisible(true)}>
          Upload Resource
        </Button>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          dataSource={resources}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => fetchResources(page, pageSize, searchTerm),
          }}
          scroll={{ x: "max-content" }}
          locale={{ emptyText: "No therapist resources yet. Upload one to get started." }}
        />
      </div>

      <Drawer
        title="Upload Therapist Resource"
        width={520}
        open={drawerVisible}
        onClose={() => { setDrawerVisible(false); form.resetFields(); }}
      >
        <Form form={form} layout="vertical" onFinish={handleUpload}>
          <Form.Item
            name="type"
            label="Resource Type"
            rules={[{ required: true, message: "Please select a type" }]}
          >
            <Select placeholder="Select type">
              <Select.Option value="PDF">PDF</Select.Option>
              <Select.Option value="Worksheet">Worksheet</Select.Option>
              <Select.Option value="Audio">Audio</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter a title" }, { max: 150 }]}
          >
            <Input placeholder="e.g. CBT Thought Record Sheet" />
          </Form.Item>

          <Form.Item name="category" label="Category">
            <Input placeholder="e.g. CBT, DBT, Anxiety, Mindfulness" />
          </Form.Item>

          <Form.Item
            name="file"
            label="File"
            rules={[{ required: true, message: "Please upload a file" }]}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept={selectedType ? getAcceptedTypes(selectedType) : ".pdf,.doc,.docx,.mp3,.wav"}
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={createLoading}>
              Upload
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default TherapistResources;
