import React, { useState, useEffect } from "react";
import {
  Select,
  Table,
  Alert,
  Space,
  Button,
  Drawer,
  Form,
  Input,
  DatePicker,
  Descriptions,
  Upload,
  message,
  Modal, // Add Modal import
} from "antd";
import moment from "moment";
import {
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  getAllCompanies,
  getCompanyEmployees,
  getDepartments,
  createEmployee,
  bulkCreateEmployees,
  removeEmployee,
} from "../../services/api";

const { Option } = Select;

const Employees = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Add new state for selected row keys
  const [createButtonLoading, setCreateButtonLoading] = useState(false); // Add new state for create button loading

  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const response = await getAllCompanies({ all: true });
        setCompanies(response.data.companies);
        // Set default company and fetch its employees
        if (response.data.companies.length > 0) {
          const defaultCompany = response.data.companies[0];
          setSelectedCompany(defaultCompany.id);
          handleCompanyChange(defaultCompany.id);
        }
      } catch (error) {
        setError("Error fetching companies: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Fetch departments when component mounts
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await getDepartments();
        if (response.status) {
          setDepartments(response.data);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        message.error("Failed to load departments");
      }
    };

    fetchDepartments();
  }, []);

  const handleCompanyChange = async (value) => {
    setSelectedCompany(value);
    form.setFieldsValue({ company_id: value });
    setLoading(true);
    try {
      const response = await getCompanyEmployees(value, {
        page: pagination.current,
        pageSize: pagination.pageSize,
      });
      setEmployees(response.data.employees);
    } catch (error) {
      setError("Error fetching employees: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRowClick = (record) => ({
    onClick: (e) => {
      // Only trigger drawer if the click is not on the checkbox
      if (
        e.target.type !== "checkbox" &&
        !e.target.closest(".ant-checkbox-wrapper")
      ) {
        setSelectedEmployee(record);
        setDrawerVisible(true);
      }
    },
    style: { cursor: "pointer" },
  });

  const handleCreateEmployee = async (values) => {
    try {
      setCreateButtonLoading(true);
      setLoading(true);

      if (uploadedFile) {
        const response = await bulkCreateEmployees(
          uploadedFile,
          selectedCompany
        );

        if (response.status) {
          message.success("Employees uploaded successfully");
          setUploadedFile(null);
          setIsFormDisabled(false);
          setCreateDrawerVisible(false);
          form.resetFields();
          handleCompanyChange(selectedCompany);
        } else {
          // Handle bulk creation failure with simplified error message
          if (
            response.data &&
            response.data.failed &&
            response.data.failed.length > 0
          ) {
            // Extract emails and the common error pattern
            const failedEmails = response.data.failed
              .map((item) => item.email)
              .join(", ");

            // Most errors will have the same pattern, so take the error from the first item
            // and remove the email-specific part
            let errorMessage = response.data.failed[0].error;
            errorMessage = errorMessage.replace(
              response.data.failed[0].email,
              ""
            );

            // Create the final message
            const finalMessage = `Failed to upload employees: ${failedEmails} ${errorMessage}`;

            message.error(finalMessage);

            // Keep the drawer open so they can fix and retry
            setUploadedFile(null);
            setIsFormDisabled(false);
          } else {
            message.error(response.message || "Failed to upload employees");
            setCreateDrawerVisible(false);
            form.resetFields();
          }
        }
      } else {
        const formData = {
          ...values,
          company_id: selectedCompany,
          date_of_birth: values.date_of_birth.format("YYYY-MM-DD"),
        };
        const response = await createEmployee(formData);
        if (response.status) {
          message.success("Employee created successfully");
          setCreateDrawerVisible(false);
          form.resetFields();
          handleCompanyChange(selectedCompany);
        } else {
          message.error(response.message || "Failed to create employee");
        }
      }
    } catch (error) {
      console.error("Error:", error);

      // Check if the error has the detailed format
      if (error.data && error.data.failed && error.data.failed.length > 0) {
        // Extract emails and the common error pattern
        const failedEmails = error.data.failed
          .map((item) => item.email)
          .join(", ");

        // Most errors will have the same pattern, so take the error from the first item
        // and remove the email-specific part
        let errorMessage = error.data.failed[0].error;
        errorMessage = errorMessage.replace(error.data.failed[0].email, "");

        // Create the final message
        const finalMessage = `Failed to upload employees: ${failedEmails} ${errorMessage}`;

        message.error(finalMessage);

        // Keep the drawer open
        setUploadedFile(null);
        setIsFormDisabled(false);
      } else {
        message.error(
          uploadedFile
            ? "Failed to upload employees"
            : "Failed to create employee"
        );
        setCreateDrawerVisible(false);
        form.resetFields();
      }
    } finally {
      setLoading(false);
      setCreateButtonLoading(false);
    }
  };

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    setIsFormDisabled(true);
    return false;
  };

  const handleDiscardFile = () => {
    setUploadedFile(null);
    setIsFormDisabled(false);
  };

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (record) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Joined Date",
      dataIndex: "joined_date",
      key: "joined_date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Workshop Attended",
      dataIndex: "Workshop_attended",
      key: "Workshop_attended",
    },
    {
      title: "Tasks Completed",
      dataIndex: "Task_completed",
      key: "Task_completed",
    },
    {
      title: "Engagement Score",
      dataIndex: "EngagementScore",
      key: "EngagementScore",
      render: (score) => `${score}%`,
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (status) => (
        <span style={{ color: status ? "green" : "red" }}>
          {status ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const handleRemoveEmployees = () => {
    if (!selectedRowKeys.length) {
      message.warning("Please select employees to remove");
      return;
    }

    Modal.confirm({
      title: "Are you sure you want to remove these employees?",
      content: `This will remove ${selectedRowKeys.length} employee(s).`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const payload = {
            company_id: selectedCompany,
            user_ids: selectedRowKeys.filter((id) => id !== null), // Filter out any null values
          };

          await removeEmployee(payload);
          message.success("Employees removed successfully");
          setSelectedRowKeys([]); // Clear selection
          handleCompanyChange(selectedCompany); // Refresh the list
        } catch (error) {
          message.error("Failed to remove employees");
        }
      },
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      // Use the correct ID field from your data
      id: record.id || record.user_id,
    }),
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2 style={{ color: "var(--primary-dark)" }}>Employee Management</h2>
      {error && <Alert message={error} type="error" closable />}

      <Space
        direction="horizontal"
        wrap
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 16
        }}
      >
        <Select
          placeholder="Select a company"
          onChange={handleCompanyChange}
          style={{ width: 300, marginBottom: 8 }}
          loading={loading}
          value={selectedCompany}
        >
          {companies.map((company) => (
            <Option key={company.id} value={company.id}>
              {company.company_name}
            </Option>
          ))}
        </Select>

        <Space wrap>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={handleRemoveEmployees}
            disabled={!selectedRowKeys.length}
          >
            Remove Employee{selectedRowKeys.length > 1 ? "s" : ""}
            {selectedRowKeys.length > 0 && ` (${selectedRowKeys.length})`}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateDrawerVisible(true)}
          >
            Add Employee
          </Button>
        </Space>
      </Space>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <Table
          dataSource={employees}
          columns={columns}
          rowKey={(record) => record.id || record.user_id} // Use the correct ID field
          loading={loading}
          pagination={pagination}
          scroll={{ x: "max-content" }}
          onRow={onRowClick}
          rowSelection={rowSelection}
        />
      </div>

      {/* Details Drawer */}
      <Drawer
        title="Employee Details"
        placement="right"
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedEmployee && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Employee Code">
              {selectedEmployee.employee_code}
            </Descriptions.Item>
            <Descriptions.Item label="Name">
              {`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedEmployee.email}
            </Descriptions.Item>
            <Descriptions.Item label="Department">
              {selectedEmployee.department}
            </Descriptions.Item>
            <Descriptions.Item label="Joined Date">
              {new Date(selectedEmployee.joined_date).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <span
                style={{ color: selectedEmployee.is_active ? "green" : "red" }}
              >
                {selectedEmployee.is_active ? "Active" : "Inactive"}
              </span>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* Create Drawer */}
      <Drawer
        title="Add New Employee"
        width={500}
        open={createDrawerVisible}
        onClose={() => setCreateDrawerVisible(false)}
      >
        <Alert
          message="Bulk Upload"
          description="Upload an CSV file or fill the form below"
          type="info"
          showIcon
          style={{ 
            marginBottom: 16,
            backgroundColor: 'var(--background-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)'
          }}
        />

        <Space
          direction="horizontal"
          style={{
            width: "100%",
            justifyContent: "space-between",
            marginBottom: 16,
            padding: "8px 0",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          {uploadedFile ? (
            <>
              <span>{uploadedFile.name}</span>
              <Button onClick={handleDiscardFile} size="small" danger>
                Discard File
              </Button>
            </>
          ) : (
            <Upload
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              maxCount={1}
              showUploadList={false}
              beforeUpload={handleFileUpload}
            >
              <Button icon={<UploadOutlined />}>Upload CSV</Button>
            </Upload>
          )}
        </Space>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateEmployee}
          initialValues={{ company_id: selectedCompany }}
        >
          {/* Hidden field for company_id */}
          <Form.Item name="company_id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="first_name"
            label="First Name"
            rules={[
              { required: !uploadedFile, message: "Please enter first name" },
              { max: 50, message: "First name cannot exceed 50 characters" },
              {
                pattern: /^[a-zA-Z\s-]+$/,
                message:
                  "First name can only contain letters, spaces and hyphens",
              },
            ]}
          >
            <Input disabled={isFormDisabled} />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[
              { required: !uploadedFile, message: "Please enter last name" },
              { max: 50, message: "Last name cannot exceed 50 characters" },
              {
                pattern: /^[a-zA-Z\s-]+$/,
                message:
                  "Last name can only contain letters, spaces and hyphens",
              },
            ]}
          >
            <Input disabled={isFormDisabled} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: !uploadedFile, message: "Please enter email" },
              { type: "email", message: "Please enter valid email" },
              { max: 100, message: "Email cannot exceed 100 characters" },
            ]}
          >
            <Input disabled={isFormDisabled} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { required: !uploadedFile, message: "Please enter phone number" },
              {
                pattern: /^\d{10}$/,
                message: "Phone number must be exactly 10 digits",
              },
            ]}
          >
            <Input disabled={isFormDisabled} type="tel" maxLength={10} />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
            rules={[
              { required: !uploadedFile, message: "Please select gender" },
            ]}
          >
            <Select disabled={isFormDisabled}>
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="date_of_birth"
            label="Date of Birth"
            rules={[
              {
                required: !uploadedFile,
                message: "Please select date of birth",
              },
              {
                validator: (_, value) => {
                  if (value && value.isAfter(moment().subtract(18, "years"))) {
                    return Promise.reject(
                      "Employee must be at least 18 years old"
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              disabled={isFormDisabled}
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              disabledDate={(current) =>
                current && current > moment().subtract(18, "years")
              }
            />
          </Form.Item>

          <Form.Item
            name="job_title"
            label="Job Title"
            rules={[
              { required: !uploadedFile, message: "Please enter job title" },
              { max: 100, message: "Job title cannot exceed 100 characters" },
            ]}
          >
            <Input disabled={isFormDisabled} />
          </Form.Item>

          <Form.Item
            name="department_id"
            label="Department"
            rules={[
              { required: !uploadedFile, message: "Please select department" },
            ]}
          >
            <Select disabled={isFormDisabled} placeholder="Select department">
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.department_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Space>
            <Button onClick={() => setCreateDrawerVisible(false)}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createButtonLoading}
              disabled={
                createButtonLoading || (isFormDisabled && !uploadedFile)
              }
            >
              {uploadedFile ? "Upload Excel" : "Create Employee"}
            </Button>
          </Space>
        </Form>
      </Drawer>
    </div>
  );
};

export default Employees;
