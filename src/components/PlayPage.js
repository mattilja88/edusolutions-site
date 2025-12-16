import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * PlayPage
 * Käyttö:
 * <PlayPage gameId="math-master" onExit={() => navigate("/")} />
 *
 * Tai ilman routeria:
 * <PlayPage gameUrl="https://..." title="MathMaster" onExit={() => window.location.href="/"} />
 */
export default function PlayPage({ gameId, gameUrl, title, onExit }) {
  const iframeRef = useRef(null);

  // Valitse peli joko gameId:llä tai suoraan gameUrl:lla
  const game = useMemo(() => {
    const games = [
      {
        title: "MathMaster",
        gameId: "math-master",
        url: "https://storage.googleapis.com/mathmaster-136c9.firebasestorage.app/Mathmaster/index.html",
      },
      {
        title: "MathBirdAdventure",
        gameId: "math-bird",
        url: "https://storage.googleapis.com/mathmaster-136c9.firebasestorage.app/MathBirdAdventures/index.html",
      },
      {
        title: "SanaSanteri",
        gameId: "sanasanteri",
        url: "https://storage.googleapis.com/mathmaster-136c9.firebasestorage.app/Sanasanteri/index.html",
      },
    ];

    if (gameUrl) return { title: title || "Peli", url: gameUrl };
    return games.find((g) => g.gameId === gameId) || null;
  }, [gameId, gameUrl, title]);

  const [isPortrait, setIsPortrait] = useState(false);
  const [fsActive, setFsActive] = useState(false);
  const [status, setStatus] = useState(""); // infoteksi käyttäjälle

  // Viewport meta (jos appissa ei ole valmiiksi)
  useEffect(() => {
    const existing = document.querySelector('meta[name="viewport"]');
    if (!existing) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1, viewport-fit=cover";
      document.head.appendChild(meta);
      return () => {
        document.head.removeChild(meta);
      };
    }
  }, []);

  // Portrait/landscape seuranta + fullscreen seuranta
  useEffect(() => {
    const updateOrientation = () => {
      // window.matchMedia toimii useimmissa
      const portrait = window.matchMedia?.("(orientation: portrait)")?.matches;
      if (typeof portrait === "boolean") setIsPortrait(portrait);
      else setIsPortrait(window.innerHeight > window.innerWidth);
    };

    const onFsChange = () => {
      const d = document;
      const active =
        !!d.fullscreenElement || !!d.webkitFullscreenElement || false;
      setFsActive(active);
    };

    updateOrientation();
    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);

    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);

    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);

      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, []);

  async function enterFullscreenAndLandscape() {
    setStatus("");

    const el = iframeRef.current;
    if (!el) return;

    // 1) Fullscreen
    try {
      const req =
        el.requestFullscreen ||
        el.webkitRequestFullscreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullscreen;

      if (req) {
        await req.call(el);
      } else {
        setStatus("Fullscreen ei ole tuettu tässä selaimessa.");
      }
    } catch (e) {
      // iOS / selain voi estää
      setStatus("Fullscreen ei onnistunut (selaimen rajoitus).");
    }

    // 2) Yritä lukita laajakuva (toimii usein vain fullscreenissä + Android)
    try {
        const scr = window.screen;
        if (scr?.orientation?.lock) {
          await scr.orientation.lock("landscape");
        }
        
    } catch (e) {
      // ei tuettu / ei sallittu -> ei virheviestiä pakolla
    }
  }

  async function exitFullscreen() {
    const d = document;
    try {
      if (d.exitFullscreen) await d.exitFullscreen();
      else if (d.webkitExitFullscreen) await d.webkitExitFullscreen();
    } catch {}
  }

  if (!game) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h2 style={styles.h2}>Peliä ei löytynyt</h2>
          <button style={styles.btn} onClick={onExit}>
            Takaisin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Yläpalkki */}
      <div style={styles.topBar}>
        <div style={styles.titleWrap}>
          <div style={styles.gameTitle}>{game.title}</div>
          <div style={styles.hint}>
            Vinkki: napauta “Aloita” saadaksesi fullscreenin.
          </div>
        </div>

        <div style={styles.actions}>
          {!fsActive ? (
            <button style={styles.btnPrimary} onClick={enterFullscreenAndLandscape}>
              Aloita (fullscreen + laajakuva)
            </button>
          ) : (
            <button style={styles.btn} onClick={exitFullscreen}>
              Poistu fullscreenistä
            </button>
          )}

          <button style={styles.btn} onClick={onExit}>
            Takaisin
          </button>
        </div>
      </div>

      {/* Status */}
      {status && <div style={styles.status}>{status}</div>}

      {/* Pelialue */}
      <div style={styles.stage}>
        <iframe
          ref={iframeRef}
          title={game.title}
          src={game.url}
          style={styles.iframe}
          // mahdollistaa fullscreenin iframe-elementille
          allow="fullscreen; autoplay; gamepad; clipboard-read; clipboard-write"
          // joissain selaimissa tarvitaan myös tämä:
          allowFullScreen
        />
      </div>

      {/* “Käännä laite” -overlay jos portrait */}
      {isPortrait && (
        <div style={styles.rotateOverlay}>
          <div style={styles.rotateCard}>
            <div style={styles.rotateIcon}>↻</div>
            <div style={styles.rotateTitle}>Käännä laite laajakuvaksi</div>
            <div style={styles.rotateText}>
              Jos laajakuva ei lukitu automaattisesti, käännä puhelin.
            </div>
            <button style={styles.btnPrimary} onClick={enterFullscreenAndLandscape}>
              Yritä uudelleen (fullscreen)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- STYLES ---------- */

const styles = {
  page: {
    minHeight: "100svh",
    background: "#0b1020",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  topBar: {
    padding: "0.75rem 0.9rem",
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
  },
  titleWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
    minWidth: 0,
  },
  gameTitle: {
    fontSize: "1.05rem",
    fontWeight: 700,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "52vw",
  },
  hint: {
    fontSize: "0.82rem",
    opacity: 0.75,
  },
  actions: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  btnPrimary: {
    background: "#ff80ab",
    color: "#fff",
    border: "none",
    padding: "0.55rem 0.8rem",
    borderRadius: "10px",
    fontWeight: 700,
    cursor: "pointer",
  },
  btn: {
    background: "rgba(255,255,255,0.14)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "0.55rem 0.8rem",
    borderRadius: "10px",
    cursor: "pointer",
  },
  status: {
    padding: "0.55rem 0.9rem",
    fontSize: "0.9rem",
    background: "rgba(255,255,255,0.08)",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
  },
  stage: {
    flex: 1,
    position: "relative",
  },
  iframe: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    border: "none",
    background: "#000",
  },

  rotateOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.2rem",
    zIndex: 50,
  },
  rotateCard: {
    width: "min(420px, 92vw)",
    background: "rgba(20, 24, 40, 0.95)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "16px",
    padding: "1rem",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  },
  rotateIcon: {
    fontSize: "2.4rem",
    marginBottom: "0.3rem",
  },
  rotateTitle: {
    fontSize: "1.1rem",
    fontWeight: 800,
    marginBottom: "0.35rem",
  },
  rotateText: {
    fontSize: "0.92rem",
    opacity: 0.85,
    marginBottom: "0.8rem",
    lineHeight: 1.35,
  },

  center: {
    minHeight: "100svh",
    display: "grid",
    placeItems: "center",
    background: "#0b1020",
    color: "#fff",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    padding: "1rem",
  },
  card: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "16px",
    padding: "1rem",
    width: "min(420px, 92vw)",
  },
  h2: {
    margin: "0 0 0.75rem",
  },
};
