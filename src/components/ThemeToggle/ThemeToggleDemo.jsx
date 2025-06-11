import React from 'react';
import { Card, Space, Typography, Divider } from 'antd';
import ThemeToggle from './ThemeToggle';

const { Title, Text } = Typography;

/**
 * Demo component showing different ThemeToggle variants
 * This is for demonstration purposes and can be used in a settings page
 */
const ThemeToggleDemo = () => {
  return (
    <Card title="Theme Toggle Variants" style={{ maxWidth: 600, margin: '20px auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        <div>
          <Title level={5}>Button Variant (Default)</Title>
          <Text type="secondary">Simple button with bulb icon</Text>
          <div style={{ marginTop: 8 }}>
            <ThemeToggle variant="button" />
          </div>
        </div>

        <Divider />

        <div>
          <Title level={5}>Switch Variant</Title>
          <Text type="secondary">Toggle switch with sun/moon icons</Text>
          <div style={{ marginTop: 8 }}>
            <ThemeToggle variant="switch" />
          </div>
        </div>

        <Divider />

        <div>
          <Title level={5}>Switch with Labels</Title>
          <Text type="secondary">Switch with separate sun/moon icons</Text>
          <div style={{ marginTop: 8 }}>
            <ThemeToggle variant="switch" showLabels={true} />
          </div>
        </div>

        <Divider />

        <div>
          <Title level={5}>Different Sizes</Title>
          <Text type="secondary">Available in different sizes</Text>
          <div style={{ marginTop: 8 }}>
            <Space>
              <ThemeToggle variant="switch" size="small" />
              <ThemeToggle variant="switch" size="middle" />
              <ThemeToggle variant="switch" size="large" />
            </Space>
          </div>
        </div>

        <Divider />

        <div>
          <Title level={5}>Without Tooltip</Title>
          <Text type="secondary">Toggle without hover tooltip</Text>
          <div style={{ marginTop: 8 }}>
            <ThemeToggle variant="switch" showTooltip={false} />
          </div>
        </div>

      </Space>
    </Card>
  );
};

export default ThemeToggleDemo;
