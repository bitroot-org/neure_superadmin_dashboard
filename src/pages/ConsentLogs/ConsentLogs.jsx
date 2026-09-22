import React, { useState, useEffect } from "react";
import { Table, Typography, Space, DatePicker, Tag, Select, Input, message } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { prodeskGetConsentLogs } from "../../services/api";
import styles from "./ConsentLogs.module.css";

const { RangePicker } = DatePicker;
const { Option } = Select;

const CONSENT_TYPE_LABELS = {
  terms_and_conditions: "Terms & Conditions",
  payment_integration: "Payment Integration",
  google_meet_integration: "Google Meet Integration",
  compliance: "Compliance / Privacy",
  booking_consent: "Booking Consent",
};

const ConsentLogs = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [actorType, setActorType] = useState(null);
  const [consentType, setConsentType] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [search, setSearch] = useState("");

  const fetchLogs = async (page = 1, pageSize = 20, params = {}) => {
    setLoading(true);
    try {
      const response = await prodeskGetConsentLogs({ page, limit: pageSize, ...params });
      if (response.status) {
        setLogs(response.data || []);
        setPagination({ current: page, pageSize, total: response.pagination?.total || 0 });
      } else {
        message.error(response.message || "Failed to fetch consent logs");
        setLogs([]);
      }
    } catch (error) {
      console.error("Error fetching consent logs:", error);
      message.error("Failed to fetch consent logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const currentFilters = () => ({
    actor_type: actorType || undefined,
    consent_type: consentType || undefined,
    search: search || undefined,
    ...(dateRange && dateRange[0] && dateRange[1]
      ? { start_date: dateRange[0].format("YYYY-MM-DD"), end_date: dateRange[1].format("YYYY-MM-DD") }
      : {}),
  });

  const handleTableChange = (newPagination) => {
    fetchLogs(newPagination.current, newPagination.pageSize, currentFilters());
  };

  const handleActorTypeChange = (value) => {
    setActorType(value);
    fetchLogs(1, pagination.pageSize, { ...currentFilters(), actor_type: value || undefined });
  };

  const handleConsentTypeChange = (value) => {
    setConsentType(value);
    fetchLogs(1, pagination.pageSize, { ...currentFilters(), consent_type: value || undefined });
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    const params = { ...currentFilters() };
    if (dates && dates[0] && dates[1]) {
      params.start_date = dates[0].format("YYYY-MM-DD");
      params.end_date = dates[1].format("YYYY-MM-DD");
    } else {
      delete params.start_date;
      delete params.end_date;
    }
    fetchLogs(1, pagination.pageSize, params);
  };

  const handleSearch = (value) => {
    setSearch(value);
    fetchLogs(1, pagination.pageSize, { ...currentFilters(), search: value || undefined });
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "actor_type",
      key: "actor_type",
      render: (type) => <Tag color={type === "therapist" ? "purple" : "blue"}>{type?.toUpperCase()}</Tag>,
    },
    {
      title: "Name / Email",
      key: "identity",
      render: (_, record) => (
        <span>
          {record.therapist_name && <strong>{record.therapist_name}</strong>}
          {record.therapist_name && <br />}
          <span style={{ color: "var(--text-tertiary)" }}>{record.email || "—"}</span>
        </span>
      ),
    },
    {
      title: "Consent",
      dataIndex: "consent_type",
      key: "consent_type",
      render: (type) => <Tag color="green">{CONSENT_TYPE_LABELS[type] || type}</Tag>,
    },
    {
      title: "Version",
      dataIndex: "consent_version",
      key: "consent_version",
    },
    {
      title: "IP Address",
      dataIndex: "ip_address",
      key: "ip_address",
      render: (ip) => ip || "—",
    },
    {
      title: "Agreed At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (
        <span style={{ whiteSpace: "nowrap" }}>
          {dayjs(date).format("MMM D, YYYY")}
          <br />
          <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}>{dayjs(date).format("hh:mm A")}</span>
        </span>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <SafetyCertificateOutlined /> Consent Logs
        </h1>
      </div>

      <div className={styles.actionBar}>
        <Space wrap>
          <Input.Search
            placeholder="Search by email"
            allowClear
            style={{ width: 220 }}
            onSearch={handleSearch}
          />
          <Select
            placeholder="Filter by actor type"
            allowClear
            style={{ width: 180 }}
            onChange={handleActorTypeChange}
            value={actorType}
          >
            <Option value="therapist">Therapist</Option>
            <Option value="client">Client</Option>
          </Select>
          <Select
            placeholder="Filter by consent type"
            allowClear
            style={{ width: 220 }}
            onChange={handleConsentTypeChange}
            value={consentType}
          >
            {Object.entries(CONSENT_TYPE_LABELS).map(([value, label]) => (
              <Option key={value} value={value}>{label}</Option>
            ))}
          </Select>
          <RangePicker onChange={handleDateRangeChange} value={dateRange} />
        </Space>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 900 }}
        />
      </div>
    </div>
  );
};

export default ConsentLogs;
