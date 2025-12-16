import React, { useState, useMemo, useEffect } from "react";
import { apiPost } from "./config/api";
import { puhdasNimimerkki } from "./utils/puhdasNimimerkki";
import PlayPage from "./components/PlayPage"; // <-- UUSI

export default function App() {
  const [activePopup, setActivePopup] = useState(null); // "login" | "register" | null
  const [user, setUser] = useState(null); // null = ei kirjautunut

  const [activeGame, setActiveGame] = useState(null); // <-- UUSI: {title, gameId, url, image} | null

  useEffect(() => {
    const savedUser = localStorage.getItem("username");
    if (savedUser) setUser({ username: savedUser });
  }, []);

  const games = useMemo(
    () => [
      {
        title: "MathMaster",
        gameId: "math-master",
        url: "https://storage.googleapis.com/mathmaster-136c9.firebasestorage.app/Mathmaster/index.html",
        image: "/img/MathMaster.png",
      },
      {
        title: "MathBirdAdventure",
        gameId: "math-bird",
        url: "https://storage.googleapis.com/mathmaster-136c9.firebasestorage.app/MathBirdAdventures/index.html",
        image: "/img/MathBirdAdventures.png",
      },
      {
        title: "SanaSanteri",
        gameId: "sanasanteri",
        url: "https://storage.googleapis.com/mathmaster-136c9.firebasestorage.app/Sanasanteri/index.html",
        image: "/img/SanaSanteri.png",
      },
    ],
    []
  );

  function openGame(game) {
    // ÄLÄ avaa uuteen välilehteen, jotta voidaan hallita fullscreen/orientaatio:
    setActiveGame(game);
    setActivePopup(null);
  }

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
              setActivePopup(null);
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

      {activePopup && (
        <Popup
          type={activePopup}
          onClose={() => setActivePopup(null)}
          setUser={setUser}
        />
      )}
    </div>
  );

  // Jos peli on valittu, näytetään PlayPage koko ruudun näkymänä
  if (activeGame) {
    return (
      <PlayPage
        gameUrl={activeGame.url}
        title={activeGame.title}
        onExit={() => setActiveGame(null)}
      />
    );
  }

  return (
    <>
      <Header />
      <Menu games={games} onOpen={openGame} />
    </>
  );
}

/* ---------- POPUP ---------- */

function Popup({ type, onClose, setUser }) {
  const title = type === "login" ? "Kirjaudu" : "Luo tunnus";
  const INVITE_CODE = "OPETUS2025";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const usernameEmpty = username.trim().length === 0;
  const pwTooShort = password.length < 6;
  const pwMismatch = password !== password2;
  const codeInvalid = type === "register" && inviteCode.trim() !== INVITE_CODE;

  async function handleRegister() {
    if (type !== "register") return;
    setError("");

    if (usernameEmpty) return setError("Käyttäjänimi puuttuu.");
    if (pwTooShort) return setError("Salasanan vähimmäispituus on 6 merkkiä.");
    if (pwMismatch) return setError("Salasanat eivät täsmää.");
    if (codeInvalid) return setError("Väärä kutsukoodi.");

    try {
      setLoading(true);

      const check = puhdasNimimerkki(username);
      if (!check.ok) {
        setError(check.reason);
        return;
      }

      const data = await apiPost("/api/accounts/register", { username, password });
      alert(`Käyttäjä luotu: ${data.username}`);
      onClose();
    } catch (e) {
      setError(e?.message || "Rekisteröinti epäonnistui.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    if (type !== "login") return;
    setError("");

    if (usernameEmpty) return setError("Käyttäjänimi puuttuu.");
    if (password.length === 0) return setError("Salasana puuttuu.");

    try {
      setLoading(true);
      const { jwtToken } = await apiPost("/api/login", { username, password });

      localStorage.setItem("jwt", jwtToken);
      localStorage.setItem("username", username);

      setUser({ username });
      onClose();
    } catch (e) {
      setError(e?.message || "Kirjautuminen epäonnistui.");
    } finally {
      setLoading(false);
    }
  }

  const submitDisabled =
    loading ||
    usernameEmpty ||
    (type === "login"
      ? password.length === 0
      : pwTooShort || pwMismatch || codeInvalid);

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
          autoComplete={type === "login" ? "username" : "new-username"}
        />

        <input
          type="password"
          placeholder="Salasana"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={type === "login" ? "current-password" : "new-password"}
        />

        {type === "register" && (
          <>
            <input
              type="password"
              placeholder="Salasana uudelleen"
              style={{
                ...styles.input,
                borderColor:
                  password2.length === 0
                    ? "#ccc"
                    : pwMismatch
                    ? "#d32f2f"
                    : "#4caf50",
              }}
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              autoComplete="new-password"
            />

            <input
              type="text"
              placeholder="Kutsukoodi"
              style={{
                ...styles.input,
                borderColor:
                  inviteCode.length === 0
                    ? "#ccc"
                    : codeInvalid
                    ? "#d32f2f"
                    : "#4caf50",
              }}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />

            <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "0.4rem" }}>
              Vihje: salasanassa vähintään 6 merkkiä.
            </div>
          </>
        )}

        <div style={styles.popupButtons}>
          <button
            style={{
              ...styles.submitBtn,
              opacity: submitDisabled ? 0.6 : 1,
              cursor: submitDisabled ? "not-allowed" : "pointer",
            }}
            disabled={submitDisabled}
            onClick={type === "login" ? handleLogin : handleRegister}
          >
            {loading ? "Hetki..." : type === "login" ? "Kirjaudu" : "Luo tunnus"}
          </button>

          <button style={styles.cancelBtn} onClick={onClose}>
            Peruuta
          </button>
        </div>

        {error && (
          <div style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.4rem" }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- MENU ---------- */

function Menu({ games, onOpen }) {
  return (
    <div style={styles.menuContainer}>
      <h1 style={styles.title}>Oppimispelejä</h1>

      <div style={styles.gameGrid}>
        {games.map((g) => (
          <button
            key={g.title}
            style={styles.gameCard}
            onClick={() => onOpen(g)}
            type="button"
          >
            <div style={styles.gameImageWrap}>
              <img src={g.image} alt={g.title} style={styles.gameImage} />
            </div>
            <div style={styles.gameCaption}>{g.title}</div>
          </button>
        ))}
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
  usernameText: {
    alignSelf: "center",
    color: "#ff80ab",
    fontWeight: "600",
    fontSize: "1rem",
    paddingRight: "0.5rem",
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
    textAlign: "center",
  },
  gameGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1.5rem",
    width: "min(90vw, 700px)",
  },
  gameCard: {
    background: "#fff",
    border: "none",
    borderRadius: "16px",
    padding: "0.8rem 0.8rem 1rem",
    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    transform: "translateY(0)",
  },
  gameImageWrap: {
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: "12px",
    overflow: "hidden",
    marginBottom: "0.7rem",
    background: "#eee",
  },
  gameImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  gameCaption: {
    fontSize: "1.05rem",
    fontWeight: 600,
    color: "#e05682",
    textAlign: "center",
  },
};
