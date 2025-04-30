import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Form, Input, Drawer, message, Upload, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getRewards, createReward, updateReward, deleteReward } from '../../services/api';
import styles from './Rewards.module.css';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [form] = Form.useForm();
  const [editingReward, setEditingReward] = useState(null);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const response = await getRewards();
      if (response.status && response.data) {
        setRewards(response.data.map(reward => ({
          ...reward,
          name: reward.title, // Map title to name for existing table column
          description: reward.terms_and_conditions, // Map terms_and_conditions to description
          key: reward.id // Ensure each row has a unique key
        })));
      }
    } catch (error) {
      message.error('Failed to fetch rewards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleCreate = async (values) => {
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('terms_and_conditions', values.terms_and_conditions);
      
      // Get the icon file from Upload component
      const iconFile = values.icon?.fileList[0]?.originFileObj;
      if (iconFile) {
        formData.append('icon', iconFile);
      }

      if (editingReward) {
        // Add ID to formData for update
        formData.append('id', editingReward.id);
        await updateReward(formData);
        message.success('Reward updated successfully');
      } else {
        await createReward(formData);
        message.success('Reward created successfully');
      }

      setDrawerVisible(false);
      form.resetFields();
      setEditingReward(null);
      fetchRewards();
    } catch (error) {
      message.error('Failed to save reward');
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this reward?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteReward(id);
          message.success('Reward deleted successfully');
          fetchRewards();
        } catch (error) {
          message.error('Failed to delete reward');
        }
      },
    });
  };

  const handleRowClick = (record) => {
    setSelectedReward(record);
    setViewDrawerVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Description',
      dataIndex: 'terms_and_conditions',
      key: 'terms_and_conditions',
      width: 300,
      render: (text) => (
        <span className={styles.truncatedDescription}>
          {text}
        </span>
      ),
    },
    {
      title: 'Icon',
      key: 'icon',
      width: 80,
      render: (_, record) => (
        record.icon_url ? (
          <img 
            src={record.icon_url} 
            alt={record.title} 
            style={{ width: 40, height: 40, objectFit: 'cover' }}
          />
        ) : null
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click
              setEditingReward(record);
              form.setFieldsValue({
                title: record.title,
                terms_and_conditions: record.terms_and_conditions,
                icon: record.icon_url ? {
                  fileList: [{
                    uid: '-1',
                    name: 'Current Icon',
                    status: 'done',
                    url: record.icon_url,
                  }]
                } : undefined
              });
              setDrawerVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click
              handleDelete(record.id);
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Rewards Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingReward(null);
            form.resetFields();
            setDrawerVisible(true);
          }}
        >
          Create Reward
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={rewards}
        loading={loading}
        scroll={{ x: "max-content" }}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' }
        })}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
      />

      {/* Create/Edit Drawer */}
      <Drawer
        title={
          <Space>
            <ArrowLeftOutlined onClick={() => setDrawerVisible(false)} />
            {editingReward ? 'Edit Reward' : 'Create Reward'}
          </Space>
        }
        placement="right"
        width={520}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
          setEditingReward(null);
        }}
        open={drawerVisible}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="title"
            label="Reward Name"
            rules={[{ required: true, message: 'Please enter reward name' }]}
          >
            <Input placeholder="Enter reward name" />
          </Form.Item>

          <Form.Item
            name="terms_and_conditions"
            label="Terms and Conditions"
            rules={[{ required: true, message: 'Please enter terms and conditions' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter terms and conditions" />
          </Form.Item>

          <Form.Item
            name="icon"
            label="Icon"
            rules={[
              {
                required: true,
                message: 'Please upload an icon',
              },
            ]}
          >
            <Upload
              accept=".jpg,.jpeg,.png"
              maxCount={1}
              listType="picture-card"
              beforeUpload={() => false} // Prevent auto upload
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingReward ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* View Details Drawer */}
      <Drawer
        title={
          <Space>
            <ArrowLeftOutlined onClick={() => setViewDrawerVisible(false)} />
            Reward Details
          </Space>
        }
        placement="right"
        width={520}
        onClose={() => {
          setViewDrawerVisible(false);
          setSelectedReward(null);
        }}
        open={viewDrawerVisible}
      >
        {selectedReward && (
          <div className={styles.detailsContainer}>
            <div className={styles.detailItem}>
              <h3>Name</h3>
              <p>{selectedReward.title}</p>
            </div>

            <div className={styles.detailItem}>
              <h3>Terms and Conditions</h3>
              <p>{selectedReward.terms_and_conditions}</p>
            </div>

            {selectedReward.icon_url && (
              <div className={styles.detailItem}>
                <h3>Icon</h3>
                <img 
                  src={selectedReward.icon_url} 
                  alt={selectedReward.title}
                  style={{ width: 80, height: 80, objectFit: 'cover' }}
                />
              </div>
            )}

            <div className={styles.detailItem}>
              <h3>Created At</h3>
              <p>{new Date(selectedReward.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Rewards;
