// ResetPassword Page
import React, { useState, useEffect, FormEvent } from 'react';
import { Form, Input, Button, Card, message, Progress, List } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { resetPasswordWithToken } from '../../services/api';
import styles from './ResetPassword.module.css';

interface ValidationErrors {
  length: boolean;
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  special: boolean;
  match: boolean;
}

const criteria = [
  { key: 'length', label: 'At least 8 characters' },
  { key: 'lowercase', label: 'Contains lowercase letter' },
  { key: 'uppercase', label: 'Contains uppercase letter' },
  { key: 'number', label: 'Contains number' },
  { key: 'special', label: 'Contains special character' },
  { key: 'match', label: 'Passwords match' },
] as const;

type CriteriaKey = typeof criteria[number]['key'];

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    length: true,
    lowercase: true,
    uppercase: true,
    number: true,
    special: true,
    match: true,
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';

  useEffect(() => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNum = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    const errors: ValidationErrors = {
      length: password.length < 8,
      lowercase: !hasLower,
      uppercase: !hasUpper,
      number: !hasNum,
      special: !hasSpecial,
      match: password !== confirmPassword || confirmPassword === '',
    };

    setValidationErrors(errors);

    const hasError = Object.values(errors).some((v) => v);
    setIsFormValid(!hasError);
  }, [password, confirmPassword]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    try {
      const response = await resetPasswordWithToken(token, password);
      if (response.status) {
        message.success('Password reset successfully');
        navigate('/login');
      } else {
        message.error(response.message || 'Failed to reset password');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const successCount = Object.values(validationErrors).filter((v) => !v).length;
  const progressPercent = Math.round((successCount / 6) * 100);

  const passwordErrorMsg = password.length > 0 && [
    validationErrors.length && 'At least 8 characters',
    validationErrors.lowercase && 'Contains lowercase letter',
    validationErrors.uppercase && 'Contains uppercase letter',
    validationErrors.number && 'Contains number',
    validationErrors.special && 'Contains special character',
  ].filter(Boolean).join(', ') || '';

  // Only show criteria that are not met
  const failedCriteria = criteria.filter(item => 
    validationErrors[item.key as keyof ValidationErrors]
  );

  return (
    <div className={styles.container}>
      <Card title="Reset Password" className={styles.card}>
        <form onSubmit={handleSubmit}>
          <Form.Item
            validateStatus={passwordErrorMsg ? 'error' : 'success'}
            help={passwordErrorMsg}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="New Password"
              size="large"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            validateStatus={validationErrors.match ? 'error' : 'success'}
            help={validationErrors.match ? 'Passwords do not match' : ''}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
              size="large"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Item>

          <Progress percent={progressPercent} showInfo={false} style={{ marginBottom: 12 }} />
          {failedCriteria.length > 0 && (
            <List
              size="small"
              dataSource={failedCriteria}
              renderItem={(item) => (
                <List.Item className={styles.invalid}>
                  {item.label}
                </List.Item>
              )}
            />
          )}
          <Form.Item style={{ marginTop: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              disabled={!isFormValid || loading}
              onClick={handleSubmit}
            >
              Reset Password
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

export default ResetPasswordPage;
