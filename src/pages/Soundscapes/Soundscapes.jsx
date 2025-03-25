import React, { useState } from 'react';
import { Table, Button, Space, Upload, Drawer, Form, Input, Select } from 'antd';
import { FilterOutlined, PlusOutlined, ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import styles from './Soundscapes.module.css';

const Soundscapes = () => {
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Album art',
      key: 'albumArt',
      render: (image) => (
        <div className={styles.albumArt}>
          <img src={image} alt="Album Art" />
        </div>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Length',
      dataIndex: 'length',
      key: 'length',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Date added',
      dataIndex: 'dateAdded',
      key: 'dateAdded',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link">Edit</Button>
          <Button type="link" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  const handleCreateSoundscape = (values) => {
    console.log('Form values:', values);
    setCreateDrawerVisible(false);
    form.resetFields();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Soundscape</h1>
      </div>

      <div className={styles.actionBar}>
        <Button icon={<FilterOutlined />}>Filter</Button>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateDrawerVisible(true)}
        >
          Add new
        </Button>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          dataSource={[]}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} soundscapes`,
          }}
        />
      </div>

      <Drawer
        title={
          <Space>
            <ArrowLeftOutlined onClick={() => setCreateDrawerVisible(false)} />
            Add new soundscape
          </Space>
        }
        width={720}
        onClose={() => setCreateDrawerVisible(false)}
        open={createDrawerVisible}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSoundscape}
        >
          <div className={styles.uploadSection}>
            <Upload.Dragger
              maxCount={1}
              beforeUpload={() => false}
              accept="image/*"
              className={styles.imageUpload}
            >
              <div className={styles.uploadPlaceholder}>
                <img src="/placeholder-image.png" alt="Upload" />
              </div>
            </Upload.Dragger>
          </div>

          <Form.Item
            name="music_title"
            label="Music title"
            rules={[{ required: true, message: 'Please enter music title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="artist_name"
            label="Artist name"
            rules={[{ required: true, message: 'Please enter artist name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Mind">
              <Select.Option value="mind">Mind</Select.Option>
              <Select.Option value="relax">Relax</Select.Option>
              <Select.Option value="focus">Focus</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags & keywords"
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Add tags"
              open={false}
            />
          </Form.Item>

          <Form.Item
            name="music_file"
            label="Upload music file"
            rules={[{ required: true, message: 'Please upload music file' }]}
          >
            <Upload.Dragger
              maxCount={1}
              beforeUpload={() => false}
              accept="audio/*"
              className={styles.audioUpload}
            >
              <Button icon={<UploadOutlined />}>Upload files</Button>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item className={styles.submitButton}>
            <Button type="primary" htmlType="submit" block>
              Confirm
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Soundscapes;