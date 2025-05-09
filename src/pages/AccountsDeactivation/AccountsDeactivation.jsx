import React, { useState, useEffect } from 'react';
import { Typography, Tabs, Table, Tag, Space, Button, message } from 'antd';
import styles from './AccountsDeactivation.module.css';
import { deactivatedCompanies, deactivationRequests, processDeactivationRequest } from '../../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TabPane } = Tabs;

const AccountsDeactivation = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [requestData, setRequestData] = useState([]);
  const [historyData, setHistoryData] = useState([]);

  const fetchDeactivationRequests = async () => {
    setLoading(true);
    try {
      const response = await deactivationRequests();
      if (response.status && response.data) {
        const formattedData = response.data.map(item => ({
          key: item.id,
          companyName: item.company_name,
          requestDate: dayjs(item.created_at).format('YYYY-MM-DD'),
          reason: item.deactivation_reason,
          detailedReason: item.detailed_reason,
          status: item.status,
        }));
        setRequestData(formattedData);
      }
    } catch (error) {
      message.error('Failed to fetch deactivation requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeactivatedCompanies = async () => {
    setLoading(true);
    try {
      const response = await deactivatedCompanies();
      if (response.status && response.data) {
        const formattedData = response.data.map(item => ({
          key: item.id,
          companyName: item.company_name,
          requestDate: dayjs(item.deactivation_request_date).format('YYYY-MM-DD'),
          actionDate: dayjs(item.updated_at).format('YYYY-MM-DD'),
          reason: item.deactivation_reason,
          detailedReason: item.detailed_reason,
          status: item.deactivation_status,
        }));
        setHistoryData(formattedData);
      }
    } catch (error) {
      message.error('Failed to fetch deactivated companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === '1') {
      fetchDeactivationRequests();
    } else {
      fetchDeactivatedCompanies();
    }
  }, [activeTab]);

  const handleProcessRequest = async (requestId, status) => {
    try {
      await processDeactivationRequest({
        request_id: requestId,
        status: status
      });
      message.success(`Request ${status} successfully`);
      fetchDeactivationRequests(); // Refresh the requests list
      if (status === 'approved') {
        fetchDeactivatedCompanies(); // Refresh history if approved
      }
    } catch (error) {
      message.error(`Failed to ${status} request`);
    }
  };

  const requestColumns = [
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: 'Request Date',
      dataIndex: 'requestDate',
      key: 'requestDate',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'pending' ? 'gold' : 'green'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleProcessRequest(record.key, 'approved')}
          >
            Approve
          </Button>
          <Button 
            type="default" 
            danger 
            size="small"
            onClick={() => handleProcessRequest(record.key, 'rejected')}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  const historyColumns = [
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: 'Request Date',
      dataIndex: 'requestDate',
      key: 'requestDate',
    },
    {
      title: 'Action Date',
      dataIndex: 'actionDate',
      key: 'actionDate',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'approved' ? 'green' : 'red'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Accounts Deactivation
        </h1>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
      >
        <TabPane tab="Deactivation Requests" key="1">
          <div className={styles.tabContent}>
            <Table 
              columns={requestColumns} 
              dataSource={requestData}
              className={styles.table}
              pagination={{ pageSize: 10 }}
              loading={loading}
            />
          </div>
        </TabPane>
        <TabPane tab="Deactivation History" key="2">
          <div className={styles.tabContent}>
            <Table 
              columns={historyColumns} 
              dataSource={historyData}
              className={styles.table}
              pagination={{ pageSize: 10 }}
              loading={loading}
            />
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AccountsDeactivation;