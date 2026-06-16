import React, { useState, useEffect, useCallback } from "react";
import {
  Table, Select, DatePicker, Space, Tag, Button, Input,
  Typography, message, Tooltip,
} from "antd";
import { SearchOutlined, ReloadOutlined, FileTextOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { prodeskGetSessions, prodeskGetTherapists } from "../../services/api";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const STATUS_COLORS = {
  scheduled: "blue",
  completed: "green",
  cancelled: "red",
  no_show: "orange",
};

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [therapistFilter, setTherapistFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState(null);

  const [therapistOptions, setTherapistOptions] = useState([]);

  const fetchTherapistList = useCallback(async () => {
    try {
      const res = await prodeskGetTherapists({ page: 1, limit: 200 });
      setTherapistOptions(res?.data || []);
    } catch {
      // non-critical
    }
  }, []);

  const fetchSessions = useCallback(async (p = 1, therapist_id = null, status = "", dr = null) => {
    setLoading(true);
    try {
      const res = await prodeskGetSessions({
        page: p,
        limit: 10,
        therapist_id,
        status,
        start_date: dr?.[0] ? dr[0].format("YYYY-MM-DD") : "",
        end_date: dr?.[1] ? dr[1].format("YYYY-MM-DD") : "",
      });
      setSessions(res?.data || []);
      setTotal(res?.meta?.total || 0);
    } catch {
      message.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTherapistList();
    fetchSessions();
  }, [fetchTherapistList, fetchSessions]);

  const handleSearch = () => {
    setPage(1);
    fetchSessions(1, therapistFilter, statusFilter, dateRange);
  };

  const handleReset = () => {
    setTherapistFilter(null); setStatusFilter(""); setDateRange(null); setPage(1);
    fetchSessions(1, null, "", null);
  };

  const columns = [
    {
      title: "Therapist",
      dataIndex: "therapist_name",
      key: "therapist_name",
      render: v => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: "Client",
      dataIndex: "client_name",
      key: "client_name",
    },
    {
      title: "Session #",
      dataIndex: "session_number",
      key: "session_number",
      render: v => `#${v}`,
    },
    {
      title: "Date & Time",
      dataIndex: "starts_at",
      key: "starts_at",
      render: v => v ? dayjs(v).format("DD MMM YYYY, HH:mm") : "—",
    },
    {
      title: "Duration",
      dataIndex: "duration_min",
      key: "duration_min",
      render: v => v ? `${v} min` : "—",
    },
    {
      title: "Modality",
      dataIndex: "modality",
      key: "modality",
      render: v => v ? <Tag>{v}</Tag> : "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: v => <Tag color={STATUS_COLORS[v] || "default"}>{v || "—"}</Tag>,
    },
    {
      title: "Fee",
      dataIndex: "fee",
      key: "fee",
      render: v => v != null ? `₹${Number(v).toLocaleString()}` : "—",
    },
    {
      title: "Note",
      key: "has_note",
      render: (_, r) => r.has_note ? (
        <Tooltip title={r.note_preview || "Session note available"}>
          <FileTextOutlined style={{ color: "#1677ff", fontSize: 16 }} />
        </Tooltip>
      ) : <span style={{ color: "#ccc" }}>—</span>,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>Session Details</Title>
        <p style={{ margin: 0, color: "#888", fontSize: 13 }}>
          All sessions across all ProDesk psychologists
        </p>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          showSearch
          allowClear
          placeholder="All Therapists"
          value={therapistFilter}
          onChange={v => setTherapistFilter(v)}
          style={{ width: 220 }}
          filterOption={(input, option) =>
            option?.children?.toLowerCase().includes(input.toLowerCase())
          }
        >
          {therapistOptions.map(t => (
            <Option key={t.therapist_id || t.user_id} value={t.therapist_id || t.user_id}>
              {t.name || `${t.first_name} ${t.last_name}`}
            </Option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={v => setStatusFilter(v)}
          style={{ width: 160 }}
          placeholder="All Statuses"
        >
          <Option value="">All Statuses</Option>
          <Option value="scheduled">Scheduled</Option>
          <Option value="completed">Completed</Option>
          <Option value="cancelled">Cancelled</Option>
          <Option value="no_show">No Show</Option>
        </Select>
        <RangePicker value={dateRange} onChange={setDateRange} format="YYYY-MM-DD" />
        <Button type="primary" onClick={handleSearch}>Search</Button>
        <Button icon={<ReloadOutlined />} onClick={handleReset} />
      </Space>

      <Table
        columns={columns}
        dataSource={sessions}
        rowKey="session_id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: 10,
          total,
          onChange: p => { setPage(p); fetchSessions(p, therapistFilter, statusFilter, dateRange); },
          showTotal: t => `Total ${t} sessions`,
        }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default Sessions;
