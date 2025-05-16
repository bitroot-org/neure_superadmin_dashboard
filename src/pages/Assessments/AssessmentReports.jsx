import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Select, 
  Button, 
  Space, 
  Typography, 
  Spin, 
  Empty, 
  DatePicker, 
  Drawer,
  Descriptions,
  Tag,
  Divider,
  List,
  Progress,
  message
} from 'antd';
import { 
  FileTextOutlined, 
  UserOutlined,
  TeamOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { getCompanyList, getAssessmentsList, getAssessmentCompletionList, getUserAssessmentResponses } from '../../services/api';
import styles from './AssessmentReports.module.css';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AssessmentReports = () => {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [reports, setReports] = useState([]);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [reportDetail, setReportDetail] = useState(null);
  
  // Add a new state for storing user responses
  const [userResponses, setUserResponses] = useState(null);
  const [loadingResponses, setLoadingResponses] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchAssessments();
  }, []);

  useEffect(() => {
    fetchReports(pagination.current, pagination.pageSize);
  }, [selectedCompany, selectedAssessment, dateRange]);

  const fetchCompanies = async () => {
    try {
      const response = await getCompanyList();
      if (response.status && response.data) {
        setCompanies(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const fetchAssessments = async () => {
    try {
      const response = await getAssessmentsList();
      console.log("Assessment response:", response); // Debug log
      
      // Check for success property in the response
      if (response.status && response.data) {
        setAssessments(response.data);
        console.log("Assessments set:", response.data); // Debug log
      } else if (response.success && response.data) {
        // Alternative response format
        setAssessments(response.data);
        console.log("Assessments set (alt format):", response.data); // Debug log
      } else {
        console.error("Unexpected assessment response format:", response);
        setAssessments([]);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
      setAssessments([]);
    }
  };

  const fetchReports = async (page = 1, pageSize = 10) => {
    setLoading(true);
    
    try {
      // Prepare parameters for API call
      const params = {
        page,
        limit: pageSize
      };
      
      // Add company filter if selected
      if (selectedCompany) {
        params.company_id = selectedCompany;
      }
      
      // Add assessment filter if selected
      if (selectedAssessment) {
        params.assessment_id = selectedAssessment;
      }
      
      // // Add date range filter if selected
      // if (dateRange && dateRange[0] && dateRange[1]) {
      //   params.start_date = dateRange[0].format('YYYY-MM-DD');
      //   params.end_date = dateRange[1].format('YYYY-MM-DD');
      // }
      
      console.log("Fetching reports with params:", params);
      
      // Call API
      const response = await getAssessmentCompletionList(params);
      console.log("API Response:", response);
      
      // Check if response has success property (new format) or status property (old format)
      if ((response.success || response.status) && response.data) {
        // Handle the new nested structure where data is inside completions property
        const completionsData = response.data.completions || response.data;
        console.log("Completions data:", completionsData);
        
        // Format the data to match our table structure
        const formattedData = completionsData.map((item, index) => {
          // Parse score from percentage string (e.g., "100%") to number
          let score = 0;
          if (item.score) {
            const scoreMatch = item.score.match(/(\d+)/);
            if (scoreMatch && scoreMatch[1]) {
              score = parseInt(scoreMatch[1]);
            }
          }
          
          return {
            id: index + 1, // Use index as id if not provided
            employee_name: item.employee,
            email: item.email,
            company_name: item.company,
            assessment_title: item.assessment,
            completed_at: item.completion_date,
            score: score,
            user_id: item.user_id // Add user_id to the report data
          };
        });
        
        console.log("Formatted data for table:", formattedData);
        setReports(formattedData);
        
        // Update pagination if provided
        if (response.pagination || (response.data && response.data.pagination)) {
          const paginationData = response.pagination || response.data.pagination;
          console.log("Pagination data:", paginationData);
          setPagination({
            current: paginationData.current_page || page,
            pageSize: paginationData.per_page || pageSize,
            total: paginationData.total || formattedData.length
          });
        }
      } else {
        console.error("Invalid response format:", response);
        setReports([]);
      }
    } catch (error) {
      console.error("Error fetching assessment reports:", error);
      message.error("Failed to load assessment reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    fetchReports(newPagination.current, newPagination.pageSize);
  };

  const handleCompanyChange = (value) => {
    setSelectedCompany(value);
    // Reset pagination to first page when filter changes
    setPagination({
      ...pagination,
      current: 1
    });
    // fetchReports will be called by the useEffect that depends on selectedCompany
  };

  const handleAssessmentChange = (value) => {
    setSelectedAssessment(value);
    // Reset pagination to first page when filter changes
    setPagination({
      ...pagination,
      current: 1
    });
    // fetchReports will be called by the useEffect that depends on selectedAssessment
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    // Reset pagination to first page when filter changes
    setPagination({
      ...pagination,
      current: 1
    });
    // fetchReports will be called by the useEffect that depends on dateRange
  };

  const handleViewReport = async (report) => {
    console.log("Viewing report:", report);
    setReportDetail(report);
    setDrawerVisible(true);
    
    // Reset previous responses
    setUserResponses(null);
    
    // Get user_id from the report
    // If the report doesn't have a user_id field, we'll need to extract it from somewhere else
    // For now, we'll use the report's id or fallback to email if necessary
    const userId = report.user_id || report.id;
    
    // Get assessment_id from the report
    // This assumes you have the assessment ID in your report data
    // If not, you might need to look it up based on the assessment title
    const assessmentTitle = report.assessment_title;
    const assessment = assessments.find(a => a.title === assessmentTitle);
    
    if (!assessment) {
      console.error("Could not find assessment ID for:", assessmentTitle);
      message.error("Could not load assessment details");
      return;
    }
    
    const assessmentId = assessment.id;
    
    // Fetch user responses
    setLoadingResponses(true);
    try {
      const response = await getUserAssessmentResponses({
        assessmentId: assessmentId,
        user_id: userId
      });
      
      console.log("User responses:", response);
      
      if (response.success && response.data) {
        setUserResponses(response.data);
      } else {
        message.error("Failed to load assessment responses");
      }
    } catch (error) {
      console.error("Error fetching user responses:", error);
      message.error("Failed to load assessment responses");
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleExportCSV = () => {
    message.success('Reports exported successfully');
  };

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'employee_name',
      key: 'employee_name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Company',
      dataIndex: 'company_name',
      key: 'company_name',
    },
    {
      title: 'Assessment',
      dataIndex: 'assessment_title',
      key: 'assessment_title',
    },
    {
      title: 'Completion Date',
      dataIndex: 'completed_at',
      key: 'completed_at',
      render: (date) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score) => (
        <Progress 
          percent={score} 
          size="small" 
          status="active"
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<FileTextOutlined />} 
          onClick={() => handleViewReport(record)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2} className={styles.title}>
          <FileTextOutlined /> Assessment Reports
        </Title>
      </div>

      <Card className={styles.filterCard}>
        <Space size="large" wrap>
          <div>
            <Text strong>Company:</Text>
            <Select
              placeholder="Select company"
              style={{ width: 200, marginLeft: 8 }}
              allowClear
              onChange={handleCompanyChange}
              value={selectedCompany}
            >
              {companies.map(company => (
                <Option key={company.id} value={company.id}>
                  {company.company_name}
                </Option>
              ))}
            </Select>
          </div>
          
          <div>
            <Text strong>Assessment:</Text>
            <Select
              placeholder="Select assessment"
              style={{ width: 200, marginLeft: 8 }}
              allowClear
              onChange={handleAssessmentChange}
              value={selectedAssessment}
              loading={assessments.length === 0}
            >
              {assessments.map(assessment => (
                <Option key={assessment.id} value={assessment.id}>
                  {assessment.title}
                </Option>
              ))}
            </Select>
          </div>
          
          <div>
            <Text strong>Date Range:</Text>
            <RangePicker 
              style={{ marginLeft: 8 }}
              value={dateRange}
              onChange={handleDateRangeChange}
            />
          </div>
        </Space>
      </Card>

      <Card className={styles.reportsCard}>
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          locale={{
            emptyText: <Empty description="No assessment reports found" />
          }}
          scroll={{ x: 1100 }}
        />
        {reports.length === 0 && !loading && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <Text type="secondary">No data found. Try adjusting your filters.</Text>
          </div>
        )}
      </Card>

      <Drawer
        title={
          <Space>
            Assessment Report Details
          </Space>
        }
        placement="right"
        width={600}
        onClose={() => {
          setDrawerVisible(false);
          // Enable scrolling when drawer is closed
          document.body.style.overflow = 'auto';
        }}
        open={drawerVisible}
      >
        {reportDetail && (
          <div className={styles.reportDetail}>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Employee">
                <Space>
                  <UserOutlined />
                  {reportDetail.employee_name}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {reportDetail.email}
              </Descriptions.Item>
              <Descriptions.Item label="Company">
                <Space>
                  <TeamOutlined />
                  {reportDetail.company_name}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Assessment">
                {reportDetail.assessment_title}
              </Descriptions.Item>
              <Descriptions.Item label="Completion Date">
                <Space>
                  <CalendarOutlined />
                  {dayjs(reportDetail.completed_at).format('MMMM D, YYYY, h:mm A')}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Overall Score">
                <Progress 
                  percent={reportDetail.score} 
                  status="active"
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Response Details</Divider>
            
            {loadingResponses ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '10px' }}>Loading responses...</div>
              </div>
            ) : userResponses ? (
              <List
                itemLayout="vertical"
                dataSource={userResponses.responses || []}
                renderItem={(item, index) => (
                  <List.Item>
                    <Card className={styles.responseCard}>
                      <Title level={5}>Question {index + 1}: {item.question_text}</Title>
                      
                      <div className={styles.responseAnswer}>
                        <Text strong>Selected Option:</Text>
                        <div className={styles.answerContent}>
                          {item.options
                            .filter(option => {
                              // Check if user_selected_options is an array or a single value
                              if (Array.isArray(item.user_selected_options)) {
                                return item.user_selected_options.includes(option.id);
                              } else {
                                return item.user_selected_options === option.id;
                              }
                            })
                            .map(option => (
                              <Tag 
                                key={option.id} 
                                color="blue"
                                className={styles.optionTag}
                              >
                                {option.option_text} ({option.points} points)
                              </Tag>
                            ))}
                        </div>
                      </div>
                      
                      <div className={styles.allOptions}>
                        <Text strong>All Options:</Text>
                        <div className={styles.optionsColumn}>
                          {item.options.map(option => (
                            <Tag 
                              key={option.id} 
                              color={
                                // Check if user_selected_options is an array or a single value
                                (Array.isArray(item.user_selected_options) && 
                                 item.user_selected_options.includes(option.id)) || 
                                item.user_selected_options === option.id 
                                  ? 'blue' 
                                  : 'default'
                              }
                              className={styles.optionTag}
                            >
                              {option.option_text} ({option.points} points)
                            </Tag>
                          ))}
                        </div>
                      </div>
                      
                      {item.feedback && (
                        <div className={styles.feedback}>
                          <Text strong>Feedback:</Text>
                          <div>{item.feedback}</div>
                        </div>
                      )}
                      
                      <div className={styles.userPoints}>
                        <Text strong>Points earned:</Text>
                        <div>{item.user_points} points</div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No detailed responses available" />
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AssessmentReports;
