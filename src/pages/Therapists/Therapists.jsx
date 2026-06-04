import React, { useState, useEffect } from "react";
import {
  Table,
  message,
  Space,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Upload,
  DatePicker,
  Modal,
  InputNumber,
} from "antd";
import {
  FilterOutlined,
  PlusOutlined,
  UploadOutlined,
  CopyOutlined,
  CheckOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  getTherapists,
  createTherapist,
  updateTherapist,
  deleteTherapist,
} from "../../services/api";
import styles from "./Therapists.module.css";

const Therapists = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [createButtonLoading, setCreateButtonLoading] = useState(false);
  const [updateButtonLoading, setUpdateButtonLoading] = useState(false);
  const [credsModal, setCredsModal] = useState(false);
  const [newCreds, setNewCreds] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const response = await getTherapists();
      setTherapists(response.data.therapists);
    } catch (error) {
      message.error("Failed to fetch therapists");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTherapist = (therapist) => {
    setSelectedTherapist(therapist);
    editForm.setFieldsValue({
      first_name: therapist.first_name,
      last_name: therapist.last_name,
      email: therapist.email,
      phone: therapist.phone,
      designation: therapist.designation,
      qualification: therapist.qualification,
      specialization: therapist.specialization,
      years_of_experience: therapist.years_of_experience,
      gender: therapist.gender,
      bio: therapist.bio,
    });
    setEditDrawerVisible(true);
  };

  const handleUpdateTherapist = async (values) => {
    try {
      setUpdateButtonLoading(true); // Set button loading state to true
      setLoading(true);
      // Check if therapist ID exists in the selectedTherapist object
      const therapistId =
        selectedTherapist?.user_id || selectedTherapist?.therapist_id;

      if (!therapistId) {
        message.error("Therapist ID not found");
        return;
      }

      const response = await updateTherapist(therapistId, values);
      if (response.status) {
        message.success("Therapist updated successfully");
        setEditDrawerVisible(false);
        fetchTherapists();
      }
    } catch (error) {
      message.error("Failed to update therapist");
    } finally {
      setLoading(false);
      setUpdateButtonLoading(false); // Reset button loading state
    }
  };

  const handleDeleteTherapist = (therapist) => {
    // Extract the ID from the therapist object
    const therapistId = therapist?.user_id || therapist?.therapist_id;

    if (!therapistId) {
      message.error("Therapist ID not found");
      return;
    }

    Modal.confirm({
      title: "Are you sure you want to delete this therapist?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setLoading(true);
          const response = await deleteTherapist(therapistId);
          if (response.status) {
            message.success("Therapist deleted successfully");
            fetchTherapists();
          }
        } catch (error) {
          message.error("Failed to delete therapist");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Update the columns definition to pass the entire record object
  const columns = [
    {
      title: "Photo",
      key: "photo",
      render: (record) => (
        <div className={styles.photoCell}>
          {record.profile_url ? (
            <img
              src={record.profile_url}
              alt={`${record.first_name} ${record.last_name}`}
              className={styles.profileImage}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {record.first_name ? record.first_name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Name",
      key: "name",
      render: (record) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: "Designation",
      dataIndex: "designation",
      key: "designation",
    },
    {
      title: "Qualifications",
      dataIndex: "qualification",
      key: "qualification",
    },
    {
      title: "Experience",
      dataIndex: "years_of_experience",
      key: "experience",
      render: (years) => `${years} years`,
    },
    {
      title: "Specializations",
      dataIndex: "specialization",
      key: "specializations",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => gender.charAt(0).toUpperCase() + gender.slice(1),
    },
    {
      title: "CTA",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEditTherapist(record)}>
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDeleteTherapist(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const handleCreateTherapist = async (values) => {
    try {
      setCreateButtonLoading(true);
      setLoading(true);
      const response = await createTherapist({ ...values, username: values.email });
      if (response.status) {
        message.success("Therapist created successfully");
        setCreateDrawerVisible(false);
        form.resetFields();
        fetchTherapists();
        setNewCreds({
          name: `${values.first_name} ${values.last_name}`,
          email: values.email,
          password: response.data?.temp_password,
        });
        setCredsModal(true);
      }
    } catch (error) {
      message.error("Failed to create therapist");
    } finally {
      setLoading(false);
      setCreateButtonLoading(false); // Reset button loading state
    }
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
      [creds.name, creds.email, creds.password, window.location.origin + "/login"],
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Therapist</h1>
      </div>

      <div className={styles.actionBar}>
        <Button icon={<FilterOutlined />}>Filter</Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateDrawerVisible(true)}
        >
          Add Therapist
        </Button>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          dataSource={therapists}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} therapists`,
          }}
          scroll={{ x: "max-content" }}
        />
      </div>

      {/* Create Therapist Drawer */}
      <Drawer
        title="Add New Therapist"
        width={720}
        onClose={() => setCreateDrawerVisible(false)}
        open={createDrawerVisible}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTherapist}>
          <div className={styles.uploadSection}>
            <Upload>
              <Button icon={<UploadOutlined />}>Upload Photo</Button>
            </Upload>
          </div>

          <div className={styles.formSection}>
            <Form.Item
              name="first_name"
              label="First Name"
              rules={[
                { required: true, message: "Please enter first name" },
                { max: 50, message: "First name cannot exceed 50 characters" },
                {
                  pattern: /^[a-zA-Z\s.\-']+$/,
                  message: "First name can only contain letters, spaces, dots and hyphens"
                }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="last_name"
              label="Last Name"
              rules={[
                { required: true, message: "Please enter last name" },
                { max: 50, message: "Last name cannot exceed 50 characters" },
                {
                  pattern: /^[a-zA-Z\s.\-']+$/,
                  message: "Last name can only contain letters, spaces, dots and hyphens"
                }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter valid email" },
                { max: 100, message: "Email cannot exceed 100 characters" }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone"
              rules={[
                { required: true, message: "Please enter phone number" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const digits = value.replace(/\D/g, "");
                    if (digits.length >= 10 && digits.length <= 13) return Promise.resolve();
                    return Promise.reject("Enter a valid phone number");
                  }
                }
              ]}
            >
              <Input type="tel" maxLength={10} />
            </Form.Item>

            <Form.Item
              name="designation"
              label="Designation"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="qualification"
              label="Qualifications"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="specialization"
              label="Specializations"
              rules={[{ required: true }]}
            >
              <Input.TextArea />
            </Form.Item>

            <Form.Item
              name="years_of_experience"
              label="Years of Experience"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="male">Male</Select.Option>
                <Select.Option value="female">Female</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="bio" label="Bio">
              <Input.TextArea rows={4} />
            </Form.Item>
          </div>

          <div className={styles.buttonGroup}>
            <Button onClick={() => setCreateDrawerVisible(false)}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={createButtonLoading}
              disabled={createButtonLoading}
            >
              Create
            </Button>
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

      {/* Edit Therapist Drawer */}
      <Drawer
        title="Edit Therapist"
        width={720}
        onClose={() => setEditDrawerVisible(false)}
        open={editDrawerVisible}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateTherapist}
        >
          <div className={styles.uploadSection}>
            <Upload>
              <Button icon={<UploadOutlined />}>Update Photo</Button>
            </Upload>
          </div>

          <div className={styles.formSection}>
            <Form.Item
              name="first_name"
              label="First Name"
              rules={[
                { required: true, message: "Please enter first name" },
                { max: 50, message: "First name cannot exceed 50 characters" },
                {
                  pattern: /^[a-zA-Z\s.\-']+$/,
                  message: "First name can only contain letters, spaces, dots and hyphens"
                }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="last_name"
              label="Last Name"
              rules={[
                { required: true, message: "Please enter last name" },
                { max: 50, message: "Last name cannot exceed 50 characters" },
                {
                  pattern: /^[a-zA-Z\s.\-']+$/,
                  message: "Last name can only contain letters, spaces, dots and hyphens"
                }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter valid email" },
                { max: 100, message: "Email cannot exceed 100 characters" }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone"
              rules={[
                { required: true, message: "Please enter phone number" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const digits = value.replace(/\D/g, "");
                    if (digits.length >= 10 && digits.length <= 13) return Promise.resolve();
                    return Promise.reject("Enter a valid phone number");
                  }
                }
              ]}
            >
              <Input type="tel" maxLength={10} />
            </Form.Item>

            <Form.Item
              name="designation"
              label="Designation"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="qualification"
              label="Qualifications"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="specialization"
              label="Specializations"
              rules={[{ required: true }]}
            >
              <Input.TextArea />
            </Form.Item>

            <Form.Item
              name="years_of_experience"
              label="Years of Experience"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="male">Male</Select.Option>
                <Select.Option value="female">Female</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="bio" label="Bio">
              <Input.TextArea rows={4} />
            </Form.Item>
          </div>

          <div className={styles.buttonGroup}>
            <Button onClick={() => setEditDrawerVisible(false)}>Cancel</Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={updateButtonLoading}
              disabled={updateButtonLoading}
            >
              Update
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default Therapists;
