import React, { useState } from 'react';
import { Tabs, Button, Table, Space, DatePicker, Drawer, Form, Input, Upload, Select } from 'antd';
import { FilterOutlined, PlusOutlined, UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import styles from './Resources.module.css';

const Resources = () => {
  const [activeTab, setActiveTab] = useState('articles');
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [form] = Form.useForm();

  const articlesColumns = [
    {
      title: 'Cover Image',
      key: 'coverImage',
      render: () => <div className={styles.coverImage}>Image</div>,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Date published',
      dataIndex: 'datePublished',
      key: 'datePublished',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'CTA 1',
      key: 'cta1',
      render: () => <Button type="link">Preview</Button>,
    },
    {
      title: 'CTA 2',
      key: 'cta2',
      render: () => <Button type="link">...</Button>,
    },
  ];

  const imagesColumns = [
    {
      title: 'Cover image',
      key: 'coverImage',
      render: () => <div className={styles.coverImage}>Image</div>,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Date published',
      dataIndex: 'datePublished',
      key: 'datePublished',
    },
    {
      title: 'CTA 1',
      key: 'cta1',
      render: () => <Button type="link">Preview</Button>,
    },
    {
      title: 'CTA 2',
      key: 'cta2',
      render: () => <Button type="link">...</Button>,
    },
  ];

  const videosColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'YouTube link',
      dataIndex: 'youtubeLink',
      key: 'youtubeLink',
    },
    {
      title: 'Date published',
      dataIndex: 'datePublished',
      key: 'datePublished',
    },
    {
      title: 'CTA 1',
      key: 'cta1',
      render: () => <Button type="link">Preview</Button>,
    },
    {
      title: 'CTA 2',
      key: 'cta2',
      render: () => <Button type="link">...</Button>,
    },
  ];

  const documentsColumns = [
    {
      title: 'Doc type',
      key: 'docType',
      render: () => <div className={styles.docIcon}>📄</div>,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Date published',
      dataIndex: 'datePublished',
      key: 'datePublished',
    },
    {
      title: 'CTA 1',
      key: 'cta1',
      render: () => <Button type="link">Preview</Button>,
    },
    {
      title: 'CTA 2',
      key: 'cta2',
      render: () => <Button type="link">...</Button>,
    },
  ];

  const getColumns = () => {
    switch (activeTab) {
      case 'articles':
        return articlesColumns;
      case 'images':
        return imagesColumns;
      case 'videos':
        return videosColumns;
      case 'documents':
        return documentsColumns;
      default:
        return articlesColumns;
    }
  };

  const items = [
    {
      key: 'articles',
      label: 'Articles',
    },
    {
      key: 'images',
      label: 'Images',
    },
    {
      key: 'videos',
      label: 'Videos',
    },
    {
      key: 'documents',
      label: 'Documents',
    },
  ];

  const handleCreateResource = (values) => {
    console.log('Form values:', values);
    setCreateDrawerVisible(false);
    form.resetFields();
  };

  const renderFormFields = () => {
    const resourceType = form.getFieldValue('resource_type');

    switch (resourceType) {
      case 'article':
        return (
          <>
            <Form.Item
              name="title"
              label="Article title"
              rules={[{ required: true, message: 'Please enter article title' }]}
            >
              <Input placeholder="Enter article title" />
            </Form.Item>

            <Form.Item
              name="read_time"
              label="Reading time"
              rules={[{ required: true, message: 'Please enter reading time' }]}
            >
              <Input placeholder="e.g., 5 mins" />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select placeholder="Select category">
                <Select.Option value="mental_health">Mental Health</Select.Option>
                <Select.Option value="wellness">Wellness</Select.Option>
                <Select.Option value="productivity">Productivity</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="tags"
              label="Tags"
            >
              <Select
                mode="tags"
                placeholder="Add tags"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="content"
              label="Article content"
              rules={[{ required: true, message: 'Please enter article content' }]}
            >
              <Input.TextArea rows={6} placeholder="Write your article content here" />
            </Form.Item>

            <Form.Item
              name="cover_image"
              label="Cover image"
              rules={[{ required: true, message: 'Please upload cover image' }]}
            >
              <Upload.Dragger maxCount={1} beforeUpload={() => false} accept="image/*">
                <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                <p className="ant-upload-text">Click or drag image to upload</p>
              </Upload.Dragger>
            </Form.Item>
          </>
        );

      case 'video':
        return (
          <>
            <Form.Item
              name="title"
              label="Video title"
              rules={[{ required: true, message: 'Please enter video title' }]}
            >
              <Input placeholder="Enter video title" />
            </Form.Item>

            <Form.Item
              name="url"
              label="Video URL"
              rules={[
                { required: true, message: 'Please enter video URL' },
                { type: 'url', message: 'Please enter a valid URL' }
              ]}
            >
              <Input placeholder="Enter YouTube/video URL" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <Input.TextArea rows={4} placeholder="Enter video description" />
            </Form.Item>

            <Form.Item
              name="tags"
              label="Tags"
            >
              <Select
                mode="tags"
                placeholder="Add tags"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="thumbnail"
              label="Thumbnail"
            >
              <Upload.Dragger maxCount={1} beforeUpload={() => false} accept="image/*">
                <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                <p className="ant-upload-text">Click or drag thumbnail to upload</p>
              </Upload.Dragger>
            </Form.Item>
          </>
        );

      case 'image':
        return (
          <>
            <Form.Item
              name="title"
              label="Image title"
              rules={[{ required: true, message: 'Please enter image title' }]}
            >
              <Input placeholder="Enter image title" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <Input.TextArea rows={4} placeholder="Enter image description" />
            </Form.Item>

            <Form.Item
              name="tags"
              label="Tags"
            >
              <Select
                mode="tags"
                placeholder="Add tags"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="image"
              label="Upload Image"
              rules={[{ required: true, message: 'Please upload an image' }]}
            >
              <Upload.Dragger maxCount={1} beforeUpload={() => false} accept="image/*">
                <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                <p className="ant-upload-text">Click or drag image to upload</p>
              </Upload.Dragger>
            </Form.Item>
          </>
        );

      case 'document':
        return (
          <>
            <Form.Item
              name="title"
              label="Document title"
              rules={[{ required: true, message: 'Please enter document title' }]}
            >
              <Input placeholder="Enter document title" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <Input.TextArea rows={4} placeholder="Enter document description" />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select placeholder="Select category">
                <Select.Option value="guide">Guide</Select.Option>
                <Select.Option value="report">Report</Select.Option>
                <Select.Option value="template">Template</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="tags"
              label="Tags"
            >
              <Select
                mode="tags"
                placeholder="Add tags"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="document"
              label="Upload Document"
              rules={[{ required: true, message: 'Please upload a document' }]}
            >
              <Upload.Dragger maxCount={1} beforeUpload={() => false} accept=".pdf,.doc,.docx">
                <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                <p className="ant-upload-text">Click or drag document to upload</p>
              </Upload.Dragger>
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  const [selectedResourceType, setSelectedResourceType] = useState(null);

  const handleResourceTypeSelect = (value) => {
    setSelectedResourceType(value);
    form.setFieldsValue({ resource_type: value });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Resources</h1>
      
      <Tabs
        activeKey={activeTab}
        items={items}
        onChange={(key) => setActiveTab(key)}
        className={styles.tabs}
      />

      <div className={styles.actionBar}>
        <DatePicker.RangePicker className={styles.datePicker} />
        <Space>
          <Button icon={<FilterOutlined />}>Filter</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateDrawerVisible(true)}>
            Add new
          </Button>
        </Space>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={getColumns()}
          dataSource={[]}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
        />
      </div>
      
      <Drawer
        title={
          <Space>
            <ArrowLeftOutlined onClick={() => setCreateDrawerVisible(false)} />
            Add new resource
          </Space>
        }
        width={720}
        onClose={() => {
          setCreateDrawerVisible(false);
          setSelectedResourceType(null);
          form.resetFields();
        }}
        open={createDrawerVisible}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateResource}
        >
          <Form.Item
            name="resource_type"
            label={<span className={styles.required}>Resource type</span>}
            rules={[{ required: true, message: 'Please select resource type' }]}
          >
            <Select 
              placeholder="Select resource type"
              onChange={handleResourceTypeSelect}
            >
              <Select.Option value="article">Article/blog</Select.Option>
              <Select.Option value="video">Video</Select.Option>
              <Select.Option value="image">Image</Select.Option>
              <Select.Option value="document">Document</Select.Option>
            </Select>
          </Form.Item>

          {selectedResourceType && renderFormFields()}

          {selectedResourceType && (
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Confirm
              </Button>
            </Form.Item>
          )}
        </Form>
      </Drawer>
    </div>
  );
};

export default Resources;