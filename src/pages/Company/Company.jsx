// src/components/ManageCompanies.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Input,
  DatePicker,
  Space,
  Drawer,
  Descriptions,
  Form,
  Button,
  Select,
  message,
  Tag,
  List,
  Typography,
  Modal, // Add Modal import
} from "antd";
import {
  getAllCompanies,
  getDepartments,
  createCompany,
  getGalleryItems,
  assignResourcesToCompany,
} from "../../services/api";
import {
  SearchOutlined,
  PlusOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  PaperClipOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import moment from "moment";
import styles from "./Company.module.css";
import debounce from "lodash/debounce";

const { RangePicker } = DatePicker;

const Company = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [form] = Form.useForm();
  const [resourceDrawerVisible, setResourceDrawerVisible] = useState(false);
  const [resources, setResources] = useState([]);
  const [selectedResources, setSelectedResources] = useState([]);
  const [resourceForm] = Form.useForm();
  const [resourceType, setResourceType] = useState("image");
  const [previewResources, setPreviewResources] = useState([]);

  const navigate = useNavigate();

  // Add new state for analytics modal
  const [analyticsModalVisible, setAnalyticsModalVisible] = useState(false);
  const [companyAnalytics, setCompanyAnalytics] = useState(null);

  const handleCreateDrawerOpen = async () => {
    try {
      const response = await getDepartments();
      setDepartments(response.data || []);
      setCreateDrawerVisible(true);
    } catch (error) {
      console.error("Error fetching departments:", error);
      message.error("Failed to load departments");
    }
  };

  const fetchCompanies = async (search = "") => {
    setLoading(true);
    try {
      const params = {};
      if (search) {
        params.search = search;
      }
      const response = await getAllCompanies(params);
      setCompanies(response.data.companies);
    } catch (error) {
      console.error("Error fetching company data:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      fetchCompanies(searchValue);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const onRowClick = (record) => {
    return {
      onClick: () => {
        setSelectedCompany(record);
        setDrawerVisible(true);
      },
      style: { cursor: "pointer" },
    };
  };

  const handleCreateCompany = async (values) => {
    try {
      setLoading(true);

      // Transform the industry values (department names) to department IDs
      const departmentIds = values.industry
        .map((deptName) => {
          const dept = departments.find((d) => d.department_name === deptName);
          return dept ? dept.id : null;
        })
        .filter((id) => id !== null);

      const payload = {
        company_name: values.company_name,
        company_size: values.company_size.toString(),
        department_ids: departmentIds,
        contact_person_info: {
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone,
        },
      };

      const response = await createCompany(payload);

      if (response.status) {
        message.success("Company created successfully");
        setCreateDrawerVisible(false);
        form.resetFields();
        // Refresh the companies list
        fetchCompanies();
      } else {
        message.error(response.message || "Failed to create company");
      }
    } catch (error) {
      console.error("Error creating company:", error);
      message.error(
        "Failed to create company: " + (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async (type = "image") => {
    try {
      const response = await getGalleryItems({
        type,
        companyId: selectedCompany?.id,
        showUnassigned: true,
      });
      // Update to access the items array from the response
      setResources(response.data.items || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
      message.error("Failed to load resources");
    }
  };

  const handleAssignResources = () => {
    fetchResources(resourceType);
    setResourceDrawerVisible(true);
  };

  const handleResourceTypeChange = (type) => {
    setResourceType(type);
    fetchResources(type);
    // Clear selected resources when type changes
    resourceForm.setFieldsValue({ resources: [] });
    setPreviewResources([]);
  };

  const handleResourceSubmit = async (values) => {
    try {
      setLoading(true);

      const response = await assignResourcesToCompany({
        company_id: selectedCompany.id,
        resource_ids: values.resources,
      });

      if (response.status) {
        message.success("Resources assigned successfully");
        setResourceDrawerVisible(false);
        resourceForm.resetFields();
      } else {
        message.error(response.message || "Failed to assign resources");
      }
    } catch (error) {
      console.error("Error assigning resources:", error);
      message.error(
        "Failed to assign resources: " + (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResourceSelectionChange = (selectedIds) => {
    const selected = resources.filter((resource) =>
      selectedIds.includes(resource.id)
    );
    setPreviewResources(selected);
  };

  const handleViewAnalytics = (company) => {
    navigate(`/companies/${company.id}/analytics`);
  };
  
  const columns = [
    {
      title: "Company Name",
      dataIndex: "company_name",
      key: "company_name",
    },
    {
      title: "Contact Person",
      key: "contact_person_name",
      render: (_, record) => {
        if (record.contact_person_info) {
          return `${record.contact_person_info.first_name} ${record.contact_person_info.last_name}`;
        }
        return "-";
      },
    },
    {
      title: "Contact Email",
      key: "contact_person_email",
      render: (_, record) => {
        if (record.contact_person_info) {
          return record.contact_person_info.email;
        }
        return "-";
      },
    },
    {
      title: "Contact Number",
      key: "contact_person_phone",
      render: (_, record) => {
        if (record.contact_person_info) {
          return record.contact_person_info.phone;
        }
        return "-";
      },
    },
    {
      title: "Onboarding Date",
      dataIndex: "onboarding_date",
      key: "onboarding_date",
      render: (date) => new Date(date).toLocaleDateString(),
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
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
      title: "Status",
      dataIndex: "active",
      key: "active",
      filters: [
        { text: "Active", value: 1 },
        { text: "Inactive", value: 0 },
      ],
      onFilter: (value, record) => record.active === value,
      render: (status) => {
        const isActive = status === 1;
        return (
          <span
            className={`${styles.statusBadge} ${
              isActive ? styles.active : styles.inactive
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      title: "Company Size",
      dataIndex: "company_size",
      key: "company_size",
      filters: [
        { text: "1-100", value: "100" },
        { text: "101-200", value: "200" },
        { text: "201-300", value: "300" },
        { text: "301-500", value: "500" },
        { text: "500+", value: "501" },
      ],
      onFilter: (value, record) => {
        const size = parseInt(value);
        if (size === 501) {
          return record.company_size >= 500;
        }
        return record.company_size <= size && record.company_size > size - 100;
      },
    },
    {
      title: "Departments",
      key: "departments",
      width: 200,
      ellipsis: true,
      render: (_, record) => {
        if (!record.departments || record.departments.length === 0) {
          return "-";
        }
        const departmentNames = record.departments
          .map((dept) => dept.name)
          .join(", ");
        return (
          <div className={styles.departmentCell} title={departmentNames}>
            {departmentNames}
          </div>
        );
      },
      filters: departments.map((dept) => ({
        text: dept.department_name,
        value: dept.department_name,
      })),
      onFilter: (value, record) => {
        if (!record.departments || record.departments.length === 0) {
          return false;
        }
        return record.departments.some((dept) => dept.name === value);
      },
    },
    {
      title: "Engagement Score",
      dataIndex: "engagement_score", 
      key: "engagement_score",
      render: (score) => {
        const displayScore = score === null ? 0 : score;
        return (
          <div className={styles.engagementScoreContainer}>
            <div
              className={styles.engagementScoreBar}
              style={{ width: `${displayScore}%` }}
            />
            <div className={styles.engagementScoreText}>{displayScore}%</div>
          </div>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Analytics",
      key: "analytics",
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<BarChartOutlined />} 
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click event
            handleViewAnalytics(record);
          }}
        >
          View Metrics
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Manage Companies</h1>
      <div className={styles.actionBar}>
        <Input.Search
          placeholder="Search companies..."
          onChange={handleSearchChange}
          className={styles.searchInput}
          allowClear
          loading={loading}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateDrawerOpen}
        >
          Create Company
        </Button>
      </div>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <Table
          dataSource={companies}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            showTotal: (total) => `Total ${total} companies`,
            pageSize: 10,
            showSizeChanger: false,
          }}
          scroll={{ x: "max-content" }}
          onRow={onRowClick}
        />
      </div>

      <Drawer
        title="Company Details"
        placement="right"
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        extra={
          <Button type="primary" onClick={handleAssignResources}>
            Assign Resources
          </Button>
        }
      >
        <div className={styles.drawerContent}>
          {selectedCompany && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Company Name">
                {selectedCompany.company_name}
              </Descriptions.Item>
              <Descriptions.Item label="Contact Person">
                {selectedCompany.contact_person_info
                  ? `${selectedCompany.contact_person_info.first_name} ${selectedCompany.contact_person_info.last_name}`
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Contact Email">
                {selectedCompany.contact_person_info
                  ? selectedCompany.contact_person_info.email
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Contact Phone">
                {selectedCompany.contact_person_info
                  ? selectedCompany.contact_person_info.phone
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Departments">
                {selectedCompany.departments &&
                selectedCompany.departments.length > 0
                  ? selectedCompany.departments
                      .map((dept) => dept.name)
                      .join(", ")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Company Size">
                {selectedCompany.company_size}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <span
                  className={`${styles.statusBadge} ${
                    selectedCompany.active === 1
                      ? styles.active
                      : selectedCompany.active === 0
                      ? styles.inactive
                      : styles.pending
                  }`}
                >
                  {selectedCompany.active === 1
                    ? "Active"
                    : selectedCompany.active === 0
                    ? "Inactive"
                    : "Pending"}
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
        </div>
      </Drawer>

      <Drawer
        title="Create New Company"
        width={500}
        onClose={() => setCreateDrawerVisible(false)}
        open={createDrawerVisible}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateCompany}>
          <Form.Item
            name="company_name"
            label="Company Name"
            rules={[{ required: true, message: "Please enter company name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email_domain"
            label="Email"
            rules={[{ required: true, message: "Please enter email domain" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: "Please enter first name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true, message: "Please enter last name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter contact email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: "Please enter contact phone" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="industry"
            label="Industry"
            rules={[
              {
                required: true,
                message: "Please select at least one industry",
              },
            ]}
          >
            <Select mode="multiple" placeholder="Select industries" allowClear>
              {departments.map((dept) => (
                <Select.Option key={dept.id} value={dept.department_name}>
                  {dept.department_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="company_size"
            label="Company Size"
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>

          {/* <Form.Item
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
          </Form.Item> */}

          <Space>
            <Button onClick={() => setCreateDrawerVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Space>
        </Form>
      </Drawer>

      <Drawer
        title={`Assign Resources to ${
          selectedCompany?.company_name || "Company"
        }`}
        placement="right"
        width={500}
        onClose={() => setResourceDrawerVisible(false)}
        open={resourceDrawerVisible}
      >
        <Form
          form={resourceForm}
          layout="vertical"
          onFinish={handleResourceSubmit}
        >
          <Form.Item
            name="resourceType"
            label="Resource Type"
            initialValue="image"
          >
            <Select
              onChange={handleResourceTypeChange}
              style={{ width: "100%" }}
            >
              <Select.Option value="image">Images</Select.Option>
              <Select.Option value="video">Videos</Select.Option>
              <Select.Option value="document">Documents</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="resources"
            label="Select Resources"
            rules={[
              {
                required: true,
                message: "Please select at least one resource",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select resources to assign"
              style={{ width: "100%" }}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={handleResourceSelectionChange}
            >
              {resources.map((resource) => (
                <Select.Option key={resource.id} value={resource.id}>
                  {resource.title}
                  {resource.description &&
                    ` - ${resource.description.substring(0, 30)}...`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {previewResources.length > 0 && (
            <div className={styles.previewSection}>
              <Typography.Title level={5}>Resource Preview</Typography.Title>
              <List
                itemLayout="horizontal"
                dataSource={previewResources}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        item.file_type === "image" ? (
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={item.file_url}
                              alt={item.title}
                              style={{
                                width: 80,
                                height: 60,
                                objectFit: "cover",
                                cursor: "pointer",
                              }}
                            />
                          </a>
                        ) : item.file_type === "video" ? (
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <VideoCameraOutlined
                              style={{
                                fontSize: 36,
                                color: "#1890ff",
                                cursor: "pointer",
                              }}
                            />
                          </a>
                        ) : (
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileTextOutlined
                              style={{
                                fontSize: 36,
                                color: "#faad14",
                                cursor: "pointer",
                              }}
                            />
                          </a>
                        )
                      }
                      title={item.title}
                      description={
                        <div>
                          <p>{item.description}</p>
                          {item.tags && item.tags.length > 0 && (
                            <div>
                              {item.tags.map((tag) => (
                                <Tag key={tag} color="blue">
                                  {tag}
                                </Tag>
                              ))}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}

          <Space>
            <Button onClick={() => setResourceDrawerVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Assign Resources
            </Button>
          </Space>
        </Form>
      </Drawer>
    </div>
  );
};
export default Company;
