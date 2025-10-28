import React, { useState, useMemo } from "react";

/**
 * YKSI TIEDOSTO, KAKSI NÄKYMIÄ:
 *  - Menu: lista peleistä
 *  - GameFrame: responsiivinen 16:9 -iframe
 */

export default function App() {
  const [selectedGame, setSelectedGame] = useState(null);

  // Lisää tänne pelit
  const games = useMemo(
    () => [
      { title: "MathMaster", src: "/unity/index.html" },
      { title: "MathBirdAdventure", src: "/bird/index.html" },
    ],
    []
  );

  if (selectedGame) {
    return (
      <GameFrame
        title={selectedGame.title}
        src={selectedGame.src}
        onBack={() => setSelectedGame(null)}
      />
    );
  }

  return <Menu games={games} onOpen={(g) => setSelectedGame(g)} />;
}

/* ---------- MENU ---------- */

function Menu({ games, onOpen }) {
  return (
    <div style={styles.menuContainer}>
      <h1 style={styles.title}>Oppimispelejä</h1>

      <div style={styles.buttonList}>
        {games.map((g) => (
          <button key={g.title} style={styles.gameButton} onClick={() => onOpen(g)}>
            {g.title}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- PELI-IFRAME (RESPONSIIVINEN) ---------- */

function GameFrame({ title, src, onBack }) {
  // Yksinkertainen mobiilitunnistus
  const isMobile =
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ||
    (typeof window !== "undefined" && window.innerWidth < 768);

  return (
    <div style={styles.gameWrap}>
      {/* Takaisin-nappi kulmaan */}
      <button style={styles.backBtn} onClick={onBack} aria-label="Takaisin">
        ← Takaisin
      </button>

      {/* Otsikko näkyy vain desktopilla */}
      {!isMobile && <h2 style={styles.gameTitle}>{title}</h2>}

      {/* “Fit”-laatikko säilyttää 16:9 ja mahtuu näyttöön */}
      <div style={styles.fit16x9}>
        <iframe
          title={title}
          src={src}
          allow="fullscreen; autoplay; gamepad"
          style={styles.iframeFill}
        />
      </div>
    </div>
  );
}


/* ---------- TYYLIT ---------- */

const styles = {
  /* MENU */
  menuContainer: {
    minHeight: "100svh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(180deg, #aeeaff, #ffffff)",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    padding: "2rem",
    boxSizing: "border-box",
  },
  title: {
    fontSize: "2.4rem",
    color: "#e05682",
    marginBottom: "2rem",
  },
  buttonList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    width: "min(90vw, 420px)",
  },
  gameButton: {
    background: "#ff80ab",
    color: "#fff",
    border: "none",
    padding: "1rem 2rem",
    fontSize: "1.1rem",
    borderRadius: "14px",
    cursor: "pointer",
  },

  /* GAME */
  gameWrap: {
    display: "flex",
    justifyContent: "center",   // keskittää vaakasuunnassa
    alignItems: "center",       // keskittää pystysuunnassa
    minHeight: "100svh",        // koko ruudun korkeus (myös mobiilissa)
    background: "#000",         // musta tausta reunojen väliin
    flexDirection: "column",
    overflow: "hidden",
  },
  gameTitle: {
    color: "#fff",
    marginBottom: "1rem",
    fontFamily: "Press Start 2P, monospace",
    fontSize: "1.2rem",
  },

  /* Laatikko joka pitää 16:9-kuvasuhteen ja mahtuu näyttöön */
  fit16x9: {
    width: "min(100svw, calc(100svh * (16 / 9)))",
    height: "min(100svh, calc(100svw * (9 / 16)))",
    display: "grid",
    placeItems: "center",
    background: "#000",
  },

  /* Iframe täyttää fit-laatikon */
  iframeFill: {
    width: "100%",
    height: "100%",
    border: "none",
    display: "block",
  },

  /* Takaisin-nappi kulmaan */
  backBtn: {
    position: "absolute",
    top: "1rem",
    left: "1rem",
    background: "#ff80ab",
    color: "#fff",
    border: "none",
    padding: "0.6rem 1rem",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1rem",
    zIndex: 10,
  },
};
