import React, { useState } from 'react';
import { Tabs, DatePicker, Button, Table, Space, Drawer, Form, Input, Upload, Select, TimePicker } from 'antd';
import { FilterOutlined, PlusOutlined, UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import styles from './Workshops.module.css';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const Workshops = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [scheduleDrawerVisible, setScheduleDrawerVisible] = useState(false);
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [scheduleForm] = Form.useForm();
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [form] = Form.useForm();

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

  const handleCreateWorkshop = (values) => {
    console.log('Form values:', values);
    // Add API call here
    setCreateDrawerVisible(false);
    form.resetFields();
  };

  const handleCreateClick = () => {
    if (activeTab === 'schedule') {
      setScheduleDrawerVisible(true);
    } else {
      setCreateDrawerVisible(true);
    }
  };

  const handleScheduleSubmit = (values) => {
    console.log('Schedule values:', values);
    setScheduleDrawerVisible(false);
    scheduleForm.resetFields();
  };

  // Add this component inside your main component
  const ScheduleDrawer = () => (
    <Drawer
      title={
        <Space>
          <ArrowLeftOutlined onClick={() => setScheduleDrawerVisible(false)} />
          Create schedule
        </Space>
      }
      width={1000}
      onClose={() => setScheduleDrawerVisible(false)}
      open={scheduleDrawerVisible}
    >
      <div className={styles.scheduleForm}>
        <div className={styles.formSection}>
          <Form
            form={scheduleForm}
            layout="vertical"
            onFinish={handleScheduleSubmit}
          >
            <Form.Item
              name="workshop_template"
              label="Select workshop template"
              rules={[{ required: true, message: 'Please select a workshop' }]}
            >
              <Select
                placeholder="Select workshop"
                onChange={(value, option) => setSelectedWorkshop(option)}
              >
                <Select.Option value="1">Unleash your inner superhero by building resilience</Select.Option>
                <Select.Option value="2">Stress Management Workshop</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="company"
              label="Select company"
              rules={[{ required: true, message: 'Please select a company' }]}
            >
              <Select placeholder="Select company">
                <Select.Option value="1">Company A</Select.Option>
                <Select.Option value="2">Company B</Select.Option>
              </Select>
            </Form.Item>

            <div className={styles.dateTimeContainer}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please select date' }]}
                style={{ flex: 1 }}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="time"
                label="Time"
                rules={[{ required: true, message: 'Please select time' }]}
                style={{ flex: 1 }}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </div>

            <Form.Item
              name="resources"
              label="Resources (optional)"
            >
              <Upload>
                <Button icon={<UploadOutlined />}>Upload files</Button>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Confirm
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div className={styles.previewSection}>
          <h3>Preview</h3>
          <div className={styles.previewImage}>
            <img src="/placeholder-image.png" alt="Workshop preview" />
          </div>
          {selectedWorkshop && (
            <>
              <h2 className={styles.previewTitle}>
                Unleash your inner superhero by building resilience
              </h2>
              <p className={styles.previewDescription}>
                Join this transformative session to discover tools and techniques for managing stress and improving focus. Learn how mindfulness practices can help you regain control and build resilience in your daily life.
              </p>
            </>
          )}
        </div>
      </div>
    </Drawer>
  );

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
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateClick}>
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

      <Drawer
        title={
          <Space>
            <ArrowLeftOutlined onClick={() => setCreateDrawerVisible(false)} />
            Create workshop
          </Space>
        }
        width={720}
        onClose={() => setCreateDrawerVisible(false)}
        open={createDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateWorkshop}
        >
          <div className={styles.uploadSection}>
            <Upload.Dragger
              name="image"
              multiple={false}
              action="/api/upload" // Replace with your upload endpoint
              onChange={(info) => {
                if (info.file.status === 'done') {
                  message.success(`${info.file.name} file uploaded successfully`);
                } else if (info.file.status === 'error') {
                  message.error(`${info.file.name} file upload failed.`);
                }
              }}
            >
              <p className="ant-upload-drag-icon">
                <img 
                  src="/placeholder-image.png" 
                  alt="Upload" 
                  style={{ width: 100, height: 100 }}
                />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
            </Upload.Dragger>
          </div>

          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="host_name"
            label="Host name"
            rules={[{ required: true, message: 'Please enter host name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="other_details"
            label="Other details"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="worksheet"
            label="Worksheet"
          >
            <Upload>
              <Button icon={<UploadOutlined />}>Upload files</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className={styles.submitButton}>
              Review and save
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
      
      {/* Add this before closing div */}
      <ScheduleDrawer />
    </div>
  );
};

export default Workshops;