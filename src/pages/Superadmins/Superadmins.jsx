import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  message,
  Drawer,
  Form,
  Input,
  Select,
  Avatar,
  Modal,
  Tooltip,
} from "antd";
import { PlusOutlined, UserOutlined, DeleteOutlined } from "@ant-design/icons";
import { getSuperAdminList, createSuperAdmin, deleteSuperadmin } from "../../services/api";
import styles from "./Superadmins.module.css";

const Superadmins = () => {
  const [superadmins, setSuperadmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [submitButtonLoading, setSubmitButtonLoading] = useState(false);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSuperadmins();
    
    // Get current user ID from localStorage
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUserId(user.user_id);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  const fetchSuperadmins = async () => {
    setLoading(true);
    try {
      const response = await getSuperAdminList();
      if (response.status) {
        setSuperadmins(response.data || []);
      } else {
        message.error("Failed to fetch superadmins");
      }
    } catch (error) {
      console.error("Error fetching superadmins:", error);
      message.error("Failed to fetch superadmins");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuperadmin = async (values) => {
    try {
      setSubmitButtonLoading(true);
      const response = await createSuperAdmin(values);
      if (response.status) {
        message.success("Superadmin created successfully");
        setDrawerVisible(false);
        form.resetFields();
        fetchSuperadmins();
      } else {
        message.error(response.message || "Failed to create superadmin");
      }
    } catch (error) {
      console.error("Error creating superadmin:", error);
      message.error("Failed to create superadmin");
    } finally {
      setSubmitButtonLoading(false);
    }
  };

  const handleDeleteSuperadmin = async (id) => {
    setDeletingId(id);
    
    Modal.confirm({
      title: 'Are you sure you want to delete this superadmin?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setDeleteButtonLoading(true);
          const response = await deleteSuperadmin(id);
          if (response.status) {
            message.success('Superadmin deleted successfully');
            fetchSuperadmins();
          } else {
            message.error(response.message || 'Failed to delete superadmin');
          }
        } catch (error) {
          console.error('Error deleting superadmin:', error);
          message.error('Failed to delete superadmin');
        } finally {
          setDeleteButtonLoading(false);
          setDeletingId(null);
        }
      },
      onCancel: () => {
        setDeletingId(null);
      }
    });
  };

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => (
        <Space>
          <Avatar 
            src={record.profile_url} 
            icon={!record.profile_url && <UserOutlined />}
          />
          {`${record.first_name} ${record.last_name}`}
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const isSelf = record.user_id === currentUserId;
        
        return (
          <Tooltip title={isSelf ? "You cannot delete your own account" : ""}>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deleteButtonLoading && deletingId === record.user_id}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteSuperadmin(record.user_id);
              }}
              disabled={isSelf}
            >
              Delete
            </Button>
          </Tooltip>
        );
      },
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Superadmins</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setDrawerVisible(true)}
        >
          Add Superadmin
        </Button>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          dataSource={superadmins}
          loading={loading}
          rowKey="user_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} superadmins`,
          }}
          scroll={{ x: "max-content" }}
        />
      </div>

      <Drawer
        title="Add New Superadmin"
        width={520}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
        }}
        open={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <Space>
            <Button
              onClick={() => {
                setDrawerVisible(false);
                form.resetFields();
              }}
              disabled={submitButtonLoading}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={submitButtonLoading}
              disabled={submitButtonLoading}
            >
              Create
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSuperadmin}
        >
          <Form.Item
            name="first_name"
            label="First Name"
            rules={[
              { required: true, message: "Please enter first name" },
              { max: 50, message: "First name cannot exceed 50 characters" },
              { 
                pattern: /^[a-zA-Z\s-]+$/, 
                message: "First name can only contain letters, spaces and hyphens" 
              }
            ]}
          >
            <Input placeholder="Enter first name" />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[
              { required: true, message: "Please enter last name" },
              { max: 50, message: "Last name cannot exceed 50 characters" },
              { 
                pattern: /^[a-zA-Z\s-]+$/, 
                message: "Last name can only contain letters, spaces and hyphens" 
              }
            ]}
          >
            <Input placeholder="Enter last name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
              { max: 100, message: "Email cannot exceed 100 characters" }
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { required: true, message: "Please enter phone number" },
              { 
                pattern: /^[0-9+\-\s()]+$/, 
                message: "Please enter a valid phone number" 
              }
            ]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: "Please select gender" }]}
          >
            <Select placeholder="Select gender">
              <Select.Option value="male">Male</Select.Option>
              <Select.Option value="female">Female</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Superadmins;
