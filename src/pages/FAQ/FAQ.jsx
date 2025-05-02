import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Drawer,
  Form,
  Input,
  message,
  Typography,
  Modal,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import styles from "./FAQ.module.css";
import { getQnA, createQnA, updateQnA, deleteQnA } from "../../services/api";

const { Title } = Typography;
const { TextArea } = Input;

const FAQ = () => {
  const [faqItems, setFaqItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const response = await getQnA();
      if (response.status && response.data) {
        setFaqItems(response.data);
      }
    } catch (error) {
      console.error("Error fetching FAQ items:", error);
      message.error("Failed to load FAQ items");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (values) => {
    try {
      if (editingItem) {
        // Update existing FAQ
        const payload = {
          id: editingItem.id,
          question: values.question,
          answer: values.answer,
        };
        await updateQnA(payload);
        message.success("FAQ updated successfully");
      } else {
        // Create new FAQ
        const payload = {
          question: values.question,
          answer: values.answer,
        };
        await createQnA(payload);
        message.success("FAQ created successfully");
      }
      setDrawerVisible(false);
      form.resetFields();
      fetchFAQs();
    } catch (error) {
      console.error("Error saving FAQ:", error);
      message.error("Failed to save FAQ");
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this FAQ?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteQnA(id);
          message.success("FAQ deleted successfully");
          fetchFAQs();
        } catch (error) {
          console.error("Error deleting FAQ:", error);
          message.error("Failed to delete FAQ");
        }
      },
    });
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue({
      question: record.question,
      answer: record.answer,
    });
    setDrawerVisible(true);
  };

  const columns = [
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
      width: "30%",
    },
    {
      title: "Answer",
      dataIndex: "answer",
      key: "answer",
      width: "50%",
      render: (text) => (
        <div className={styles.answerCell}>
          {text.length > 150 ? `${text.substring(0, 150)}...` : text}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "20%",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
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
        <Title level={2} className={styles.pageTitle}>
          Frequently Asked Questions
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setDrawerVisible(true);
          }}
        >
          Add FAQ
        </Button>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          dataSource={faqItems}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} FAQ items`,
          }}
          scroll={{ x: "max-content" }}
        />
      </div>

      <Drawer
        title={editingItem ? "Edit FAQ" : "Add New FAQ"}
        width={520}
        onClose={() => {
          setDrawerVisible(false);
          setEditingItem(null);
          form.resetFields();
        }}
        open={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div className={styles.drawerFooter}>
            <Button
              onClick={() => {
                setDrawerVisible(false);
                setEditingItem(null);
                form.resetFields();
              }}
              className={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button type="primary" onClick={() => form.submit()}>
              {editingItem ? "Update" : "Create"}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdate}
          initialValues={editingItem || {}}
          className={styles.faqForm}
        >
          <Form.Item
            name="question"
            label="Question"
            rules={[{ required: true, message: "Please enter the question" }]}
          >
            <Input placeholder="Enter question" />
          </Form.Item>
          <Form.Item
            name="answer"
            label="Answer"
            rules={[{ required: true, message: "Please enter the answer" }]}
          >
            <TextArea
              placeholder="Enter answer"
              autoSize={{ minRows: 4, maxRows: 8 }}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default FAQ;
