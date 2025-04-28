import React, { useState, useEffect } from "react";
import {
  Table,
  DatePicker,
  Select,
  Space,
  Typography,
  Tag,
  message,
  Drawer,
  Descriptions,
  Divider,
} from "antd";
import dayjs from "dayjs";
import { getFeedback } from "../../services/api";
import styles from "./Feedback.module.css";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [dateRange, setDateRange] = useState(null);
  const [feedbackType, setFeedbackType] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const fetchFeedback = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params = { page, limit };

      // Add feedback type filter if selected
      if (feedbackType) {
        params.feedback_type = feedbackType;
      }

      // Add date filters if they exist
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.start_date = dateRange[0].format("YYYY-MM-DD");
        params.end_date = dateRange[1].format("YYYY-MM-DD");
      }

      const response = await getFeedback(params);
      if (response.status && response.data) {
        setFeedback(response.data.feedbacks || []);
        setPagination({
          current: response.data.pagination.currentPage,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total,
        });
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      message.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);

    // Create params with the new date range
    const params = { page: 1, limit: pagination.pageSize };

    // Add feedback type filter if selected
    if (feedbackType) {
      params.feedback_type = feedbackType;
    }

    // Add the new date filters directly
    if (dates && dates[0] && dates[1]) {
      params.start_date = dates[0].format("YYYY-MM-DD");
      params.end_date = dates[1].format("YYYY-MM-DD");
    }

    // Fetch with the updated params
    fetchFeedbackWithParams(params);
  };

  const handleFeedbackTypeChange = (value) => {
    setFeedbackType(value);

    // Create params with the new feedback type
    const params = { page: 1, limit: pagination.pageSize };

    // Add the new feedback type directly
    if (value) {
      params.feedback_type = value;
    }

    // Add date filters if they exist
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.start_date = dateRange[0].format("YYYY-MM-DD");
      params.end_date = dateRange[1].format("YYYY-MM-DD");
    }

    // Fetch with the updated params
    fetchFeedbackWithParams(params);
  };

  // Helper function to fetch feedback with given params
  const fetchFeedbackWithParams = async (params) => {
    setLoading(true);
    try {
      const response = await getFeedback(params);
      if (response.status && response.data) {
        setFeedback(response.data.feedbacks || []);
        setPagination({
          current: response.data.pagination.currentPage,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total,
        });
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      message.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (paginationParams) => {
    // Create params with the pagination values
    const params = {
      page: paginationParams.current,
      limit: paginationParams.pageSize
    };

    // Add feedback type filter if selected
    if (feedbackType) {
      params.feedback_type = feedbackType;
    }

    // Add date filters if they exist
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.start_date = dateRange[0].format("YYYY-MM-DD");
      params.end_date = dateRange[1].format("YYYY-MM-DD");
    }

    // Fetch with the updated params
    fetchFeedbackWithParams(params);
  };

  const handleRowClick = (record) => {
    setSelectedFeedback(record);
    setDrawerVisible(true);
  };

  const getFeedbackTypeColor = (type) => {
    switch (type) {
      case "bug":
        return "red";
      case "suggestion":
        return "blue";
      default:
        return "green";
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Company",
      dataIndex: "company_name",
      key: "company_name",
    },
    {
      title: "Feedback Type",
      dataIndex: "feedback_type",
      key: "feedback_type",
      render: (type) => (
        <Tag color={getFeedbackTypeColor(type)}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "feedback_description",
      key: "feedback_description",
      ellipsis: true,
      width: 300,
      render: (text) => (
        <div className={styles.truncatedDescription}>
          {text}
        </div>
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => dayjs(date).format("MMMM D, YYYY"),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2} className={styles.pageTitle}>
          Feedback
        </Title>
      </div>

      <div className={styles.actionBar}>
        <div className={styles.filterContainer}>
          <RangePicker
            className={styles.datePicker}
            onChange={handleDateRangeChange}
            placeholder={["Start Date", "End Date"]}
          />
          <Select
            className={styles.typeSelect}
            placeholder="Select Feedback Type"
            allowClear
            onChange={handleFeedbackTypeChange}
          >
            <Option value="bug">Bug</Option>
            <Option value="suggestion">Suggestion</Option>
            <Option value="other">Other</Option>
          </Select>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          dataSource={feedback}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} feedback items`,
          }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' }
          })}
        />
      </div>

      {/* Feedback Detail Drawer */}
      <Drawer
        title="Feedback Details"
        placement="right"
        width={520}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedFeedback && (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="ID">{selectedFeedback.id}</Descriptions.Item>
              <Descriptions.Item label="Company">{selectedFeedback.company_name}</Descriptions.Item>
              <Descriptions.Item label="Feedback Type">
                <Tag color={getFeedbackTypeColor(selectedFeedback.feedback_type)}>
                  {selectedFeedback.feedback_type.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {dayjs(selectedFeedback.created_at).format("MMMM D, YYYY")}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Description</Divider>
            <div className={styles.feedbackDescription}>
              {selectedFeedback.feedback_description}
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default Feedback;
