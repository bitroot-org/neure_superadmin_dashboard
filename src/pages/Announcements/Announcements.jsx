import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Drawer, // Changed from Modal to Drawer
  Form,
  Input,
  Select,
  Space,
  message,
  Typography,
  Tag,
  Tooltip,
  DatePicker,
  Spin,
  Switch,
  Modal
} from "antd";
import { PlusOutlined, GlobalOutlined, LinkOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getAnnouncements,
  createAnnouncement,
  getCompanyList,
  deleteAnnouncement,
  updateAnnouncement
} from "../../services/api";
import styles from "./Announcements.module.css";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [isGlobal, setIsGlobal] = useState(false);
  const [selectedAudienceType, setSelectedAudienceType] = useState("employees");
  const [form] = Form.useForm();

  const fetchAnnouncements = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getAnnouncements({
        page,
        limit: pagination.pageSize,
      });

      if (response.status && response.data) {
        setAnnouncements(response.data.announcements);
        setPagination({
          ...pagination,
          current: response.data.pagination.current_page,
          total: response.data.pagination.total,
        });
      }
    } catch (error) {
      message.error("Failed to fetch announcements");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async (search = "") => {
    setCompanyLoading(true);
    try {
      const response = await getCompanyList({ search });
      if (response.status && response.data) {
        setCompanies(response.data);
      }
    } catch (error) {
      message.error("Failed to fetch companies");
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleCreate = async (values) => {
    console.log(values);
    try {
      const payload = {
        title: values.title,
        content: values.content,
        link: values.link || undefined,
        is_global: values.is_global ? 1 : 0,
        audience_type: values.audience_type,
        company_ids: !values.is_global ? values.company_id : undefined,
      };

      if (editingAnnouncement) {
        // Update existing announcement
        payload.id = editingAnnouncement.id;
        await updateAnnouncement(payload);
        message.success("Announcement updated successfully");
      } else {
        // Create new announcement
        await createAnnouncement(payload);
        message.success("Announcement created successfully");
      }

      setDrawerVisible(false);
      setEditingAnnouncement(null);
      form.resetFields();
      fetchAnnouncements();
    } catch (error) {
      message.error(editingAnnouncement ? "Failed to update announcement" : "Failed to create announcement");
    }
  };

  const handleEdit = (record) => {
    // Fetch companies first to ensure the dropdown has data
    fetchCompanies().then(() => {
      setEditingAnnouncement(record);
      setIsGlobal(record.is_global === 1);
      setSelectedAudienceType(record.audience_type);

      // Set form values after a short delay to ensure state updates
      setTimeout(() => {
        form.setFieldsValue({
          title: record.title,
          content: record.content,
          link: record.link || '',
          is_global: record.is_global === 1,
          audience_type: record.audience_type,
          company_ids: record.company_id,
        });
      }, 100);

      setDrawerVisible(true);
    });
  };


  const handleDelete = async (id) => {
    try {
      Modal.confirm({
        title: 'Are you sure you want to delete this announcement?',
        content: 'This action cannot be undone.',
        okText: 'Yes, Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: async () => {
          await deleteAnnouncement(id);
          message.success("Announcement deleted successfully");
          fetchAnnouncements();
        }
      });
    } catch (error) {
      message.error("Failed to delete announcement");
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <Space>
          <span>{text}</span>
          {record.is_global === 1 && (
            <Tooltip title="Global Announcement">
              <GlobalOutlined style={{ color: "#1890ff" }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      width: "30%",
    },
    {
      title: "Audience",
      dataIndex: "audience_type",
      key: "audience_type",
      render: (type) => (
        <Tag color={type === "employees" ? "blue" : "green"}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      render: (link) =>
        link ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            <LinkOutlined /> View Link
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => dayjs(date).format("MMMM D, YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination) => {
    fetchAnnouncements(pagination.current);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2} className={styles.pageTitle}>
          Announcements
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            // Fetch companies first to ensure the dropdown has data
            fetchCompanies().then(() => {
              setEditingAnnouncement(null);
              setIsGlobal(false);
              setSelectedAudienceType("employees");
              form.resetFields();
              form.setFieldsValue({
                is_global: false,
                audience_type: "employees",
              });
              setDrawerVisible(true);
            });
          }}
        >
          Create Announcement
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={announcements}
        loading={loading}
        rowKey="id"
        scroll={{ x: "max-content" }}
        pagination={{
          ...pagination,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} announcements`,
        }}
        onChange={handleTableChange}
      />

      <Drawer
        title={editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          setIsGlobal(false);
          setEditingAnnouncement(null);
          form.resetFields();
        }}
        width={520}
        destroyOnClose={true}
        footer={
          <Space>
            <Button
              onClick={() => {
                setDrawerVisible(false);
                setIsGlobal(false);
                setEditingAnnouncement(null);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => {
                form.submit();
              }}
            >
              {editingAnnouncement ? "Update" : "Submit"}
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            is_global: false,
            audience_type: "employees",
          }}
          onFinish={handleCreate}
          preserve={false}
          className={styles.form}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input placeholder="Enter announcement title" />
          </Form.Item>

          <Form.Item
            name="is_global"
            valuePropName="checked"
            label="Announcement Type"
          >
            <Switch
              checkedChildren="Global"
              unCheckedChildren="Not Global"
              onChange={(checked) => {
                setIsGlobal(checked);
                if (checked) {
                  form.setFieldsValue({
                    audience_type: "employees",
                    company_id: undefined,
                  });
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="audience_type"
            label="Target Audience"
            rules={[
              { required: true, message: "Please select target audience" },
            ]}
          >
            <Select
              placeholder="Select target audience"
              onChange={(value) => setSelectedAudienceType(value)}
            >
              <Option value="employees">Employees</Option>
              <Option value="company">Company</Option>
            </Select>
          </Form.Item>

          {!isGlobal && (
            <>
              <Form.Item
                name="company_id"
                label="Select Company"
                rules={[{ required: true, message: "Please select a company" }]}
              >
                <Select
                  mode="multiple"
                  showSearch
                  placeholder="Search and select company"
                  loading={companyLoading}
                  onSearch={fetchCompanies}
                  filterOption={false}
                  notFoundContent={
                    companyLoading ? <Spin size="small" /> : null
                  }
                >
                  {companies.map((company) => (
                    <Option key={company.id} value={company.id}>
                      {company.company_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: "Please enter content" }]}
          >
            <TextArea rows={4} placeholder="Enter announcement content" />
          </Form.Item>

          <Form.Item name="link" label="Link (Optional)">
            <Input placeholder="Enter link" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Announcements;
