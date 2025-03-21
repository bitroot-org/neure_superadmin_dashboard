import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/api';
import styles from './Login.module.css';

interface LoginFormData {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormData) => {
    try {
      const response = await login(values.username, values.password);
      
      if (response.status) {
        const { accessToken, refreshToken, expiresAt, user } = response.data;
        
        // Store tokens and user data
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('expiresAt', expiresAt);
        localStorage.setItem('userData', JSON.stringify(user));
        
        message.success('Login successful!');
        navigate('/home');
      } else {
        message.error(response.message || 'Login failed');
      }
    } catch (error: any) {
      message.error(error.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard} title="Admin Login">
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;