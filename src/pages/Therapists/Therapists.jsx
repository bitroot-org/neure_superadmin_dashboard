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
      setLoading(true);
      const response = await createTherapist(values);
      if (response.status) {
        message.success("Therapist created successfully");
        setCreateDrawerVisible(false);
        form.resetFields();
        fetchTherapists();
      }
    } catch (error) {
      message.error("Failed to create therapist");
    } finally {
      setLoading(false);
    }
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
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="last_name"
              label="Last Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: "email" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
              <Input />
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
            <Button type="primary" htmlType="submit" loading={loading}>
              Create
            </Button>
          </div>
        </Form>
      </Drawer>

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
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="last_name"
              label="Last Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: "email" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
              <Input />
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
            <Button type="primary" htmlType="submit" loading={loading}>
              Update
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default Therapists;
