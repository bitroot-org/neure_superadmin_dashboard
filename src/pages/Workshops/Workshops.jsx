import React, { useState, useEffect, useCallback } from "react";
import moment from "moment";
import {
  Tabs,
  Button,
  Table,
  Space,
  Drawer,
  Form,
  Input,
  Upload,
  Select,
  TimePicker,
  message,
  Modal,
  DatePicker,
  Tooltip,
  Dropdown,
  Menu,
} from "antd";
import {
  FilterOutlined,
  PlusOutlined,
  UploadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { DownOutlined } from "@ant-design/icons";
import debounce from "lodash/debounce";
import styles from "./Workshops.module.css";
import {
  deleteWorkshop,
  updateWorkshop,
  getAllWorkshops,
  createWorkshop,
  uploadWorkshopFiles,
  getAllWorkshopSchedules,
  scheduleWorkshop,
  getAllCompanies,
  rescheduleWorkshop,
  cancelWorkshopSchedule,
  updateWorkshopScheduleStatus,
} from "../../services/api";

const { TextArea } = Input;

const Workshops = () => {
  const [activeTab, setActiveTab] = useState("schedule");
  const [scheduleDrawerVisible, setScheduleDrawerVisible] = useState(false);
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [scheduleForm] = Form.useForm();
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 1,
    total: 0,
  });
  const [scheduleData, setScheduleData] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [viewDetailsDrawerVisible, setViewDetailsDrawerVisible] =
    useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [rescheduleForm] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [worksheetFile, setWorksheetFile] = useState(null);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [workshopSearchTerm, setWorkshopSearchTerm] = useState("");
  const [createWorkshopLoading, setCreateWorkshopLoading] = useState(false);
  const [scheduleWorkshopLoading, setScheduleWorkshopLoading] = useState(false);
  const [updateWorkshopLoading, setUpdateWorkshopLoading] = useState(false);
  const [rescheduleButtonLoading, setRescheduleButtonLoading] = useState(false);
  const [reschedulingId, setReschedulingId] = useState(null);

  // Create a debounced version of fetchWorkshopSchedules
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      fetchWorkshopSchedules(searchValue);
    }, 500),
    []
  );

  // Create a debounced version for workshop search
  const debouncedWorkshopSearch = useCallback(
    debounce((searchValue) => {
      console.log("Debounced workshop search with:", searchValue);
      fetchWorkshops(
        pagination.current,
        pagination.pageSize,
        dateRange,
        searchValue
      );
    }, 500),
    [pagination.current, pagination.pageSize, dateRange]
  );

  // Cleanup debounce on component unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
      debouncedWorkshopSearch.cancel();
    };
  }, [debouncedSearch, debouncedWorkshopSearch]);

  // Fetch workshops on component mount
  useEffect(() => {
    fetchWorkshops();
    fetchWorkshopSchedules();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setCompaniesLoading(true);
    try {
      const response = await getAllCompanies({ all: true });
      if (response.status && response.data) {
        setCompanies(response.data.companies || []);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      message.error("Failed to load companies");
    } finally {
      setCompaniesLoading(false);
    }
  };

  const fetchWorkshops = async (
    page = 1,
    limit = 10,
    dateFilter = dateRange,
    search = ""
  ) => {
    setLoading(true);
    try {
      const params = { page, limit };

      // Add date filters if they exist
      if (dateFilter && dateFilter[0] && dateFilter[1]) {
        params.start_date = dateFilter[0].format("YYYY-MM-DD");
        params.end_date = dateFilter[1].format("YYYY-MM-DD");
      }

      // Add search term if it exists
      if (search) {
        params.search_term = search;
      }

      const response = await getAllWorkshops(params);
      if (response.status && response.data) {
        setWorkshops(response.data.workshops || []);
        setPagination({
          current: response.data.pagination.currentPage,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total,
        });
      }
    } catch (error) {
      console.error("Error fetching workshops:", error);
      message.error("Failed to load workshops");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWorkshop = async (values) => {
    try {
      setUpdateWorkshopLoading(true); // Set button loading state to true
      
      // First update the basic workshop information
      const response = await updateWorkshop({
        id: editingWorkshop.id,
        title: values.title,
        description: values.description,
        agenda: values.agenda || "",
      });

      // If files were selected, upload them
      if (coverImageFile || worksheetFile) {
        await uploadWorkshopFiles(
          editingWorkshop.id,
          coverImageFile,
          worksheetFile
        );
      }

      message.success("Workshop updated successfully");
      setEditDrawerVisible(false);
      fetchWorkshops();

      // Reset the states
      setCoverImageFile(null);
      setWorksheetFile(null);
      setEditingWorkshop(null);
      form.resetFields();
    } catch (error) {
      message.error("Failed to update workshop");
    } finally {
      setUpdateWorkshopLoading(false); // Reset button loading state
    }
  };

  const handleDeleteWorkshop = (workshopId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this workshop?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteWorkshop({ id: workshopId });
          message.success("Workshop deleted successfully");
          fetchWorkshops(pagination.current, pagination.pageSize);
        } catch (error) {
          console.error("Error deleting workshop:", error);
          message.error("Failed to delete workshop");
        }
      },
    });
  };

  const handleEditWorkshop = (workshop) => {
    console.log("Workshop data:", workshop); // Debug log to see the data structure
    setEditingWorkshop(workshop);
    editForm.setFieldsValue({
      title: workshop.title,
      description: workshop.description,
      host_name: workshop.host_name || workshop.organizer, // Try both fields
      agenda: workshop.agenda || "",
    });
    setEditDrawerVisible(true);
  };

  const handleTableChange = (newPagination) => {
    fetchWorkshops(
      newPagination.current,
      newPagination.pageSize,
      dateRange,
      workshopSearchTerm
    );
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (activeTab === "schedule") {
      fetchWorkshopSchedules(dates);
    } else {
      fetchWorkshops(pagination.current, pagination.pageSize, dates);
    }
  };

  const handleCreateWorkshop = async (values) => {
    try {
      setCreateWorkshopLoading(true); // Set button loading state to true
      
      // First create the workshop
      const payload = {
        title: values.title,
        description: values.description,
        agenda: values.agenda || "",
      };

      const response = await createWorkshop(payload);

      if (response.status && response.data) {
        const workshopId = response.data.id;

        // Then upload files if they exist
        if (coverImage || worksheetFile) {
          await uploadWorkshopFiles(workshopId, coverImage, worksheetFile);
        }

        message.success("Workshop created successfully");
        setCreateDrawerVisible(false);
        form.resetFields();
        fetchWorkshops(); // Refresh the list

        // Reset file states
        setCoverImage(null);
        setWorksheetFile(null);
      }
    } catch (error) {
      console.error("Error creating workshop:", error);
      message.error("Failed to create workshop");
    } finally {
      setCreateWorkshopLoading(false); // Reset button loading state
    }
  };

  const handleCreateClick = () => {
    if (activeTab === "schedule") {
      // Fetch all workshops without date filters when opening schedule drawer
      fetchWorkshops(1, 10, null);
      setScheduleDrawerVisible(true);
    } else {
      setCreateDrawerVisible(true);
    }
  };

  const handleRescheduleWorkshop = (schedule) => {
    setSelectedSchedule(schedule);
    setReschedulingId(schedule.id);
    rescheduleForm.setFieldsValue({
      date: null,
      time: null,
    });
    setRescheduleModalVisible(true);
  };

  const handleRescheduleSubmit = async (values) => {
    try {
      setRescheduleButtonLoading(true); // Set loading state to true
      const scheduleId = selectedSchedule.id;
      const newStartTime = `${values.date.format(
        "YYYY-MM-DD"
      )} ${values.startTime.format("HH:mm:ss")}`;
      const newEndTime = `${values.date.format(
        "YYYY-MM-DD"
      )} ${values.endTime.format("HH:mm:ss")}`;

      const response = await rescheduleWorkshop(
        scheduleId,
        newStartTime,
        newEndTime
      );

      if (response.status) {
        message.success("Workshop rescheduled successfully");
        setRescheduleModalVisible(false);
        fetchWorkshopSchedules();
      }
    } catch (error) {
      console.error("Error rescheduling workshop:", error);
      message.error("Failed to reschedule workshop");
    } finally {
      setRescheduleButtonLoading(false); // Reset loading state
      setReschedulingId(null);
    }
  };

  const handleWorkshopStatusUpdate = (scheduleId, status) => {
    const statusMessages = {
      completed: "Mark as completed",
      cancelled: "Cancel",
      pending: "Mark as pending",
      "in-progress": "Mark as in-progress",
    };

    Modal.confirm({
      title: `Are you sure you want to ${statusMessages[status]} this workshop?`,
      content: status === "cancelled" ? "This action cannot be undone." : "",
      okText: `Yes, ${statusMessages[status]}`,
      okType: status === "cancelled" ? "danger" : "primary",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await updateWorkshopScheduleStatus({
            schedule_id: scheduleId,
            status: status,
          });

          if (response.status) {
            message.success(
              `Workshop ${
                status === "cancelled" ? "cancelled" : "status updated"
              } successfully`
            );
            fetchWorkshopSchedules();
          }
        } catch (error) {
          console.error(`Error updating workshop status to ${status}:`, error);
          message.error(`Failed to update workshop status`);
        }
      },
    });
  };

  const handleScheduleSubmit = async (values) => {
    try {
      setScheduleWorkshopLoading(true); // Set button loading state to true
      
      const payload = {
        workshop_id: values.workshop_template,
        company_id: values.company,
        host_name: values.host_name,
        date: values.date.format("YYYY-MM-DD"),
        time: values.time.format("HH:mm:ss"),
        duration_minutes: parseInt(values.duration),
      };

      const response = await scheduleWorkshop(payload);

      if (response.status) {
        message.success("Workshop scheduled successfully");
        setScheduleDrawerVisible(false);
        scheduleForm.resetFields();
        fetchWorkshopSchedules(); // Refresh the schedules list
      }
    } catch (error) {
      console.error("Error scheduling workshop:", error);
      message.error("Failed to schedule workshop");
    } finally {
      setScheduleWorkshopLoading(false); // Reset button loading state
    }
  };

  const handleViewDetails = (schedule) => {
    console.log("Opening details drawer for schedule:", schedule);
    setSelectedSchedule(schedule);
    setViewDetailsDrawerVisible(true);
  };

  const handleWorkshopClick = (record) => {
    console.log("Opening details drawer for workshop:", record);
    setSelectedWorkshop(record);
    setDetailsDrawerVisible(true);
  };

  // Add this new function to fetch workshop schedules
  const fetchWorkshopSchedules = async (search = searchTerm) => {
    setScheduleLoading(true);
    try {
      const params = {
        page: 1,
        limit: 10,
      };

      // Add search term to params if it exists
      if (search) {
        params.search_term = search;
      }

      const response = await getAllWorkshopSchedules(params);
      if (response.status && response.data) {
        // Transform the data to match the table columns
        const formattedData = response.data.map((schedule) => {
          // Format date as "11 JAN 25"
          const scheduleDate = new Date(schedule.schedule_date);
          const formattedDate = `${scheduleDate.getDate()} ${scheduleDate.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${String(scheduleDate.getFullYear()).slice(2)}`;
          
          // Format time as "01:11 PM"
          const startTime = new Date(schedule.start_time);
          const formattedTime = startTime.toLocaleString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
          });
          
          return {
            key: schedule.session_id,
            id: schedule.session_id,
            workshop: schedule.workshop_title,
            company: schedule.company_name,
            host_name: schedule.host_name || "Not specified",
            date: formattedDate,
            time: formattedTime,
            worksheet: schedule.pdf_url ? "Available" : "Not available",
            dateAdded: formattedDate, // Using same format for dateAdded
            pdf_url: schedule.pdf_url,
            status: schedule.status || "pending",
            description: schedule.description || "",
          };
        });
        setScheduleData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching workshop schedules:", error);
      message.error("Failed to load workshop schedules");
    } finally {
      setScheduleLoading(false);
    }
  };

  // Handle search input change with debounce
  const handleSearch = (value) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Add this function to handle workshop search input changes
  const handleWorkshopSearch = (value) => {
    setWorkshopSearchTerm(value);
    debouncedWorkshopSearch(value);
  };

  const scheduleColumns = [
    {
      title: "Workshop",
      dataIndex: "workshop",
      key: "workshop",
      width: 200,
      ellipsis: true,
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Host",
      dataIndex: "host_name",
      key: "host_name",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Schedule Date",
      dataIndex: "date",
      key: "date",
      width: 120,
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      width: 120,
    },
    {
      title: "Worksheet",
      dataIndex: "worksheet",
      key: "worksheet",
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click event
              handleRescheduleWorkshop(record);
            }}
            loading={rescheduleButtonLoading && reschedulingId === record.id}
            // disabled={record.status === 'completed' || record.status === 'cancelled'}
          >
            Reschedule
          </Button>
          <Button
            type="primary"
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click event
              handleWorkshopStatusUpdate(record.id, "completed");
            }}
            disabled={
              record.status === "completed" || record.status === "cancelled"
            }
          >
            Mark as Completed
          </Button>
          <Button
            type="primary"
            danger
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click event
              handleWorkshopStatusUpdate(record.id, "cancelled");
            }}
            disabled={
              record.status === "completed" || record.status === "cancelled"
            }
          >
            Cancel
          </Button>
        </Space>
      ),
    },
  ];

  const workshopsColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 300,
      ellipsis: true,
      render: (description) => (
        <Tooltip placement="topLeft" title={description}>
          <div
            style={{
              maxWidth: 300,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {description}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Image",
      dataIndex: "poster_image",
      key: "poster_image",
      width: 100,
      render: (image) => (
        <img
          src={image || "/placeholder-image.png"}
          alt="Workshop"
          style={{ width: 50, height: 50, objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Date Added",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            onClick={(e) => {
              e.stopPropagation();
              console.log("Edit button clicked"); // Debug log
              handleEditWorkshop(record);
            }}
            icon={<EditOutlined />}
            style={{ color: "#1890ff" }}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              console.log("Delete button clicked"); // Debug log
              handleDeleteWorkshop(record.id);
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const items = [
    {
      key: "schedule",
      label: "Schedule workshop",
    },
    {
      key: "workshops",
      label: "Workshops",
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
        {activeTab === "schedule" ? (
          <Input
            placeholder="Search workshop schedules..."
            allowClear
            prefix={<SearchOutlined />}
            className={styles.searchBar}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            disabled={scheduleLoading}
          />
        ) : (
          <Input
            placeholder="Search workshops..."
            allowClear
            prefix={<SearchOutlined />}
            className={styles.searchBar}
            value={workshopSearchTerm}
            onChange={(e) => handleWorkshopSearch(e.target.value)}
            style={{ width: 300 }}
          />
        )}
        <Space>
          {/* <Button icon={<FilterOutlined />}>Filter</Button> */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateClick}
          >
            {activeTab === "schedule" ? "Create schedule" : "Create workshop"}
          </Button>
        </Space>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={
            activeTab === "schedule" ? scheduleColumns : workshopsColumns
          }
          dataSource={activeTab === "schedule" ? scheduleData : workshops}
          rowKey="id"
          loading={activeTab === "schedule" ? scheduleLoading : loading}
          pagination={
            activeTab === "workshops"
              ? pagination
              : {
                  pageSize: 10,
                  showSizeChanger: false,
                }
          }
          onChange={activeTab === "workshops" ? handleTableChange : undefined}
          scroll={{ x: 1400}}
          onRow={(record) => ({
            onClick: () => {
              if (activeTab === "workshops") {
                handleWorkshopClick(record);
              } else if (activeTab === "schedule") {
                handleViewDetails(record);
              }
            },
            style: {
              cursor: "pointer",
            },
          })}
        />
      </div>

      {/* Existing create workshop drawer */}
      <Drawer
        title={
          <Space>
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
          className={styles.fullWidthForm}
        >
          <div className={styles.uploadSection}>
            <Upload.Dragger
              name="coverImage"
              multiple={false}
              beforeUpload={(file) => {
                // Validate file type
                const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
                if (!isJpgOrPng) {
                  message.error('You can only upload JPG/PNG files!');
                  return Upload.LIST_IGNORE;
                }
                // Validate file size (5MB max)
                const isLt5M = file.size / 1024 / 1024 < 10;
                if (!isLt5M) {
                  message.error('Image must be smaller than 10MB!');
                  return Upload.LIST_IGNORE;
                }
                setCoverImage(file);
                return false; // Prevent auto upload
              }}
              onRemove={() => setCoverImage(null)}
              fileList={coverImage ? [coverImage] : []}
              accept=".jpg,.jpeg,.png"
            >
              <p className="ant-upload-drag-icon">
                <img
                  src="/placeholder-image.png"
                  alt="Upload"
                  style={{ width: 100, height: 100 }}
                />
              </p>
              <p className="ant-upload-text">
                Click or drag file to upload cover image
              </p>
            </Upload.Dragger>
          </div>

          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: "Please enter title" },
              { max: 100, message: "Title cannot exceed 100 characters" }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter description" },
              { max: 500, message: "Description cannot exceed 500 characters" }
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="agenda"
            label="Agenda"
            rules={[
              { max: 1000, message: "Agenda cannot exceed 1000 characters" }
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item name="worksheet" label="Worksheet">
            <Upload
              beforeUpload={(file) => {
                // Validate file type
                const isPDF = file.type === 'application/pdf';
                if (!isPDF) {
                  message.error('You can only upload PDF files!');
                  return Upload.LIST_IGNORE;
                }
                // Validate file size (10MB max)
                const isLt10M = file.size / 1024 / 1024 < 20;
                if (!isLt10M) {
                  message.error('File must be smaller than 20MB!');
                  return Upload.LIST_IGNORE;
                }
                setWorksheetFile(file);
                return false; // Prevent auto upload
              }}
              onRemove={() => setWorksheetFile(null)}
              fileList={worksheetFile ? [worksheetFile] : []}
              accept=".pdf"
            >
              <Button icon={<UploadOutlined />}>Upload PDF worksheet</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createWorkshopLoading}
              disabled={createWorkshopLoading}
              className={styles.submitButton}
            >
              Create
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Edit Workshop Drawer */}
      <Drawer
        title={
          <Space>
            Edit Workshop
          </Space>
        }
        open={editDrawerVisible}
        onClose={() => {
          setEditDrawerVisible(false);
          setEditingWorkshop(null);
          setCoverImageFile(null);
          setWorksheetFile(null);
          editForm.resetFields();
        }}
        width={720}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateWorkshop}>
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: "Please enter workshop title" },
              { max: 100, message: "Title cannot exceed 100 characters" }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter workshop description" },
              { max: 500, message: "Description cannot exceed 500 characters" }
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="agenda"
            label="Agenda"
            rules={[
              { max: 1000, message: "Agenda cannot exceed 1000 characters" }
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>

          {/* Cover image upload */}
          <Form.Item
            label="Cover Image"
            extra="Supported formats: JPG, PNG. Max size: 5MB"
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={(file) => {
                const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
                if (!isJpgOrPng) {
                  message.error('You can only upload JPG/PNG files!');
                  return false;
                }

                const isLt5M = file.size / 1024 / 1024 < 10;
                if (!isLt5M) {
                  message.error('Image must be smaller than 10MB!');
                  return false;
                }

                setCoverImageFile(file);
                return false;
              }}
              onRemove={() => setCoverImageFile(null)}
              fileList={coverImageFile ? [coverImageFile] : []}
              accept=".jpg,.jpeg,.png"
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>
                  {editingWorkshop?.poster_image ? 'Replace image' : 'Upload'}
                </div>
              </div>
            </Upload>
            {editingWorkshop?.poster_image && !coverImageFile && (
              <div style={{ marginTop: 8 }}>
                <img 
                  src={editingWorkshop.poster_image} 
                  alt="Current cover" 
                  style={{ width: 100, height: 100, objectFit: 'cover' }} 
                />
              </div>
            )}
          </Form.Item>

          <Form.Item
            label="Worksheet"
            extra="Supported format: PDF. Max size: 10MB"
          >
            <Upload
              maxCount={1}
              beforeUpload={(file) => {
                const isPdf = file.type === 'application/pdf';
                if (!isPdf) {
                  message.error("You can only upload PDF files!");
                  return false;
                }

                const isLt10M = file.size / 1024 / 1024 < 20;
                if (!isLt10M) {
                  message.error("PDF must be smaller than 20MB!");
                  return false;
                }

                setWorksheetFile(file);
                return false;
              }}
              onRemove={() => setWorksheetFile(null)}
              fileList={worksheetFile ? [worksheetFile] : []}
              accept=".pdf"
            >
              <Button icon={<UploadOutlined />}>
                {editingWorkshop?.pdf_url
                  ? "Replace worksheet"
                  : "Upload worksheet"}
              </Button>
            </Upload>
            {editingWorkshop?.pdf_url && !worksheetFile && (
              <div style={{ marginTop: 8 }}>
                <a
                  href={editingWorkshop.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View current worksheet
                </a>
              </div>
            )}
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
              loading={updateWorkshopLoading}
              disabled={updateWorkshopLoading}
            >
              Update Workshop
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Replace the <ScheduleDrawer /> at the bottom with this drawer */}
      <Drawer
        title={
          <Space>
            Create schedule
          </Space>
        }
        width={720}
        onClose={() => setScheduleDrawerVisible(false)}
        open={scheduleDrawerVisible}
      >
        <Form
          form={scheduleForm}
          layout="vertical"
          onFinish={handleScheduleSubmit}
          className={styles.fullWidthForm}
        >
          <Form.Item
            name="company"
            label="Select company"
            rules={[{ required: true, message: "Please select a company" }]}
          >
            <Select placeholder="Select company" loading={companiesLoading}>
              {companies.map((company) => (
                <Select.Option key={company.id} value={company.id}>
                  {company.company_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="workshop_template"
            label="Select workshop template"
            rules={[{ required: true, message: "Please select a workshop" }]}
          >
            <Select
              placeholder="Select workshop"
              onChange={(value, option) => setSelectedWorkshop(option)}
              loading={loading}
            >
              {workshops.map((workshop) => (
                <Select.Option
                  key={workshop.id}
                  value={workshop.id}
                  workshop={workshop}
                >
                  {workshop.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="host_name"
            label="Host name"
            rules={[
              { required: true, message: "Please enter host name" },
              { max: 100, message: "Host name cannot exceed 100 characters" },
              { 
                pattern: /^[a-zA-Z\s.-]+$/, 
                message: "Host name can only contain letters, spaces, dots and hyphens" 
              }
            ]}
          >
            <Input placeholder="Enter host name" />
          </Form.Item>

          <div className={styles.dateTimeContainer}>
            <Form.Item
              name="date"
              label="Date"
              rules={[
                { required: true, message: "Please select date" },
                {
                  validator: (_, value) => {
                    if (value && value.isBefore(moment().startOf('day'))) {
                      return Promise.reject("Cannot schedule workshop for past dates");
                    }
                    return Promise.resolve();
                  }
                }
              ]}
              style={{ flex: 1 }}
            >
              <DatePicker 
                style={{ width: "100%" }} 
                disabledDate={(current) => current && current < moment().startOf('day')}
              />
            </Form.Item>

            <Form.Item
              name="time"
              label="Time"
              rules={[{ required: true, message: "Please select time" }]}
              style={{ flex: 1 }}
            >
              <TimePicker style={{ width: "100%" }} format="HH:mm" />
            </Form.Item>
          </div>

          <Form.Item
            name="duration"
            label="Duration"
            rules={[
              { required: true, message: "Please enter duration" },
              { 
                pattern: /^[0-9]+$/, 
                message: "Duration must be a number" 
              },
              {
                validator: (_, value) => {
                  if (value && (parseInt(value) < 15 || parseInt(value) > 480)) {
                    return Promise.reject("Duration must be between 15 and 480 minutes");
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input
              type="number"
              min={15}
              max={480}
              addonAfter="minutes"
              placeholder="Enter duration in minutes"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.submitButton}
              loading={scheduleWorkshopLoading}
              disabled={scheduleWorkshopLoading}
            >
              Confirm
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Add this at the end of the return statement, after the other drawers */}
      {/* Update the view details drawer */}
      <Drawer
        title={
          <Space>
            Workshop Schedule Details
          </Space>
        }
        width={720}
        onClose={() => setViewDetailsDrawerVisible(false)}
        open={viewDetailsDrawerVisible}
      >
        {selectedSchedule && (
          <div className={styles.detailsContainer}>
            <div className={styles.detailItem}>
              <h3>Workshop</h3>
              <p>{selectedSchedule.workshop}</p>
            </div>

            <div className={styles.detailItem}>
              <h3>Company</h3>
              <p>{selectedSchedule.company}</p>
            </div>

            <div className={styles.detailItem}>
              <h3>Date</h3>
              <p>{selectedSchedule.date}</p>
            </div>

            <div className={styles.detailItem}>
              <h3>Time</h3>
              <p>{selectedSchedule.time}</p>
            </div>

            <div className={styles.detailItem}>
              <h3>Date Added</h3>
              <p>{selectedSchedule.dateAdded}</p>
            </div>

            <div className={styles.detailItem}>
              <h3>Worksheet</h3>
              {selectedSchedule.pdf_url ? (
                <a
                  href={selectedSchedule.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.pdfLink}
                >
                  <Button type="primary">View PDF</Button>
                </a>
              ) : (
                <p>No worksheet available</p>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Update the reschedule modal */}
      <Modal
        title="Reschedule Workshop"
        open={rescheduleModalVisible}
        onCancel={() => setRescheduleModalVisible(false)}
        footer={null}
      >
        <Form
          form={rescheduleForm}
          layout="vertical"
          onFinish={handleRescheduleSubmit}
        >
          <Form.Item
            name="date"
            label="New Date"
            rules={[{ required: true, message: "Please select a new date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="startTime"
            label="Start Time"
            rules={[{ required: true, message: "Please select a start time" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="endTime"
            label="End Time"
            rules={[{ required: true, message: "Please select an end time" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item>
            <div className={styles.modalButtons}>
              <Button onClick={() => setRescheduleModalVisible(false)}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={rescheduleButtonLoading}
                disabled={rescheduleButtonLoading}
              >
                Reschedule
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add this new Details Drawer component after your other drawers */}
      <Drawer
        title={
          <Space>
            Workshop Details
          </Space>
        }
        width={720}
        onClose={() => setDetailsDrawerVisible(false)}
        open={detailsDrawerVisible}
        destroyOnClose
      >
        {selectedWorkshop && (
          <div className={styles.detailsContainer}>
            <div className={styles.imageContainer}>
              <img
                src={selectedWorkshop.poster_image || "/placeholder-image.png"}
                alt={selectedWorkshop.title}
                style={{
                  width: "100%",
                  maxHeight: 300,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            </div>

            <div className={styles.detailItem}>
              <h3>Title</h3>
              <p>{selectedWorkshop.title}</p>
            </div>

            <div className={styles.detailItem}>
              <h3>Host</h3>
              <p>{selectedWorkshop.host_name || selectedWorkshop.organizer}</p>
            </div>

            <div className={styles.detailItem}>
              <h3>Description</h3>
              <p>{selectedWorkshop.description}</p>
            </div>

            <div className={styles.detailItem}>
              <h3>Agenda</h3>
              <p>{selectedWorkshop.agenda || "No agenda available"}</p>
            </div>

            <div className={styles.detailItem}>
              <h3>Date Added</h3>
              <p>
                {new Date(selectedWorkshop.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className={styles.actionButtons}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setDetailsDrawerVisible(false);
                  handleEditWorkshop(selectedWorkshop);
                }}
              >
                Edit Workshop
              </Button>
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setDetailsDrawerVisible(false);
                  handleDelete(selectedWorkshop.id);
                }}
              >
                Delete Workshop
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Workshops;
