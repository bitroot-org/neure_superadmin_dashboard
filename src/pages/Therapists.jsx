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
  Descriptions,
  DatePicker,
  InputNumber,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getTherapists, createTherapist } from "../services/api";

const Therapists = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchTherapists = async () => {
      setLoading(true);
      try {
        const response = await getTherapists();
        setTherapists(response.data.therapists);
      } catch (error) {
        message.error("Failed to fetch therapists");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  const onRowClick = (record) => ({
    onClick: () => {
      setSelectedTherapist(record);
      setDrawerVisible(true);
      console.log(record);
      console.log(selectedTherapist);
    },
    style: { cursor: "pointer" },
  });

  const handleCreateTherapist = async (values) => {
    try {
      setLoading(true);
      const formData = {
        ...values,
        date_of_birth: values.date_of_birth.format('YYYY-MM-DD')
      };

      const response = await createTherapist(formData);
      
      if (response.status) {
        message.success('Therapist created successfully');
        setCreateDrawerVisible(false);
        form.resetFields();
        // Refresh therapist list
        fetchTherapists();
      }
    } catch (error) {
      console.error('Error creating therapist:', error);
      message.error('Failed to create therapist');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (record) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => gender.charAt(0).toUpperCase() + gender.slice(1),
    },
    {
      title: "Specialization",
      dataIndex: "specialization",
      key: "specialization",
    },
    {
      title: "Bio",
      dataIndex: "bio",
      key: "bio",
      ellipsis: true,
    },
    {
      title: "Years of Experience",
      dataIndex: "years_of_experience",
      key: "years_of_experience",
    },
  ];

  return (
    <div>
      <h1>Therapists</h1>

      <Space
        direction="horizontal"
        style={{
          width: "100%",
          marginBottom: 16,
          justifyContent: "space-between",
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateDrawerVisible(true)}
        >
          Add Therapist
        </Button>
      </Space>

      <Table
        dataSource={therapists}
        columns={columns}
        rowKey="user_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} therapists`,
        }}
        onRow={onRowClick}
      />

      {/* Details Drawer */}
      <Drawer
        title="Therapist Details"
        placement="right"
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedTherapist && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">
              {`${selectedTherapist.first_name} ${selectedTherapist.last_name}`}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedTherapist.email}
            </Descriptions.Item>
            <Descriptions.Item label="Username">
              {selectedTherapist.username}
            </Descriptions.Item>
            <Descriptions.Item label="Gender">
              {selectedTherapist.gender}
            </Descriptions.Item>
            <Descriptions.Item label="Specialization">
              {selectedTherapist.specialization}
            </Descriptions.Item>
            <Descriptions.Item label="Bio">
              {selectedTherapist.bio}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* Create Drawer */}
      <Drawer
        title="Add New Therapist"
        width={500}
        onClose={() => setCreateDrawerVisible(false)}
        open={createDrawerVisible}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTherapist}
        >
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
            rules={[
              { required: true },
              { type: 'email' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true }]}
          >
            <Input />
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

          <Form.Item
            name="date_of_birth"
            label="Date of Birth"
            rules={[{ required: true }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item
            name="years_of_experience"
            label="Years of Experience"
            rules={[{ required: true }]}
          >
            <InputNumber 
              min={0} 
              style={{ width: '100%' }}
              placeholder="Enter years of experience"
            />
          </Form.Item>

          <Form.Item
            name="specialization"
            label="Specialization"
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="bio"
            label="Bio"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Space>
            <Button onClick={() => setCreateDrawerVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create
            </Button>
          </Space>
        </Form>
      </Drawer>
    </div>
  );
};

export default Therapists;
