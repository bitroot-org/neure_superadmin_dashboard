import React, { useState, useEffect } from 'react';
import { Table, Button, Space, DatePicker, Drawer, Form, Input, message, Select, Tag, Modal, Switch } from 'antd';
import { FilterOutlined, PlusOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './Assessments.module.css';
import { createAssessment, getAllAssessments, deleteAssessment } from '../../services/api';

const Assessments = () => {
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [questions, setQuestions] = useState([{ 
    id: 1, 
    options: [
      { text: 'Option 1', points: 0 },
      { text: 'Option 2', points: 0 }
    ]
  }]);
  const [form] = Form.useForm();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [publishButtonLoading, setPublishButtonLoading] = useState(false);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);

  // Remove the createPsiQuestions function and any other PSI-related code

  // Fetch assessments on component mount
  useEffect(() => {
    fetchAssessments();
  }, []);

  // Update fetchAssessments to handle the nested data structure
  const fetchAssessments = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await getAllAssessments({ page, limit });
      if (response.success && response.data) {
        // Check if data has the assessments property (nested structure)
        const assessmentsData = response.data.assessments || response.data;
        
        // Ensure we're setting an array
        setAssessments(Array.isArray(assessmentsData) ? assessmentsData : []);
        
        // If pagination data is available, update pagination state
        if (response.data.pagination) {
          setPagination({
            current: response.data.pagination.currentPage,
            pageSize: response.data.pagination.limit,
            total: response.data.pagination.total
          });
        }
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
      message.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  // Add pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Handle pagination change
  const handleTableChange = (newPagination) => {
    fetchAssessments(newPagination.current, newPagination.pageSize);
  };

  const handleDeleteAssessment = (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this assessment?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setDeleteButtonLoading(true); // Set button loading state to true
          await deleteAssessment(id);
          message.success('Assessment deleted successfully');
          fetchAssessments(); // Refresh the list
        } catch (error) {
          console.error('Error deleting assessment:', error);
          message.error('Failed to delete assessment');
        } finally {
          setDeleteButtonLoading(false); // Reset button loading state
        }
      },
    });
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Date published',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click event
              handleViewAssessment(record, true);
            }}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            danger
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click event
              handleDeleteAssessment(record.id);
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewAssessment = (assessment, editMode = false) => {
    setSelectedAssessment(assessment);
    setIsEditMode(editMode);
    
    // Transform the assessment data to match our form structure
    const transformedQuestions = assessment.questions.map((q, index) => ({
      id: index + 1,
      options: q.options.map(opt => ({
        text: opt.option_text,
        points: opt.points || 0
      }))
    }));
    
    setQuestions(transformedQuestions);
    
    // Set form values
    form.setFieldsValue({
      title: assessment.title,
      description: assessment.description,
      questions: assessment.questions.map(q => ({
        prompt: q.question_text
      }))
    });
    
    setCreateDrawerVisible(true);
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      options: [
        { text: 'Option 1', points: 0 },
        { text: 'Option 2', points: 0 }
      ]
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleAddOption = (questionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: [...q.options, { 
            text: `Option ${q.options.length + 1}`, 
            points: 0 
          }]
        };
      }
      return q;
    }));
  };

  const handleRemoveOption = (questionId, optionIndex) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options.length > 1) {
        const newOptions = [...q.options];
        newOptions.splice(optionIndex, 1);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handlePublish = () => {
    form.validateFields()
      .then(async (values) => {
        try {
          setPublishButtonLoading(true); // Set button loading state to true
          
          const formattedData = {
            title: values.title,
            description: values.description || '',
            questions: questions.map((q, index) => ({
              question_text: values.questions[index]?.prompt || '',
              options: q.options.map(opt => ({
                option_text: opt.text,
                points: opt.points || 0
              }))
            }))
          };
          
          // If editing, add the assessment ID
          if (isEditMode && selectedAssessment) {
            formattedData.id = selectedAssessment.id;
          }

          console.log('Sending data:', formattedData);
          const response = await createAssessment(formattedData);
          message.success(`Assessment ${isEditMode ? 'updated' : 'published'} successfully`);
          setCreateDrawerVisible(false);
          resetForm();
          fetchAssessments(); // Refresh the list
        } catch (error) {
          console.error('API Error:', error);
          message.error(error.message || `Failed to ${isEditMode ? 'update' : 'publish'} assessment`);
        } finally {
          setPublishButtonLoading(false); // Reset button loading state
        }
      })
      .catch(error => {
        console.error('Form validation failed:', error);
        message.error('Please fill in all required fields');
      });
  };

  const resetForm = () => {
    form.resetFields();
    setQuestions([{ 
      id: 1, 
      options: [
        { text: 'Option 1', points: 0 },
        { text: 'Option 2', points: 0 }
      ]
    }]);
    setSelectedAssessment(null);
    setIsEditMode(false);
  };

  const handleCloseDrawer = () => {
    setCreateDrawerVisible(false);
    resetForm();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Assessments</h1>

      <div className={styles.actionBar}>
        <DatePicker.RangePicker className={styles.datePicker} />
        <Space>
          <Button icon={<FilterOutlined />}>Filter</Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              resetForm();
              setCreateDrawerVisible(true);
            }}
          >
            Add new
          </Button>
        </Space>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          dataSource={assessments}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={pagination}
          scroll={{ x: 1200 }}
          onRow={(record) => ({
            onClick: () => handleViewAssessment(record, false),
            style: { cursor: 'pointer' }
          })}
        />
      </div>

      <Drawer
        title={
          <Space>
            {isEditMode 
              ? 'Edit assessment' 
              : selectedAssessment 
                ? 'View assessment' 
                : 'Add new assessment'
            }
          </Space>
        }
        width={720}
        onClose={handleCloseDrawer}
        open={createDrawerVisible}
      >
        <Form
          form={form}
          layout="vertical"
          className={styles.assessmentForm}
          disabled={selectedAssessment && !isEditMode}
        >
          <Form.Item
            name="title"
            label="Assessment title"
            rules={[
              { required: true, message: 'Please enter assessment title' },
              { max: 100, message: 'Title cannot exceed 100 characters' }
            ]}
          >
            <Input placeholder="Enter assessment title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { max: 500, message: 'Description cannot exceed 500 characters' }
            ]}
          >
            <Input.TextArea placeholder="Enter assessment description" rows={4} />
          </Form.Item>

          {questions.map((question, questionIndex) => (
            <div key={question.id} className={styles.questionBox}>
              <Form.Item
                name={['questions', questionIndex, 'prompt']}
                label={`Question ${questionIndex + 1}`}
                rules={[
                  { required: true, message: 'Please enter question' },
                  { max: 300, message: 'Question cannot exceed 300 characters' }
                ]}
              >
                <Input placeholder="Question/ prompt" />
              </Form.Item>

              <div className={styles.optionsContainer}>
                <div className={styles.optionsLabel}>Answer</div>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className={styles.optionRow}>
                    <Input 
                      placeholder={`Option ${optionIndex + 1}`}
                      value={option.text}
                      onChange={(e) => {
                        if (selectedAssessment && !isEditMode) return;
                        const newQuestions = [...questions];
                        newQuestions[questionIndex].options[optionIndex].text = e.target.value;
                        setQuestions(newQuestions);
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Points"
                      value={option.points}
                      onChange={(e) => {
                        if (selectedAssessment && !isEditMode) return;
                        const newQuestions = [...questions];
                        newQuestions[questionIndex].options[optionIndex].points = parseInt(e.target.value) || 0;
                        setQuestions(newQuestions);
                      }}
                      style={{ width: 120, marginLeft: 8 }}
                    />
                    {(isEditMode || !selectedAssessment) && (
                      <CloseOutlined
                        className={styles.removeOption}
                        onClick={() => handleRemoveOption(question.id, optionIndex)}
                      />
                    )}
                  </div>
                ))}
                {(isEditMode || !selectedAssessment) && (
                  <Button 
                    type="link" 
                    className={styles.addOptionBtn}
                    onClick={() => handleAddOption(question.id)}
                  >
                    + Add option
                  </Button>
                )}
              </div>
            </div>
          ))}

          {(isEditMode || !selectedAssessment) && (
            <Button 
              type="dashed" 
              block 
              className={styles.addQuestionBtn}
              onClick={handleAddQuestion}
            >
              + Add question
            </Button>
          )}

          {(isEditMode || !selectedAssessment) && (
            <Button 
              type="primary" 
              block 
              className={styles.publishBtn}
              onClick={handlePublish}
              loading={publishButtonLoading}
              disabled={publishButtonLoading}
            >
              {isEditMode ? 'Update' : 'Publish'}
            </Button>
          )}
        </Form>
      </Drawer>
    </div>
  );
};

export default Assessments;
