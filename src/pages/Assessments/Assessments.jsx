import React, { useState } from 'react';
import { Table, Button, Space, DatePicker, Drawer, Form, Input, message } from 'antd';
import { FilterOutlined, PlusOutlined, ArrowLeftOutlined, CloseOutlined } from '@ant-design/icons';
import styles from './Assessments.module.css';

const Assessments = () => {
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [questions, setQuestions] = useState([{ id: 1, options: ['Option 1', 'Option 2'] }]);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Date published',
      dataIndex: 'datePublished',
      key: 'datePublished',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'CTA 1',
      key: 'cta1',
      render: () => <Button type="link">Preview</Button>,
    },
    {
      title: 'CTA 2',
      key: 'cta2',
      render: () => <Button type="link">...</Button>,
    },
  ];

  const handleAddQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      options: ['Option 1', 'Option 2'],
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleAddOption = (questionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: [...q.options, `Option ${q.options.length + 1}`],
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
      .then(values => {
        console.log('Form values:', values);
        message.success('Assessment published successfully');
        setCreateDrawerVisible(false);
        form.resetFields();
        setQuestions([{ id: 1, options: ['Option 1', 'Option 2'] }]);
      })
      .catch(error => {
        console.log('Validation failed:', error);
      });
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
            onClick={() => setCreateDrawerVisible(true)}
          >
            Add new
          </Button>
        </Space>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          dataSource={[]}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
        />
      </div>

      <Drawer
        title={
          <Space>
            <ArrowLeftOutlined onClick={() => setCreateDrawerVisible(false)} />
            Add new assessment
          </Space>
        }
        width={720}
        onClose={() => setCreateDrawerVisible(false)}
        open={createDrawerVisible}
      >
        <Form
          form={form}
          layout="vertical"
          className={styles.assessmentForm}
        >
          <Form.Item
            name="title"
            label="Assessment title"
            rules={[{ required: true, message: 'Please enter assessment title' }]}
          >
            <Input placeholder="Enter assessment title" />
          </Form.Item>

          {questions.map((question, questionIndex) => (
            <div key={question.id} className={styles.questionBox}>
              <Form.Item
                name={['questions', questionIndex, 'prompt']}
                label={`Question ${questionIndex + 1}`}
                rules={[{ required: true, message: 'Please enter question' }]}
              >
                <Input placeholder="Question/ prompt" />
              </Form.Item>

              <div className={styles.optionsContainer}>
                <div className={styles.optionsLabel}>Answer</div>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className={styles.optionRow}>
                    <Input 
                      placeholder={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[questionIndex].options[optionIndex] = e.target.value;
                        setQuestions(newQuestions);
                      }}
                    />
                    <CloseOutlined
                      className={styles.removeOption}
                      onClick={() => handleRemoveOption(question.id, optionIndex)}
                    />
                  </div>
                ))}
                <Button 
                  type="link" 
                  className={styles.addOptionBtn}
                  onClick={() => handleAddOption(question.id)}
                >
                  + Add option
                </Button>
              </div>
            </div>
          ))}

          <Button 
            type="dashed" 
            block 
            className={styles.addQuestionBtn}
            onClick={handleAddQuestion}
          >
            + Add question
          </Button>

          <Button 
            type="primary" 
            block 
            className={styles.publishBtn}
            onClick={handlePublish}
          >
            Publish
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default Assessments;