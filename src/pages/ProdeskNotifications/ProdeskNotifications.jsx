import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  message,
  Switch,
  Tag,
  Spin,
  Descriptions,
  List,
  Empty,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getProdeskTherapists,
  prodeskSendNotification,
  prodeskGetSentNotifications,
  prodeskGetNotificationDetail,
} from "../../services/api";
import styles from "./ProdeskNotifications.module.css";

const { TextArea } = Input;
const { Option } = Select;

const ProdeskNotifications = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [therapists, setTherapists] = useState([]);
  const [therapistLoading, setTherapistLoading] = useState(false);
  const [target, setTarget] = useState("selected");
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const fetchBatches = async (page = 1) => {
    setLoading(true);
    try {
      const response = await prodeskGetSentNotifications({ page, limit: pagination.pageSize });
      if (response.status && response.data) {
        setBatches(response.data);
        setPagination({
          ...pagination,
          current: response.meta?.page || page,
          total: response.meta?.total || 0,
        });
      }
    } catch (error) {
      message.error("Failed to fetch sent notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchTherapists = async (search = "") => {
    setTherapistLoading(true);
    try {
      const response = await getProdeskTherapists({ search, limit: 50 });
      if (response.status && response.data) {
        setTherapists(response.data.therapists || []);
      }
    } catch (error) {
      message.error("Failed to fetch therapists");
    } finally {
      setTherapistLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleRowClick = async (record) => {
    setDetail(null);
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const response = await prodeskGetNotificationDetail(record.batch_id);
      if (response.status && response.data) {
        setDetail(response.data);
      } else {
        message.error(response.message || "Failed to fetch broadcast detail");
      }
    } catch (error) {
      message.error("Failed to fetch broadcast detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSend = async (values) => {
    try {
      setSubmitLoading(true);
      const payload = {
        title: values.title,
        content: values.content,
        is_popup: values.is_popup ? 1 : 0,
        target: values.target,
        user_ids: values.target === "selected" ? values.user_ids : undefined,
      };
      const response = await prodeskSendNotification(payload);
      if (response.status) {
        message.success(`Notification sent to ${response.data.sent_count} therapist(s)`);
        setDrawerVisible(false);
        form.resetFields();
        fetchBatches();
      } else {
        message.error(response.message || "Failed to send notification");
      }
    } catch (error) {
      message.error("Failed to send notification: " + (error.message || "Unknown error"));
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Content", dataIndex: "content", key: "content", ellipsis: true, width: "30%" },
    {
      title: "Popup",
      dataIndex: "is_popup",
      key: "is_popup",
      render: (v) => (v ? <Tag color="orange">Popup</Tag> : <Tag>Bell only</Tag>),
    },
    { title: "Recipients", dataIndex: "recipient_count", key: "recipient_count" },
    { title: "Read", dataIndex: "read_count", key: "read_count" },
    {
      title: "Sent At",
      dataIndex: "sent_at",
      key: "sent_at",
      render: (date) => (date ? dayjs(date).format("MMM D, YYYY hh:mm A") : "-"),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Prodesk Notifications</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            fetchTherapists().then(() => {
              form.resetFields();
              form.setFieldsValue({ target: "selected", is_popup: false });
              setTarget("selected");
              setDrawerVisible(true);
            });
          }}
        >
          Send Notification
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={batches}
        loading={loading}
        rowKey="batch_id"
        pagination={{
          ...pagination,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} broadcasts`,
        }}
        onChange={(p) => fetchBatches(p.current)}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
      />

      <Drawer
        title="Send Notification to Prodesk Users"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={480}
        destroyOnClose
        footer={
          <Space>
            <Button onClick={() => setDrawerVisible(false)} disabled={submitLoading}>
              Cancel
            </Button>
            <Button type="primary" loading={submitLoading} onClick={() => form.submit()}>
              Send
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSend}
          initialValues={{ target: "selected", is_popup: false }}
          className={styles.form}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter a title" }, { max: 150 }]}
          >
            <Input placeholder="Enter notification title" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: "Please enter content" }, { max: 1000 }]}
          >
            <TextArea rows={4} placeholder="Enter notification content" />
          </Form.Item>

          <Form.Item name="is_popup" label="Show as popup on login" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="target" label="Send To" rules={[{ required: true }]}>
            <Select onChange={(v) => setTarget(v)}>
              <Option value="selected">Selected Therapists</Option>
              <Option value="all">All Prodesk Users</Option>
            </Select>
          </Form.Item>

          {target === "selected" && (
            <Form.Item
              name="user_ids"
              label="Select Therapists"
              rules={[{ required: true, message: "Please select at least one therapist" }]}
            >
              <Select
                mode="multiple"
                showSearch
                placeholder="Search and select therapists"
                loading={therapistLoading}
                onSearch={fetchTherapists}
                filterOption={false}
                notFoundContent={therapistLoading ? <Spin size="small" /> : null}
              >
                {therapists.map((t) => (
                  <Option key={t.user_id} value={t.user_id}>
                    {t.name || `${t.first_name || ""} ${t.last_name || ""}`.trim()} ({t.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Drawer>

      <Drawer
        title="Broadcast Details"
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        width={480}
        destroyOnClose
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin />
          </div>
        ) : detail ? (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Title">{detail.title}</Descriptions.Item>
              <Descriptions.Item label="Content">{detail.content}</Descriptions.Item>
              <Descriptions.Item label="Popup">
                {detail.is_popup ? <Tag color="orange">Popup</Tag> : <Tag>Bell only</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Sent By">
                {detail.sender ? `${detail.sender.name} (${detail.sender.email})` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Sent At">
                {detail.sent_at ? dayjs(detail.sent_at).format("MMM D, YYYY hh:mm A") : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Recipients">{detail.recipients?.length || 0}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 20, fontWeight: 600 }}>Recipients</div>
            <List
              dataSource={detail.recipients || []}
              renderItem={(r) => (
                <List.Item
                  key={r.id}
                  actions={[
                    r.is_read ? <Tag color="green">Read</Tag> : <Tag>Unread</Tag>,
                    r.is_close ? <Tag color="blue">Closed</Tag> : <Tag>Open</Tag>,
                  ]}
                >
                  <List.Item.Meta title={r.name} description={r.email} />
                </List.Item>
              )}
            />
          </>
        ) : (
          <Empty description="No details found" />
        )}
      </Drawer>
    </div>
  );
};

export default ProdeskNotifications;
