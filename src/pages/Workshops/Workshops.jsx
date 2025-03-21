import React, { useState } from 'react';
import { Tabs, DatePicker, Button, Table, Space } from 'antd';
import { FilterOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './Workshops.module.css';

const { RangePicker } = DatePicker;

const Workshops = () => {
  const [activeTab, setActiveTab] = useState('schedule');

  const scheduleColumns = [
    {
      title: 'Workshop',
      dataIndex: 'workshop',
      key: 'workshop',
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Worksheet',
      dataIndex: 'worksheet',
      key: 'worksheet',
    },
    {
      title: 'Date Added',
      dataIndex: 'dateAdded',
      key: 'dateAdded',
    },
    {
      title: 'CTA',
      key: 'action',
      render: (_, record) => (
        <Button type="link">View Details</Button>
      ),
    },
  ];

  const workshopsColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Host',
      dataIndex: 'host',
      key: 'host',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      ellipsis: true,
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <img 
          src={image} 
          alt="Workshop" 
          style={{ width: 50, height: 50, objectFit: 'cover' }} 
        />
      ),
    },
    {
      title: 'Date Added',
      dataIndex: 'dateAdded',
      key: 'dateAdded',
    },
    {
      title: 'CTA',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link">Edit</Button>
          <Button type="link">Delete</Button>
        </Space>
      ),
    },
  ];

  // Dummy data for schedules
  const scheduleData = [
    {
      key: '1',
      workshop: 'Stress Management',
      company: 'Company A',
      date: '2024-03-15',
      time: '10:00 AM',
      worksheet: 'Worksheet 1',
      dateAdded: '2024-03-01',
    },
  ];

  // Dummy data for workshops
  const workshopsData = [
    {
      key: '1',
      title: 'Mental Health Awareness',
      host: 'Dr. Smith',
      description: 'A comprehensive workshop about understanding and managing mental health in the workplace.',
      image: 'https://example.com/workshop1.jpg',
      dateAdded: '2024-03-01',
    },
  ];

  const items = [
    {
      key: 'schedule',
      label: 'Schedule workshop',
    },
    {
      key: 'workshops',
      label: 'Workshops',
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Workshops</h1>
      
      <Tabs
        activeKey={activeTab}
        items={items}
        onChange={(key) => setActiveTab(key)}
        className={styles.tabs}
      />

      <div className={styles.actionBar}>
        <RangePicker className={styles.datePicker} placeholder={['Start Date', 'End Date']} />
        <Space>
          <Button icon={<FilterOutlined />}>Filter</Button>
          <Button type="primary" icon={<PlusOutlined />}>
            {activeTab === 'schedule' ? 'Create schedule' : 'Create workshop'}
          </Button>
        </Space>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={activeTab === 'schedule' ? scheduleColumns : workshopsColumns}
          dataSource={activeTab === 'schedule' ? scheduleData : workshopsData}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} ${activeTab}`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
};

export default Workshops;