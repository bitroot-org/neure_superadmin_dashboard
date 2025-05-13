import React, { useState, useEffect } from "react";
import { 
  Table, 
  Typography, 
  Space, 
  DatePicker, 
  Tag, 
  Select,
  message,
  Drawer,
  Descriptions,
  Button
} from "antd";
import { 
  HistoryOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getActivityLogs, getAllCompanies, getSuperAdminList } from "../../services/api";
import styles from "./ActivityHistory.module.css";
import { HiH1 } from "react-icons/hi2";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ActivityHistory = () => {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [dateRange, setDateRange] = useState(null);
  const [moduleFilter, setModuleFilter] = useState(null);
  const [performedByFilter, setPerformedByFilter] = useState(null);
  const [companyFilter, setCompanyFilter] = useState(null); // New company filter
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [superAdmins, setSuperAdmins] = useState([]);

  const fetchActivities = async (page = 1, pageSize = 10, params = {}) => {
    setLoading(true);
    try {
      const response = await getActivityLogs({ 
        page, 
        limit: pageSize,
        ...params
      });
      
      if (response.status && response.data) {
        setActivities(response.data.logs || []);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.pagination?.total || 0
        });
      } else {
        message.error(response.message || "Failed to fetch activity logs");
        setActivities([]); // Set empty array to prevent undefined errors
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      message.error("Failed to fetch activity logs");
      setActivities([]); // Set empty array to prevent undefined errors
    } finally {
      setLoading(false); // Make sure loading is set to false in all cases
    }
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await getAllCompanies({ all: true });
        if (response.status && response.data) {
          setCompanies(response.data.companies || []);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        message.error("Failed to load companies");
      }
    };
    
    const fetchSuperAdmins = async () => {
      try {
        const response = await getSuperAdminList();
        if (response.status && response.data) {
          setSuperAdmins(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching super admins:", error);
        message.error("Failed to load super admins");
      }
    };
    
    // Call all fetch functions
    fetchCompanies();
    fetchSuperAdmins();
    fetchActivities(); // Add this to fetch activity logs on mount
  }, []);

  const handleTableChange = (newPagination) => {
    const params = {};
    
    if (moduleFilter) params.module_name = moduleFilter;
    
    // Check if performedByFilter is a role or a user ID
    if (performedByFilter) {
      const isRole = ['admin', 'user', 'system'].includes(performedByFilter);
      if (isRole) {
        params.performed_by = performedByFilter;
      } else {
        params.performed_by_id = performedByFilter;
      }
    }
    
    if (companyFilter) params.company_id = companyFilter;
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.start_date = dateRange[0].format("YYYY-MM-DD");
      params.end_date = dateRange[1].format("YYYY-MM-DD");
    }
    
    fetchActivities(newPagination.current, newPagination.pageSize, params);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (dates) {
      fetchActivities(1, pagination.pageSize, {
        module_name: moduleFilter,
        performed_by: performedByFilter,
        company_id: companyFilter,
        start_date: dates[0].format("YYYY-MM-DD"),
        end_date: dates[1].format("YYYY-MM-DD")
      });
    } else {
      fetchActivities(1, pagination.pageSize, {
        module_name: moduleFilter,
        performed_by: performedByFilter,
        company_id: companyFilter
      });
    }
  };

  const handleModuleChange = (value) => {
    setModuleFilter(value);
    fetchActivities(1, pagination.pageSize, {
      module_name: value,
      performed_by: performedByFilter,
      company_id: companyFilter,
      ...(dateRange && dateRange[0] && dateRange[1] ? {
        start_date: dateRange[0].format("YYYY-MM-DD"),
        end_date: dateRange[1].format("YYYY-MM-DD")
      } : {})
    });
  };

  const handlePerformedByChange = (value) => {
    setPerformedByFilter(value);
    
    // Determine if the value is a role (admin, user, system) or a user ID
    const isRole = ['admin', 'user', 'system'].includes(value);
    
    fetchActivities(1, pagination.pageSize, {
      module_name: moduleFilter,
      performed_by: isRole ? value : undefined,
      performed_by_id: !isRole ? value : undefined,
      company_id: companyFilter,
      ...(dateRange && dateRange[0] && dateRange[1] ? {
        start_date: dateRange[0].format("YYYY-MM-DD"),
        end_date: dateRange[1].format("YYYY-MM-DD")
      } : {})
    });
  };

  const handleCompanyChange = (value) => {
    setCompanyFilter(value);
    fetchActivities(1, pagination.pageSize, {
      module_name: moduleFilter,
      performed_by: performedByFilter,
      company_id: value,
      ...(dateRange && dateRange[0] && dateRange[1] ? {
        start_date: dateRange[0].format("YYYY-MM-DD"),
        end_date: dateRange[1].format("YYYY-MM-DD")
      } : {})
    });
  };

  const handleRowClick = (record) => {
    setSelectedActivity(record);
    setDrawerVisible(true);
  };

  const getActionColor = (action) => {
    const actionColors = {
      'CREATE': 'green',
      'UPDATE': 'blue',
      'DELETE': 'red',
      'VIEW': 'purple',
      'LOGIN': 'cyan',
      'LOGOUT': 'orange',
      'RESCHEDULE': 'geekblue'
    };
    
    return actionColors[action] || 'default';
  };

  const columns = [
    {
      title: "Performed By",
      dataIndex: "performed_by",
      key: "performed_by",
      render: (type) => {
        let color = 'blue';
        if (type === 'admin') color = 'purple';
        if (type === 'user') color = 'blue';
        if (type === 'system') color = 'orange';
        
        return <Tag color={color}>{type.toUpperCase()}</Tag>;
      }
    },
    {
      title: "Company",
      dataIndex: "company_name",
      key: "company_name",
    },
    {
      title: "Module",
      dataIndex: "module_name",
      key: "module_name",
      render: (module) => (
        <span style={{ textTransform: 'capitalize' }}>{module.replace('_', ' ')}</span>
      )
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action) => (
        <Tag color={getActionColor(action)}>{action}</Tag>
      )
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Timestamp",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          {dayjs(date).format("MMM D, YYYY")}
          <br />
          <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
            {dayjs(date).format("hh:mm A")}
          </span>
        </span>
      ),
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <HistoryOutlined /> Activity History
        </h1>
      </div>

      <div className={styles.actionBar}>
        <Space wrap>
          <Select
            placeholder="Filter by person"
            allowClear
            style={{ width: 180 }}
            onChange={handlePerformedByChange}
            value={performedByFilter}
          >
            {superAdmins.map(admin => (
              <Option key={admin.id} value={admin.id}>{admin.first_name} {admin.last_name}</Option>
            ))}
          </Select>
          <Select
            placeholder="Filter by module"
            allowClear
            style={{ width: 180 }}
            onChange={handleModuleChange}
            value={moduleFilter}
          >
            <Option value="workshops">Workshops</Option>
            <Option value="workshop_schedules">Workshop Schedules</Option>
          </Select>
          <Select
            placeholder="Filter by company"
            allowClear
            style={{ width: 200 }}
            onChange={handleCompanyChange}
            value={companyFilter}
          >
            {companies.map(company => (
              <Option key={company.id} value={company.id}>{company.company_name}</Option>
            ))}
          </Select>
          <RangePicker 
            onChange={handleDateRangeChange}
            value={dateRange}
          />
        </Space>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          dataSource={activities}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000}}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' }
          })}
        />
      </div>

      {/* Activity Details Drawer */}
      <Drawer
        title={
          <Space>
            <ArrowLeftOutlined onClick={() => setDrawerVisible(false)} />
            Activity Details
          </Space>
        }
        placement="right"
        width={520}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedActivity && (
          <div className={styles.detailsContainer}>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Performed By">
                <Tag color={
                  selectedActivity.performed_by === 'admin' ? 'purple' : 
                  selectedActivity.performed_by === 'system' ? 'orange' : 'blue'
                }>
                  {selectedActivity.performed_by.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Module">
                <span style={{ textTransform: 'capitalize' }}>
                  {selectedActivity.module_name.replace('_', ' ')}
                </span>
              </Descriptions.Item>
              
              <Descriptions.Item label="Action">
                <Tag color={getActionColor(selectedActivity.action)}>
                  {selectedActivity.action}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Description">
                {selectedActivity.description}
              </Descriptions.Item>
              
              <Descriptions.Item label="Timestamp">
                {dayjs(selectedActivity.created_at).format("MMMM D, YYYY, hh:mm:ss A")}
              </Descriptions.Item>
              
              {selectedActivity.additional_data && (
                <Descriptions.Item label="Additional Data">
                  <pre style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto' }}>
                    {typeof selectedActivity.additional_data === 'object' 
                      ? JSON.stringify(selectedActivity.additional_data, null, 2)
                      : selectedActivity.additional_data}
                  </pre>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ActivityHistory;
