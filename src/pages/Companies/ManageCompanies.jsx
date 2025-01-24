// src/components/ManageCompanies.js
import React, { useState, useEffect } from 'react';
import { Table, Input, DatePicker, Space, Drawer, Descriptions, Form, Button, Select } from 'antd';
import { getAllCompanies } from '../../services/api';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';

const { RangePicker } = DatePicker;

const ManageCompanies = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const response = await getAllCompanies();
        setData(response.data.companies);
      } catch (error) {
        console.error('Error fetching company data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchText, dateRange, data]);

  const filterData = () => {
    let filtered = [...data];
    
    // Search filter
    if (searchText) {
      filtered = filtered.filter(item => 
        item.company_name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.email_domain.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Date range filter
    if (dateRange.length === 2) {
      filtered = filtered.filter(item => {
        const itemDate = moment(item.onboarding_date);
        return itemDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
      });
    }

    setFilteredData(filtered);
  };

  const onRowClick = (record) => {
    return {
      onClick: () => {
        setSelectedCompany(record);
        setDrawerVisible(true);
      },
      style: { cursor: 'pointer' }
    };
  };

  const handleCreateCompany = async (values) => {
    // API call to create company
    setCreateDrawerVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'company_name',
      key: 'company_name',
    },
    {
      title: 'Email Domain',
      dataIndex: 'email_domain',
      key: 'email_domain',
    },
    {
      title: 'Onboarding Date',
      dataIndex: 'onboarding_date',
      key: 'onboarding_date',
      render: (date) => new Date(date).toLocaleDateString(),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              setDateRange(dates);
              setSelectedKeys(dates ? [dates] : []);
            }}
            onOk={() => confirm()}
          />
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Pending', value: 'pending' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <span style={{ 
          textTransform: 'capitalize',
          color: status === 'active' ? 'green' : 'red' 
        }}>
          {status}
        </span>
      ),
    },
    {
      title: 'Company Size',
      dataIndex: 'company_size',
      key: 'company_size',
      filters: [
        { text: '1-100', value: '100' },
        { text: '101-200', value: '200' },
        { text: '201-300', value: '300' },
        { text: '301-500', value: '500' },
        { text: '500+', value: '501' }
      ],
      onFilter: (value, record) => {
        const size = parseInt(value);
        if (size === 501) {
          return record.company_size >= 500;
        }
        return record.company_size <= size && 
               record.company_size > (size - 100);
      },
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    }
  ];

  return (
    <div>
      <h1>Manage Companies</h1>
      <Space 
        direction="horizontal" 
        style={{ 
          width: '100%', 
          marginBottom: 16, 
          justifyContent: 'space-between' 
        }}
      >
        <Input.Search
          placeholder="Search companies..."
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 400 }}
          allowClear
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateDrawerVisible(true)}
        >
          Create Company
        </Button>
      </Space>
      <Table 
        dataSource={filteredData.length > 0 ? filteredData : data} 
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} companies`
        }}
        onRow={onRowClick}
      />

      <Drawer
        title="Company Details"
        placement="right"
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedCompany && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Company Name">
              {selectedCompany.company_name}
            </Descriptions.Item>
            <Descriptions.Item label="Email Domain">
              {selectedCompany.email_domain}
            </Descriptions.Item>
            <Descriptions.Item label="Industry">
              {selectedCompany.industry}
            </Descriptions.Item>
            <Descriptions.Item label="Company Size">
              {selectedCompany.company_size}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <span style={{ 
                color: selectedCompany.status === 'active' ? 'green' : 'red',
                textTransform: 'capitalize'
              }}>
                {selectedCompany.status}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Onboarding Date">
              {new Date(selectedCompany.onboarding_date).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {new Date(selectedCompany.created_at).toLocaleDateString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      <Drawer
        title="Create New Company"
        width={500}
        onClose={() => setCreateDrawerVisible(false)}
        open={createDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCompany}
        >
          <Form.Item
            name="company_name"
            label="Company Name"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email_domain"
            label="Email Domain"
            rules={[{ required: true, message: 'Please enter email domain' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="industry"
            label="Industry"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="company_size"
            label="Company Size"
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            initialValue="active"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="onboarding_date"
            label="Onboarding Date"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Space>
            <Button onClick={() => setCreateDrawerVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Space>
        </Form>
      </Drawer>
    </div>
  );
};

export default ManageCompanies;
