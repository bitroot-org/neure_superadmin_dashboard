import React, { useState, FormEvent } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import styles from './Login.module.css';

interface LoginFormData {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Manual form submission handler to avoid any React Router or form issues
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Explicitly prevent default form behavior
    
    if (!username || !password) {
      message.error('Please enter both username and password');
      return;
    }
    
    setLoading(true);
    
    try {
      // Direct API call without using the service
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/user/login`,
        {
          email: username,
          password,
          role_id: 1,
        }
      );
      
      const data = response.data;
      
      if (data.status) {
        const { accessToken, refreshToken, expiresAt, user } = data.data;
        
        // Store tokens and user data
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('expiresAt', expiresAt);
        localStorage.setItem('userData', JSON.stringify(user));
        
        message.success('Login successful!');
        
        // Force a hard navigation
        window.location.href = '/home';
      } else {
        message.error(data.message || 'Login failed');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Extract error message
      const errorMsg = 
        error.response?.data?.message || 
        error.message || 
        'Login failed. Please try again.';
      
      message.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard} title="Admin Login">
        <form onSubmit={handleSubmit}>
          <Form.Item
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              Log in
            </Button>
          </Form.Item>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
