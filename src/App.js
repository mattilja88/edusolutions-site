import React, { useState, useMemo, useEffect } from "react";
import { apiPost } from "./config/api"; // säädä polku suhteessa tähän tiedostoon


export default function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [activePopup, setActivePopup] = useState(null); // "login" | "register" | null
  const [user, setUser] = useState(null); // null = ei kirjautunut

  useEffect(() => {
    const savedUser = localStorage.getItem("username");
    if (savedUser) setUser({ username: savedUser });
  }, []);
  
  const games = useMemo(
    () => [
      { title: "MathMaster", src: "/unity/index.html" },
      { title: "MathBirdAdventure", src: "/bird/index.html" },
    ],
    []
  );

  const Header = () => (
    <div style={styles.headerBar}>
      {user ? (
        <>
          <span style={styles.usernameText}>{user.username}</span>
          <button
            style={styles.headerBtn}
            onClick={() => {
              localStorage.removeItem("jwt");
              localStorage.removeItem("username");
              setUser(null);
            }}
          >
            Kirjaudu ulos
          </button>
        </>
      ) : (
        <>
          <button
            style={styles.headerBtn}
            onClick={() =>
              setActivePopup(activePopup === "login" ? null : "login")
            }
          >
            Kirjaudu
          </button>
          <button
            style={styles.headerBtn}
            onClick={() =>
              setActivePopup(activePopup === "register" ? null : "register")
            }
          >
            Luo tunnus
          </button>
        </>
      )}

      {/* Popupit */}
      {activePopup && (
        <Popup
          type={activePopup}
          onClose={() => setActivePopup(null)}
          setUser={setUser}
        />
      )}
    </div>

  );

  if (selectedGame) {
    return (
      <>
        <Header />
        <GameFrame
          title={selectedGame.title}
          src={selectedGame.src}
          onBack={() => setSelectedGame(null)}
        />
      </>
    );
  }

  return (
    <>
      <Header />
      <Menu games={games} onOpen={(g) => setSelectedGame(g)} />
    </>
  );
}

/* ---------- POPUP ---------- */

function Popup({ type, onClose, setUser }) {
  const title = type === "login" ? "Kirjaudu" : "Luo tunnus";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    if (type !== "register") return; // vain rekisteröintiin
    setError("");
    if (!username || !password) {
      setError("Täytä käyttäjänimi ja salasana.");
      return;
    }
    try {
      setLoading(true);
      const data = await apiPost("/api/accounts/register", { username, password });
      // Kevyt palaute; tässä ei vielä toiminnallisuuksia
      alert(`Käyttäjä luotu: ${data.username}`);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    if (type !== "login") return; // vain kirjautumiseen
    setError("");
    if (!username || !password) {
      setError("Täytä käyttäjänimi ja salasana.");
      return;
    }
    try {
      setLoading(true);
      const { jwtToken } = await apiPost("/api/login", { username, password });
      // talleta token (voi käyttää myöhemmin suojattuihin pyyntöihin)
      localStorage.setItem("jwt", jwtToken);
      localStorage.setItem("username", username);
      setUser({ username }); // <-- tämä asetetaan App:iin (tuodaan kohta propseilla)
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }  

  return (
    <div style={styles.popupWrap}>
      <div style={styles.popupBox}>
        <h3 style={styles.popupTitle}>{title}</h3>
        <input 
          type="text" 
          placeholder="Käyttäjänimi" 
          style={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Salasana" 
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
        />
        <div style={styles.popupButtons}>
        <div style={styles.popupButtons}>
          <button
            style={styles.submitBtn}
            disabled={loading /* tai || !username || !password */}
            onClick={type === "login" ? handleLogin : handleRegister}
          >
            {loading ? "Hetki..." : (type === "login" ? "Kirjaudu" : "Luo tunnus")}
          </button>
          <button style={styles.cancelBtn} onClick={onClose}>Peruuta</button>
        </div>

        {error && (
          <div style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.4rem" }}>
            {error}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

/* ---------- MENU ---------- */

function Menu({ games, onOpen }) {
  return (
    <div style={styles.menuContainer}>
      <h1 style={styles.title}>Oppimispelejä</h1>
      <div style={styles.buttonList}>
        {games.map((g) => (
          <button
            key={g.title}
            style={styles.gameButton}
            onClick={() => onOpen(g)}
          >
            {g.title}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- PELI ---------- */

function GameFrame({ title, src, onBack }) {
  const isMobile =
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ||
    (typeof window !== "undefined" && window.innerWidth < 768);

  return (
    <div style={styles.gameWrap}>
      <button style={styles.backBtn} onClick={onBack}>
        ← Takaisin
      </button>
      {!isMobile && <h2 style={styles.gameTitle}>{title}</h2>}
      <div style={styles.fit16x9}>
        <iframe title={title} src={src} allow="fullscreen; autoplay; gamepad" style={styles.iframeFill} />
      </div>
    </div>
  );
}

/* ---------- TYYLIT ---------- */

const styles = {
  /* HEADER */
  headerBar: {
    position: "fixed",
    top: 0,
    right: 0,
    display: "flex",
    gap: "0.6rem",
    padding: "0.8rem 1rem",
    zIndex: 20,
  },
  headerBtn: {
    background: "#ff80ab",
    color: "#fff",
    border: "none",
    padding: "0.5rem 0.9rem",
    fontSize: "0.95rem",
    borderRadius: "10px",
    cursor: "pointer",
  },

  /* POPUP */
  popupWrap: {
    position: "absolute",
    top: "3rem",
    right: "0.5rem",
    zIndex: 25,
    animation: "fadeIn 0.2s ease-out",
  },
  popupBox: {
    background: "#fff",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    borderRadius: "10px",
    padding: "1rem",
    width: "220px",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  popupTitle: {
    margin: "0 0 0.5rem 0",
    textAlign: "center",
    fontSize: "1.1rem",
    color: "#ff4081",
  },
  input: {
    padding: "0.5rem",
    marginBottom: "0.6rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "0.9rem",
  },
  popupButtons: {
    display: "flex",
    justifyContent: "space-between",
    gap: "0.5rem",
  },
  submitBtn: {
    flex: 1,
    background: "#ff80ab",
    color: "#fff",
    border: "none",
    padding: "0.5rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
  cancelBtn: {
    flex: 1,
    background: "#ccc",
    border: "none",
    padding: "0.5rem",
    borderRadius: "6px",
    cursor: "pointer",
  },

  /* MENU */
  menuContainer: {
    minHeight: "100svh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(180deg, #aeeaff, #ffffff)",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    padding: "4.5rem 2rem 2rem",
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
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100svh",
    background: "#000",
    flexDirection: "column",
    overflow: "hidden",
    paddingTop: "3.5rem",
  },
  gameTitle: {
    color: "#fff",
    marginBottom: "1rem",
    fontFamily: "Press Start 2P, monospace",
    fontSize: "1.2rem",
  },
  fit16x9: {
    width: "min(100svw, calc(100svh * (16 / 9)))",
    height: "min(100svh, calc(100svw * (9 / 16)))",
    display: "grid",
    placeItems: "center",
    background: "#000",
  },
  iframeFill: {
    width: "100%",
    height: "100%",
    border: "none",
    display: "block",
  },
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
  usernameText: {
    alignSelf: "center",
    color: "#ff80ab",
    fontWeight: "600",
    fontSize: "1rem",
    paddingRight: "0.5rem",
  },
  
};
