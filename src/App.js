import React, { useState } from "react";

function App() {
  // Tilamuuttuja: mikä peli on auki (null = aloitussivu)
  const [selectedGame, setSelectedGame] = useState(null);

  // Jos peli on valittu, näytetään iframe
  if (selectedGame) {
    return (
      <div style={styles.gameContainer}>
        <h2 style={{ color: "#fff" }}>{selectedGame.title}</h2>

        <iframe
          title={selectedGame.title}
          src={selectedGame.src}
          style={styles.iframe}
          allow="fullscreen; autoplay; gamepad"
        />

        <button style={styles.backButton} onClick={() => setSelectedGame(null)}>
          ← Takaisin
        </button>
      </div>
    );
  }

  // Aloitussivu: lista peleistä
  return (
    <div style={styles.menuContainer}>
      <h1 style={styles.title}>Oppimispelejä</h1>

      <div style={styles.buttonList}>
        <button
          style={styles.gameButton}
          onClick={() =>
            setSelectedGame({ title: "MathMaster", src: "/unity/index.html" })
          }
        >
          MathMaster
        </button>

        <button
          style={styles.gameButton}
          onClick={() =>
            setSelectedGame({
              title: "MathBirdAdventure",
              src: "/bird/index.html",
            })
          }
        >
          MathBirdAdventure
        </button>
      </div>
    </div>
  );
}

// Tyylit JS-objekteina (inline-tyylit)
const styles = {
  menuContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(180deg, #aeeaff, #ffffff)",
    fontFamily: "Press Start 2P, monospace",
  },
  title: {
    fontSize: "2rem",
    color: "#ff4081",
    marginBottom: "2rem",
  },
  buttonList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  gameButton: {
    background: "#ff80ab",
    color: "#fff",
    border: "none",
    padding: "1rem 2rem",
    fontSize: "1.2rem",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "0.2s",
  },
  gameContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#000",
  },
  iframe: {
    width: "960px",
    height: "540px",
    border: "none",
    background: "#000",
  },
  backButton: {
    marginTop: "1rem",
    background: "#ff80ab",
    color: "#fff",
    border: "none",
    padding: "0.8rem 1.5rem",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default App;
