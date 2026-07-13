import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber, Button, message, Typography } from "antd";
import dayjs from "dayjs";
import { prodeskGetMaintenanceMode, prodeskSetMaintenanceMode } from "../../services/api";
import styles from "./ProdeskMaintenance.module.css";

const { TextArea } = Input;
const { Text } = Typography;

const ProdeskMaintenance = () => {
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [form] = Form.useForm();

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await prodeskGetMaintenanceMode();
      if (response.status) {
        setCurrent(response.data);
        setIsActive(!!response.data?.is_active);
      }
    } catch (error) {
      message.error("Failed to fetch maintenance status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleActivate = async (values) => {
    try {
      setSubmitLoading(true);
      const response = await prodeskSetMaintenanceMode({
        is_active: 1,
        message: values.message,
        duration_minutes: values.duration_minutes,
      });
      if (response.status) {
        message.success("Maintenance mode activated");
        form.resetFields();
        fetchStatus();
      } else {
        message.error(response.message || "Failed to activate maintenance mode");
      }
    } catch (error) {
      message.error("Failed to activate maintenance mode: " + (error.message || "Unknown error"));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      setSubmitLoading(true);
      const response = await prodeskSetMaintenanceMode({ is_active: 0 });
      if (response.status) {
        message.success("Maintenance mode deactivated");
        fetchStatus();
      }
    } catch (error) {
      message.error("Failed to deactivate maintenance mode");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Prodesk Maintenance Mode</h1>
      </div>

      <div className={styles.card}>
        {isActive && current?.ends_at ? (
          <div className={styles.status}>
            <Text strong>Maintenance is currently active</Text>
            <div>{current.message}</div>
            <div>Ends at: {dayjs(current.ends_at).format("MMM D, YYYY hh:mm A")}</div>
            <Button danger style={{ marginTop: 12 }} loading={submitLoading} onClick={handleDeactivate}>
              End Maintenance Now
            </Button>
          </div>
        ) : (
          <div className={styles.statusInactive}>
            <Text strong>No active maintenance window</Text>
          </div>
        )}

        {!isActive && (
          <Form form={form} layout="vertical" onFinish={handleActivate}>
            <Form.Item
              name="message"
              label="Maintenance Message"
              rules={[{ required: true, message: "Please enter a message" }, { max: 500 }]}
            >
              <TextArea rows={3} placeholder="e.g. We're upgrading Prodesk. Back shortly." />
            </Form.Item>

            <Form.Item
              name="duration_minutes"
              label="Duration (minutes)"
              rules={[{ required: true, message: "Please enter duration in minutes" }]}
            >
              <InputNumber min={1} max={1440} style={{ width: "100%" }} placeholder="e.g. 30" />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={submitLoading || loading}>
              Activate Maintenance Mode
            </Button>
          </Form>
        )}
      </div>
    </div>
  );
};

export default ProdeskMaintenance;
