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
} from "antd";
import { FilterOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { getTherapists, createTherapist } from "../../services/api";
import styles from './Therapists.module.css';

const Therapists = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [form] = Form.useForm();

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

  const columns = [
    {
      title: "Photo",
      key: "photo",
      render: () => <div className={styles.photoCell}>Photo</div>,
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
      dataIndex: "qualifications",
      key: "qualifications",
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
          <Button type="link">Edit</Button>
          <Button type="link" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  const handleCreateTherapist = async (values) => {
    try {
      setLoading(true);
      const response = await createTherapist(values);
      if (response.status) {
        message.success('Therapist created successfully');
        setCreateDrawerVisible(false);
        form.resetFields();
        fetchTherapists();
      }
    } catch (error) {
      message.error('Failed to create therapist');
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
          Add employee
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

      <Drawer
        title="Add New Therapist"
        width={720}
        onClose={() => setCreateDrawerVisible(false)}
        open={createDrawerVisible}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTherapist}
        >
          <div className={styles.uploadSection}>
            <Upload>
              <Button icon={<UploadOutlined />}>Upload Photo</Button>
            </Upload>
          </div>

          <div className={styles.formSection}>
            <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="designation" label="Designation" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="qualifications" label="Qualifications" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="specialization" label="Specializations" rules={[{ required: true }]}>
              <Input.TextArea />
            </Form.Item>

            <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="male">Male</Select.Option>
                <Select.Option value="female">Female</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className={styles.buttonGroup}>
            <Button onClick={() => setCreateDrawerVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default Therapists;
