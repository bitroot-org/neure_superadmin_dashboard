import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Modal, Typography, Space, Divider } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import './PasswordChange.css';

const { Text } = Typography;

const PasswordChange = ({ visible, onClose, onSubmit, isFirstLogin = false, onSkip }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [validationStatus, setValidationStatus] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false
  });

  // Update validation status whenever password changes
  useEffect(() => {
    if (newPassword) {
      setValidationStatus({
        length: newPassword.length >= 8,
        lowercase: /[a-z]/.test(newPassword),
        uppercase: /[A-Z]/.test(newPassword),
        number: /[0-9]/.test(newPassword),
        special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)
      });
    } else {
      setValidationStatus({
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        special: false
      });
    }
  }, [newPassword]);

  // Password validation rules - only validate on submit
  const validatePassword = (_, value) => {
    if (!value) return Promise.reject('Please input your password!');
    
    const hasLowerCase = /[a-z]/.test(value);
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);
    
    if (value.length < 8) return Promise.reject('Password must be at least 8 characters');
    if (!hasLowerCase) return Promise.reject('Password must contain a lowercase letter');
    if (!hasUpperCase) return Promise.reject('Password must contain an uppercase letter');
    if (!hasNumber) return Promise.reject('Password must contain a number');
    if (!hasSpecialChar) return Promise.reject('Password must contain a special character');
    
    return Promise.resolve();
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      form.resetFields();
      if (!isFirstLogin) onClose();
    } catch (error) {
      console.error("Password change error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation status indicator
  const ValidationItem = ({ satisfied, text }) => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
      {satisfied ? 
        <CheckCircleFilled style={{ color: '#52c41a', marginRight: '8px' }} /> : 
        <CloseCircleFilled style={{ color: '#ff4d4f', marginRight: '8px' }} />
      }
      <Text style={{ color: satisfied ? '#52c41a' : '#ff4d4f' }}>{text}</Text>
    </div>
  );

  return (
    <Modal
      title="Change Password"
      open={visible}
      onCancel={isFirstLogin ? null : onClose}
      footer={null}
      closable={!isFirstLogin}
      maskClosable={!isFirstLogin}
      className="password-change-modal"
      width={400}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        validateTrigger="onSubmit" // Only validate on submit
      >
        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[{ required: true, message: 'Please input your current password!' }]}
        >
          <Input.Password placeholder="Enter current password" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { validator: validatePassword }
          ]}
          validateTrigger="onSubmit" // Only validate on submit
        >
          <Input.Password 
            placeholder="Enter new password" 
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Form.Item>

        {/* Password requirements */}
        <div className="password-requirements">
          <ValidationItem satisfied={validationStatus.length} text="At least 8 characters" />
          <ValidationItem satisfied={validationStatus.lowercase} text="At least 1 lowercase letter" />
          <ValidationItem satisfied={validationStatus.uppercase} text="At least 1 uppercase letter" />
          <ValidationItem satisfied={validationStatus.number} text="At least 1 number" />
          <ValidationItem satisfied={validationStatus.special} text="At least 1 special character" />
        </div>

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('The two passwords do not match!');
              },
            }),
          ]}
          validateTrigger="onSubmit" // Only validate on submit
        >
          <Input.Password placeholder="Confirm new password" />
        </Form.Item>

        <Divider />
        
        <Form.Item className="form-buttons">
          <Space>
            {isFirstLogin && onSkip && (
              <Button onClick={onSkip} disabled={isSubmitting}>
                Skip for now
              </Button>
            )}
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Change Password
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PasswordChange;
