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
import { getActivityLogs } from "../../services/api";
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
  const [actionFilter, setActionFilter] = useState(null);
  const [performedByFilter, setPerformedByFilter] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

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
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      message.error("Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleTableChange = (newPagination) => {
    const params = {};
    
    if (moduleFilter) params.module_name = moduleFilter;
    if (actionFilter) params.action = actionFilter;
    if (performedByFilter) params.performed_by = performedByFilter;
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
        action: actionFilter,
        performed_by: performedByFilter,
        start_date: dates[0].format("YYYY-MM-DD"),
        end_date: dates[1].format("YYYY-MM-DD")
      });
    } else {
      fetchActivities(1, pagination.pageSize, {
        module_name: moduleFilter,
        action: actionFilter,
        performed_by: performedByFilter
      });
    }
  };

  const handleModuleChange = (value) => {
    setModuleFilter(value);
    fetchActivities(1, pagination.pageSize, {
      module_name: value,
      action: actionFilter,
      performed_by: performedByFilter,
      ...(dateRange && dateRange[0] && dateRange[1] ? {
        start_date: dateRange[0].format("YYYY-MM-DD"),
        end_date: dateRange[1].format("YYYY-MM-DD")
      } : {})
    });
  };

  const handleActionChange = (value) => {
    setActionFilter(value);
    fetchActivities(1, pagination.pageSize, {
      module_name: moduleFilter,
      action: value,
      performed_by: performedByFilter,
      ...(dateRange && dateRange[0] && dateRange[1] ? {
        start_date: dateRange[0].format("YYYY-MM-DD"),
        end_date: dateRange[1].format("YYYY-MM-DD")
      } : {})
    });
  };

  const handlePerformedByChange = (value) => {
    setPerformedByFilter(value);
    fetchActivities(1, pagination.pageSize, {
      module_name: moduleFilter,
      action: actionFilter,
      performed_by: value,
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
            placeholder="Filter by module"
            allowClear
            style={{ width: 180 }}
            onChange={handleModuleChange}
            value={moduleFilter}
          >
            <Option value="users">Users</Option>
            <Option value="workshops">Workshops</Option>
            <Option value="workshop_schedules">Workshop Schedules</Option>
            <Option value="companies">Companies</Option>
            <Option value="soundscapes">Soundscapes</Option>
            <Option value="assessments">Assessments</Option>
          </Select>
          <Select
            placeholder="Filter by action"
            allowClear
            style={{ width: 150 }}
            onChange={handleActionChange}
            value={actionFilter}
          >
            <Option value="CREATE">Create</Option>
            <Option value="UPDATE">Update</Option>
            <Option value="DELETE">Delete</Option>
            <Option value="VIEW">View</Option>
            <Option value="LOGIN">Login</Option>
            <Option value="LOGOUT">Logout</Option>
            <Option value="RESCHEDULE">Reschedule</Option>
          </Select>
          <Select
            placeholder="Filter by user type"
            allowClear
            style={{ width: 150 }}
            onChange={handlePerformedByChange}
            value={performedByFilter}
          >
            <Option value="admin">Admin</Option>
            <Option value="user">User</Option>
            <Option value="system">System</Option>
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
