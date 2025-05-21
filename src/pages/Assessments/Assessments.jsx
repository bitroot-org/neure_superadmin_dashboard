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
  const [interpretationRanges, setInterpretationRanges] = useState([
    { id: null, min_score: 0, max_score: 10, description: '' },
    { id: null, min_score: 11, max_score: 20, description: '' }
  ]);
  const [isPsiAssessment, setIsPsiAssessment] = useState(false);

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
    
    // Set PSI assessment state
    setIsPsiAssessment(assessment.is_psi_assessment === 1);
    
    // Transform the assessment data to match our form structure
    const transformedQuestions = assessment.questions.map((q, index) => ({
      id: index + 1,
      options: q.options.map(opt => ({
        text: opt.option_text,
        points: parseFloat(opt.points) || 0
      }))
    }));
    
    setQuestions(transformedQuestions);
    
    // Set interpretation ranges if they exist
    if (assessment.interpretation_ranges && assessment.interpretation_ranges.length > 0) {
      setInterpretationRanges(assessment.interpretation_ranges);
    } else {
      // Default ranges if none exist
      setInterpretationRanges([
        { id: null, min_score: 0, max_score: 10, description: '' },
        { id: null, min_score: 11, max_score: 20, description: '' }
      ]);
    }
    
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
          setPublishButtonLoading(true);
          
          const formattedData = {
            title: values.title,
            description: values.description || '',
            is_psi_assessment: isPsiAssessment ? 1 : 0,
            questions: questions.map((q, index) => ({
              question_text: values.questions[index]?.prompt || '',
              options: q.options.map(opt => ({
                option_text: opt.text,
                points: opt.points || 0
              }))
            })),
            interpretation_ranges: interpretationRanges.map(range => ({
              id: range.id, // Include id if it exists (for updates)
              min_score: range.min_score,
              max_score: range.max_score,
              description: range.description
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
          setPublishButtonLoading(false);
        }
      })
      .catch(error => {
        console.error('Form validation failed:', error);
        message.error('Please fill in all required fields');
      });
  };

  const handleAddRange = () => {
    const lastRange = interpretationRanges[interpretationRanges.length - 1];
    const newMinScore = lastRange.max_score + 1;
    const newMaxScore = newMinScore + 9;
    setInterpretationRanges([
      ...interpretationRanges,
      { id: null, min_score: newMinScore, max_score: newMaxScore, description: '' }
    ]);
  };

  const handleRangeChange = (index, field, value) => {
    const updatedRanges = [...interpretationRanges];
    updatedRanges[index][field] = value;
    setInterpretationRanges(updatedRanges);
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
    setInterpretationRanges([
      { id: null, min_score: 0, max_score: 10, description: '' },
      { id: null, min_score: 11, max_score: 20, description: '' }
    ]);
    setSelectedAssessment(null);
    setIsEditMode(false);
    setIsPsiAssessment(false);
  };

  const handleCloseDrawer = () => {
    setCreateDrawerVisible(false);
    resetForm();
  };

  // Update the handlePointChange function to automatically add options
  const handlePointChange = (questionIndex, optionIndex, value) => {
    const numValue = parseInt(value) || 0;
    const newQuestions = [...questions];
    
    // Set the current option's points
    newQuestions[questionIndex].options[optionIndex].points = numValue;
    
    // If this is the first option (index 0) and has a value > 1
    if (optionIndex === 0 && numValue > 1) {
      const currentOptions = newQuestions[questionIndex].options;
      const currentLength = currentOptions.length;
      
      // First, update existing options with descending values
      for (let i = 1; i < currentLength; i++) {
        const autoValue = Math.max(numValue - i, 0);
        currentOptions[i].points = autoValue;
      }
      
      // If the first value is greater than the number of options,
      // add new options with descending values until we reach 1
      if (numValue > currentLength) {
        for (let i = currentLength; i < numValue; i++) {
          const pointValue = numValue - i;
          if (pointValue >= 1) {
            currentOptions.push({
              text: `Option ${i + 1}`,
              points: pointValue
            });
          }
        }
      }
    }
    
    setQuestions(newQuestions);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Assessments</h1>

      <div className={styles.actionBar}>
        <DatePicker.RangePicker className={styles.datePicker} />
        <Space>
          {/* <Button icon={<FilterOutlined />}>Filter</Button> */}
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

          {/* Add PSI Assessment Switch */}
          <Form.Item
            label="PSI Assessment"
            className={styles.psiSwitch}
          >
            <div className={styles.psiSwitchContainer}>
              <Switch
                checked={isPsiAssessment}
                onChange={(checked) => setIsPsiAssessment(checked)}
                disabled={selectedAssessment && !isEditMode}
              />
              <span className={styles.psiSwitchLabel}>
                {isPsiAssessment ? 'This is a PSI assessment' : 'This is a regular assessment'}
              </span>
            </div>
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
                        handlePointChange(questionIndex, optionIndex, e.target.value);
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

          {/* Interpretation Range Section */}
          <div className={styles.interpretationRangeSection}>
            <h3 className={styles.sectionTitle}>Interpretation Range</h3>
            
            {interpretationRanges.map((range, index) => (
              <div key={index} className={styles.rangeRow}>
                <div className={styles.rangeInputs}>
                  <span className={styles.rangeLabel}>Low range</span>
                  <Input 
                    value={range.min_score} 
                    onChange={(e) => handleRangeChange(index, 'min_score', parseInt(e.target.value) || 0)}
                    className={styles.rangeInput}
                    disabled={selectedAssessment && !isEditMode}
                  />
                  <span className={styles.rangeDivider}>—</span>
                  <span className={styles.rangeLabel}>High range</span>
                  <Input 
                    value={range.max_score} 
                    onChange={(e) => handleRangeChange(index, 'max_score', parseInt(e.target.value) || 0)}
                    className={styles.rangeInput}
                    disabled={selectedAssessment && !isEditMode}
                  />
                </div>
                <div className={styles.rangeDescription}>
                  <span className={styles.descriptionLabel}>Description</span>
                  <Input.TextArea 
                    value={range.description}
                    onChange={(e) => handleRangeChange(index, 'description', e.target.value)}
                    placeholder="Enter description for this score range"
                    rows={2}
                    disabled={selectedAssessment && !isEditMode}
                  />
                </div>
                {(isEditMode || !selectedAssessment) && index > 0 && (
                  <Button 
                    type="text" 
                    danger
                    icon={<DeleteOutlined />}
                    className={styles.removeRangeBtn}
                    onClick={() => {
                      const updatedRanges = [...interpretationRanges];
                      updatedRanges.splice(index, 1);
                      setInterpretationRanges(updatedRanges);
                    }}
                  />
                )}
              </div>
            ))}
            
            {(isEditMode || !selectedAssessment) && (
              <Button 
                type="dashed" 
                onClick={handleAddRange} 
                className={styles.addRangeBtn}
              >
                + Add Range
              </Button>
            )}
          </div>

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
