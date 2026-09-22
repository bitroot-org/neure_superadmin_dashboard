// Shared building blocks for the card-style detail drawers
// (Payments, Subscriptions, Codes & Promotions).
import React from "react";
import { Drawer, Spin, Typography } from "antd";
import dayjs from "dayjs";
import styles from "./DetailDrawer.module.css";

const { Text } = Typography;

export const formatINR = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

export const formatDate = (v, { time = false, seconds = false } = {}) => {
  if (!v) return null;
  if (seconds) return dayjs(v).format("DD MMM YYYY, HH:mm:ss");
  return dayjs(v).format(time ? "DD MMM YYYY, HH:mm" : "DD MMM YYYY");
};

export const initials = (name = "") =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "?";

// tone: "success" | "error" | "warning" | "pending"
export const StatusBadge = ({ tone = "pending", children }) => (
  <span className={`${styles.badge} ${styles[tone] || styles.pending}`}>
    <span className={styles.badgeDot} />
    {children}
  </span>
);

export const DetailDrawer = ({ title, badge, open, onClose, loading, empty = "No data available", children, width = 480 }) => (
  <Drawer
    title={
      <div className={styles.drawerTitle}>
        <span className={styles.drawerTitleText}>{title}</span>
        {badge}
      </div>
    }
    width={width}
    open={open}
    onClose={onClose}
    className={styles.drawer}
  >
    {loading ? (
      <div className={styles.loading}><Spin /></div>
    ) : children ? (
      <div className={styles.stack}>{children}</div>
    ) : (
      <div className={styles.empty}>{empty}</div>
    )}
  </Drawer>
);

export const Section = ({ title, extra, children, className = "" }) => (
  <section className={`${styles.section} ${className}`}>
    {(title || extra) && (
      <header className={styles.sectionHeader}>
        <span>{title}</span>
        {extra}
      </header>
    )}
    {children}
  </section>
);

export const Count = ({ children }) => <span className={styles.count}>{children}</span>;

export const Summary = ({ label, value, suffix, meta, children }) => (
  <section className={`${styles.section} ${styles.summary}`}>
    {label && <span className={styles.summaryLabel}>{label}</span>}
    <span className={styles.amount}>
      {value}
      {suffix && <span className={styles.amountSuffix}>{suffix}</span>}
    </span>
    {meta && <div className={styles.summaryMeta}>{meta}</div>}
    {children}
  </section>
);

// Thin progress bar with a caption, e.g. billing period or offer validity.
export const Progress = ({ percent, caption, tone = "success" }) => (
  <div className={styles.progress}>
    <div className={styles.progressTrack}>
      <div
        className={`${styles.progressFill} ${styles[`fill_${tone}`] || ""}`}
        style={{ transform: `scaleX(${Math.max(0, Math.min(1, (percent || 0) / 100))})` }}
      />
    </div>
    {caption && <span className={styles.progressCaption}>{caption}</span>}
  </div>
);

export const Person = ({ name, email, extra }) => (
  <div className={styles.customer}>
    <span className={styles.avatar}>{initials(name)}</span>
    <div className={styles.customerText}>
      <span className={styles.customerName}>{name || "—"}</span>
      {email && <span className={styles.customerEmail}>{email}</span>}
    </div>
    {extra}
  </div>
);

export const Field = ({ label, value, copyable, mono }) => (
  <div className={styles.field}>
    <span className={styles.fieldLabel}>{label}</span>
    {value || value === 0 ? (
      copyable || mono ? (
        <Text
          className={`${styles.fieldValue} ${mono ? styles.mono : ""}`}
          copyable={copyable ? { text: String(value) } : false}
        >
          {value}
        </Text>
      ) : (
        <span className={styles.fieldValue}>{value}</span>
      )
    ) : (
      <span className={styles.fieldEmpty}>—</span>
    )}
  </div>
);

export const Mono = ({ children, copy }) => (
  <Text className={styles.mono} copyable={copy ? { text: String(copy) } : false}>{children}</Text>
);

// Vertical timeline. Items are rendered in the order given — sort before passing.
export const Timeline = ({ children }) => <ol className={styles.timeline}>{children}</ol>;

export const TimelineItem = ({ tone = "pending", label, time, children }) => (
  <li className={`${styles.timelineItem} ${styles[`dot_${tone}`] || styles.dot_pending}`}>
    <span className={styles.timelineDot} aria-hidden="true" />
    <div className={styles.timelineHead}>
      <span className={styles.attemptNo}>{label}</span>
      {time && <span className={styles.attemptTime}>{time}</span>}
    </div>
    {children}
  </li>
);

export const Row = ({ left, right }) => (
  <div className={styles.attemptTop}>
    {left}
    {right}
  </div>
);

export const Amount = ({ children }) => <span className={styles.attemptAmount}>{children}</span>;

export const Meta = ({ label, children }) => (
  <div className={styles.attemptMeta}>
    <span>{label}</span>
    {children}
  </div>
);

// Sort helper for timelines: oldest first by the first present date field.
export const byDateAsc = (...keys) => (a, b) => {
  const t = (x) => dayjs(keys.map((k) => x[k]).find(Boolean)).valueOf() || 0;
  return t(a) - t(b);
};

export const List = ({ children }) => <ul className={styles.emailList}>{children}</ul>;

export const ListItem = ({ primary, secondary }) => (
  <li className={styles.emailItem}>
    <span className={styles.emailAddress} title={typeof primary === "string" ? primary : undefined}>{primary}</span>
    {secondary}
  </li>
);

export const Note = ({ children }) => <p className={styles.note}>{children}</p>;
