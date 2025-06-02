import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Form, Input, Drawer, message, Upload, Modal, Switch, Select, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getRewards, createReward, updateReward, deleteReward, getAllCompanies } from '../../services/api';
import styles from './Rewards.module.css';

const { Option } = Select;

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [form] = Form.useForm();
  const [editingReward, setEditingReward] = useState(null);
  
  // New state variables
  const [isGlobalReward, setIsGlobalReward] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  // Add new state variables for button loading
  const [submitButtonLoading, setSubmitButtonLoading] = useState(false);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch companies function
  const fetchCompanies = async () => {
    setCompaniesLoading(true);
    try {
      const response = await getAllCompanies();
      console.log('Companies API response:', response); // Debug log
      
      if (response.status && response.data) {
        // Check if response.data is an array or has a companies property
        if (Array.isArray(response.data)) {
          setCompanies(response.data);
        } else if (response.data.companies && Array.isArray(response.data.companies)) {
          setCompanies(response.data.companies);
        } else {
          console.error('Unexpected companies data format:', response.data);
          setCompanies([]);
          throw new Error('Unexpected companies data format');
        }
      } else {
        setCompanies([]);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      message.error('Failed to fetch companies: ' + (error.message || 'Unknown error'));
      setCompanies([]);
    } finally {
      setCompaniesLoading(false);
    }
  };

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const response = await getRewards();
      if (response.status && response.data) {
        setRewards(response.data.map(reward => {
          // Parse company_ids if it's a string
          let companyIds = reward.company_ids;
          if (typeof companyIds === 'string') {
            try {
              companyIds = JSON.parse(companyIds);
            } catch (e) {
              console.error('Error parsing company_ids:', e);
              companyIds = [];
            }
          }
          
          return {
            ...reward,
            name: reward.title, // Map title to name for existing table column
            description: reward.terms_and_conditions, // Map terms_and_conditions to description
            key: reward.id, // Ensure each row has a unique key
            company_ids: Array.isArray(companyIds) ? companyIds : []
          };
        }));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
      message.error('Failed to fetch rewards: ' + (error.message || 'Unknown error'));
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleCreate = async (values) => {
    try {
      setSubmitButtonLoading(true); // Set button loading state to true
      
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('terms_and_conditions', values.terms_and_conditions);
      formData.append('reward_type', isGlobalReward ? 'global' : 'custom');
      
      // Add company_ids for custom rewards
      if (!isGlobalReward && values.company_ids) {
        formData.append('company_ids', JSON.stringify(values.company_ids));
      }
      
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
      setIsGlobalReward(true);
      fetchRewards();
    } catch (error) {
      message.error(editingReward 
        ? 'Failed to update reward: ' + (error.message || 'Unknown error')
        : 'Failed to create reward: ' + (error.message || 'Unknown error')
      );
      console.error('Error with reward:', error);
    } finally {
      setSubmitButtonLoading(false); // Reset button loading state
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id); // Set the ID of the reward being deleted
    
    Modal.confirm({
      title: 'Are you sure you want to delete this reward?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          setDeleteButtonLoading(true); // Set button loading state
          await deleteReward(id);
          message.success('Reward deleted successfully');
          fetchRewards();
        } catch (error) {
          message.error('Failed to delete reward: ' + (error.message || 'Unknown error'));
          console.error('Error deleting reward:', error);
        } finally {
          setDeleteButtonLoading(false); // Reset button loading state
          setDeletingId(null); // Reset the deleting ID
        }
      },
      onCancel: () => {
        setDeletingId(null); // Reset the deleting ID if canceled
      }
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
      title: 'Reward Type',
      dataIndex: 'reward_type',
      key: 'reward_type',
      width: 100,
      render: (type) => type === 'global' ? 'Global' : 'Custom',
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
              console.log('Edit reward data:', record); // Debug log
              setEditingReward(record);
              
              // Determine if it's a global or custom reward
              const isGlobal = record.reward_type === 'global';
              setIsGlobalReward(isGlobal);
              
              // If it's a custom reward, fetch companies
              if (!isGlobal) {
                fetchCompanies().then(() => {
                  // Parse company_ids if it's a string
                  let companyIds = record.company_ids;
                  if (typeof companyIds === 'string') {
                    try {
                      companyIds = JSON.parse(companyIds);
                    } catch (e) {
                      console.error('Error parsing company_ids:', e);
                      companyIds = [];
                    }
                  }
                  
                  // If we have companies in the record, extract their IDs
                  if (Array.isArray(record.companies) && record.companies.length > 0) {
                    companyIds = record.companies.map(company => company.id || company.company_id);
                  }
                  
                  console.log('Setting company_ids for edit form:', companyIds);
                  
                  // Set form values after companies are loaded
                  form.setFieldsValue({
                    title: record.title,
                    terms_and_conditions: record.terms_and_conditions,
                    company_ids: Array.isArray(companyIds) ? companyIds : [],
                    icon: record.icon_url ? {
                      fileList: [{
                        uid: '-1',
                        name: 'Current Icon',
                        status: 'done',
                        url: record.icon_url,
                      }]
                    } : undefined
                  });
                });
              } else {
                // Set form values for global reward
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
              }
              
              setDrawerVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deleteButtonLoading && deletingId === record.id}
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
        <h1 className={styles.title}>Rewards Management</h1>
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
        scroll={{ x: 1400 }}
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
            {editingReward ? 'Edit Reward' : 'Create Reward'}
          </Space>
        }
        placement="right"
        width={520}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
          setEditingReward(null);
          setIsGlobalReward(true);
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
            rules={[
              { required: true, message: 'Please enter reward name' },
              { max: 100, message: 'Reward name cannot exceed 100 characters' }
            ]}
          >
            <Input placeholder="Enter reward name" />
          </Form.Item>

          <Form.Item
            name="terms_and_conditions"
            label="Terms and Conditions"
            rules={[
              { required: true, message: 'Please enter terms and conditions' },
              { max: 1000, message: 'Terms and conditions cannot exceed 1000 characters' }
            ]}
          >
            <Input.TextArea rows={4} placeholder="Enter terms and conditions" />
          </Form.Item>

          <Form.Item
            name="reward_type"
            label="Reward Type"
          >
            <Switch
              checkedChildren="Global"
              unCheckedChildren="Custom"
              checked={isGlobalReward}
              onChange={(checked) => {
                setIsGlobalReward(checked);
                if (!checked && companies.length === 0) {
                  fetchCompanies();
                }
              }}
            />
          </Form.Item>

          {!isGlobalReward && (
            <Form.Item
              name="company_ids"
              label="Select Companies"
              rules={[
                { required: true, message: 'Please select at least one company' },
                { type: 'array', min: 1, message: 'Please select at least one company' }
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Select companies"
                loading={companiesLoading}
                style={{ width: '100%' }}
                notFoundContent={companiesLoading ? <Spin size="small" /> : "No companies found"}
              >
                {Array.isArray(companies) && companies.length > 0 ? (
                  companies.map(company => (
                    <Option key={company.id} value={company.id}>
                      {company.company_name}
                    </Option>
                  ))
                ) : (
                  <Option value="" disabled>No companies available</Option>
                )}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="icon"
            label="Icon"
            rules={[
              {
                required: true,
                message: 'Please upload an icon',
              },
              {
                validator: (_, value) => {
                  if (!value || !value.fileList || value.fileList.length === 0) {
                    return Promise.reject('Please upload an icon');
                  }
                  
                  const file = value.fileList[0];
                  
                  // Check file type
                  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                  if (!isJpgOrPng && file.originFileObj) {
                    return Promise.reject('You can only upload JPG/PNG file!');
                  }
                  
                  // Check file size (less than 2MB)
                  const isLt2M = file.size / 1024 / 1024 < 2;
                  if (!isLt2M && file.originFileObj) {
                    return Promise.reject('Image must be smaller than 2MB!');
                  }
                  
                  return Promise.resolve();
                }
              }
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
            <Button 
              type="primary" 
              htmlType="submit" 
              block
              loading={submitButtonLoading}
              disabled={submitButtonLoading}
            >
              {editingReward ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* View Details Drawer */}
      <Drawer
        title={
          <Space>
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

            <div className={styles.detailItem}>
              <h3>Reward Type</h3>
              <p>{selectedReward.reward_type === 'global' ? 'Global' : 'Custom'}</p>
            </div>

            {selectedReward.reward_type === 'custom' && (
              <div className={styles.detailItem}>
                <h3>Companies</h3>
                {Array.isArray(selectedReward.companies) && selectedReward.companies.length > 0 ? (
                  <ul className={styles.companyList}>
                    {selectedReward.companies.map(company => (
                      <li key={company.id || company.company_id}>
                        {company.company_name || company.name || 'Unknown Company'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No companies assigned</p>
                )}
              </div>
            )}

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
