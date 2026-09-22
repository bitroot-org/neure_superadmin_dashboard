import React, { useEffect, useState } from "react";
import { Modal, Switch, Button } from "antd";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import celebration from "../../assets/lottie/celebration.lottie?url";
import { RELEASE_NOTES } from "../../config/releaseNotes";
import { WHATS_NEW_DISMISSED_KEY, WHATS_NEW_PENDING_KEY } from "../../utils/storage";
import styles from "./WhatsNew.module.css";

const shouldShow = () => {
  try {
    const justSignedIn = sessionStorage.getItem(WHATS_NEW_PENDING_KEY) === "1";
    const dismissed = localStorage.getItem(WHATS_NEW_DISMISSED_KEY) === RELEASE_NOTES.version;
    // First sign-in shows the mandatory password change instead — don't stack popups.
    const firstLogin = localStorage.getItem("isFirstLogin") === "true";
    return justSignedIn && !dismissed && !firstLogin;
  } catch {
    return false;
  }
};

const WhatsNew = () => {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (shouldShow()) setOpen(true);
  }, []);

  const close = () => {
    try {
      sessionStorage.removeItem(WHATS_NEW_PENDING_KEY);
      if (dontShowAgain) localStorage.setItem(WHATS_NEW_DISMISSED_KEY, RELEASE_NOTES.version);
    } catch {
      /* storage unavailable — the popup simply shows again next sign-in */
    }
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      centered
      width={420}
      className={styles.modal}
      maskClosable={false}
      destroyOnClose
    >
      <div className={styles.hero}>
        <DotLottieReact src={celebration} autoplay className={styles.lottie} />
      </div>

      <div className={styles.body}>
        <span className={styles.version}>Version {RELEASE_NOTES.version}</span>
        <h2 className={styles.title}>{RELEASE_NOTES.title}</h2>
        <p className={styles.description}>{RELEASE_NOTES.description}</p>
      </div>

      <div className={styles.footer}>
        <label className={styles.toggle}>
          <Switch size="small" checked={dontShowAgain} onChange={setDontShowAgain} />
          <span>Don't show this again</span>
        </label>
        <Button type="primary" onClick={close}>
          Got it
        </Button>
      </div>
    </Modal>
  );
};

export default WhatsNew;
