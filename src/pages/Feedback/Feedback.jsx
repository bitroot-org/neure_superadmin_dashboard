import React, { useState, useEffect, useCallback } from "react";
import {
  Table, Input, Select, DatePicker, Space, Tag, Button,
  Drawer, Form, message, Rate, Typography,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { prodeskGetFeedback, prodeskUpdateFeedbackStatus } from "../../services/api";
import styles from "./Feedback.module.css";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const STATUS_COLORS = { new: "blue", reviewed: "orange", resolved: "green" };

const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState(null);

  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();

  const fetchFeedback = useCallback(async (p = 1, s = "", status = "", dr = null) => {
    setLoading(true);
    try {
      const res = await prodeskGetFeedback({
        page: p,
        limit: 10,
        search: s,
        status,
        start_date: dr?.[0] ? dr[0].format("YYYY-MM-DD") : "",
        end_date: dr?.[1] ? dr[1].format("YYYY-MM-DD") : "",
      });
      setFeedback(res?.data || []);
      setTotal(res?.meta?.total || 0);
    } catch {
      message.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeedback(); }, [fetchFeedback]);

  const handleSearch = () => {
    setPage(1);
    fetchFeedback(1, search, statusFilter, dateRange);
  };

  const handleReset = () => {
    setSearch(""); setStatusFilter(""); setDateRange(null); setPage(1);
    fetchFeedback(1, "", "", null);
  };

  const openDrawer = (record) => {
    setSelected(record);
    form.setFieldsValue({
      status: record.status,
      admin_notes: record.admin_notes || "",
    });
    setDrawerOpen(true);
  };

  const handleUpdateStatus = async (values) => {
    setUpdating(true);
    try {
      const res = await prodeskUpdateFeedbackStatus({
        feedback_id: selected.id,
        status: values.status,
        admin_notes: values.admin_notes || "",
      });
      if (res?.status) {
        message.success("Feedback status updated");
        setDrawerOpen(false);
        fetchFeedback(page, search, statusFilter, dateRange);
      } else {
        message.error(res?.message || "Failed to update");
      }
    } catch {
      message.error("Failed to update feedback status");
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      title: "Therapist",
      key: "therapist",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.therapist_name}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{r.therapist_email}</div>
        </div>
      ),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: v => v || "—",
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: v => v ? <Rate disabled defaultValue={v} style={{ fontSize: 13 }} /> : "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: v => <Tag color={STATUS_COLORS[v] || "default"}>{v || "new"}</Tag>,
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: v => v ? dayjs(v).format("DD MMM YYYY, HH:mm") : "—",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button type="link" onClick={() => openDrawer(record)}>View / Update</Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>Feedback</Title>
        <p style={{ margin: 0, color: "#888", fontSize: 13 }}>Feedback submitted by ProDesk psychologists</p>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Search therapist / subject"
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 240 }}
        />
        <Select value={statusFilter} onChange={v => setStatusFilter(v)} style={{ width: 150 }} placeholder="All Statuses">
          <Option value="">All Statuses</Option>
          <Option value="new">New</Option>
          <Option value="reviewed">Reviewed</Option>
          <Option value="resolved">Resolved</Option>
        </Select>
        <RangePicker value={dateRange} onChange={setDateRange} format="YYYY-MM-DD" />
        <Button type="primary" onClick={handleSearch}>Search</Button>
        <Button icon={<ReloadOutlined />} onClick={handleReset} />
      </Space>

      <Table
        columns={columns}
        dataSource={feedback}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: 10,
          total,
          onChange: p => { setPage(p); fetchFeedback(p, search, statusFilter, dateRange); },
          showTotal: t => `Total ${t} feedback`,
        }}
        scroll={{ x: "max-content" }}
      />

      <Drawer
        title="Feedback Detail"
        width={520}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {selected && (
          <div>
            <div style={{ marginBottom: 16, padding: 16, background: "rgba(0,0,0,0.03)", borderRadius: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{selected.therapist_name}</div>
              <div style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>{selected.therapist_email}</div>
              {selected.rating && <Rate disabled defaultValue={selected.rating} style={{ fontSize: 14, marginBottom: 8 }} />}
              {selected.subject && <div style={{ fontWeight: 500, marginBottom: 4 }}>{selected.subject}</div>}
              <div style={{ color: "#555", lineHeight: 1.6 }}>{selected.message}</div>
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 8 }}>
                {dayjs(selected.created_at).format("DD MMM YYYY, HH:mm")}
              </div>
            </div>

            <Form form={form} layout="vertical" onFinish={handleUpdateStatus}>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select>
                  <Option value="new">New</Option>
                  <Option value="reviewed">Reviewed</Option>
                  <Option value="resolved">Resolved</Option>
                </Select>
              </Form.Item>
              <Form.Item name="admin_notes" label="Admin Notes">
                <TextArea rows={4} placeholder="Add internal notes about this feedback..." />
              </Form.Item>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={updating}>Update Status</Button>
              </div>
            </Form>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Feedback;
