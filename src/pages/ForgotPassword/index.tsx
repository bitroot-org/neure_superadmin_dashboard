// ForgotPassword Page
import React, { useState, FormEvent } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { forgotPassword } from '../../services/api';
import { Link } from 'react-router-dom';
import styles from './ForgotPassword.module.css';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      message.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const response = await forgotPassword(email);
      if (response.status) {
        message.success('Password reset link sent. Please check your email.');
      } else {
        message.error(response.message || 'Failed to send reset link');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card title="Forgot Password" className={styles.card}>
        <form onSubmit={handleSubmit}>
          <Form.Item>
            <Input
              prefix={<MailOutlined />} 
              placeholder="Email" 
              size="large" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              loading={loading}
              disabled={loading}
              onClick={handleSubmit}
            >
              Send Reset Link
            </Button>
          </Form.Item>
        </form>
        <Link to="/login">
          <ArrowLeftOutlined /> Back to Login
        </Link>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
