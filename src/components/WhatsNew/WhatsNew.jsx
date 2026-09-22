import React, { useEffect, useRef, useState } from "react";
import { Modal, Switch, Button } from "antd";
import { DotLottieReact, setWasmUrl } from "@lottiefiles/dotlottie-react";
import wasmUrl from "@lottiefiles/dotlottie-web/dotlottie-player.wasm?url";
import dayjs from "dayjs";
import celebration from "../../assets/lottie/celebration.lottie?url";
import { RELEASE_NOTES } from "../../config/releaseNotes";
import { WHATS_NEW_DISMISSED_KEY, WHATS_NEW_PENDING_KEY } from "../../utils/storage";
import styles from "./WhatsNew.module.css";

// Serve the Lottie renderer from our own bundle instead of a public CDN.
setWasmUrl(wasmUrl);

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
  const lottieRef = useRef(null);

  useEffect(() => {
    if (shouldShow()) setOpen(true);
  }, []);

  // The canvas measures itself while the modal is still zooming in (scaled down),
  // which renders it blurry — re-measure once it's at full size.
  const resizeLottie = () => {
    try { lottieRef.current?.resize(); } catch { /* player not ready yet */ }
  };

  const replay = () => {
    const player = lottieRef.current;
    if (!player) return;
    player.stop();
    player.play();
  };

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
      width={520}
      className={styles.modal}
      maskClosable={false}
      destroyOnClose
      afterOpenChange={(isOpen) => { if (isOpen) resizeLottie(); }}
    >
      <div className={styles.hero}>
        <DotLottieReact
          src={celebration}
          autoplay
          className={styles.lottie}
          layout={{ fit: "cover", align: [0.5, 0.5] }}
          renderConfig={{ autoResize: true, devicePixelRatio: Math.min(window.devicePixelRatio || 1, 3) }}
          dotLottieRefCallback={(player) => {
            lottieRef.current = player;
            player?.addEventListener("load", resizeLottie);
          }}
        />
      </div>

      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.version}>v{RELEASE_NOTES.version}</span>
          {RELEASE_NOTES.date && (
            <span className={styles.date}>{dayjs(RELEASE_NOTES.date).format("MMM D, YYYY")}</span>
          )}
          <button type="button" className={styles.replay} onClick={replay}>
            Replay
          </button>
        </div>
        <h2 className={styles.title}>{RELEASE_NOTES.title}</h2>
        <p className={styles.description}>{RELEASE_NOTES.description}</p>
      </div>

      <div className={styles.footer}>
        <label className={styles.toggle}>
          <Switch size="small" checked={dontShowAgain} onChange={setDontShowAgain} />
          <span>Don't show this again</span>
        </label>
        <Button type="primary" size="large" onClick={close}>
          Got it
        </Button>
      </div>
    </Modal>
  );
};

export default WhatsNew;
