import React from "react";

function App() {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>MathMaster</h1>
      <iframe
        title="MathMaster"
        src="/unity/index.html"
        style={{
          width: "960px",
          height: "540px",
          border: "none",
          background: "#000",
        }}
        allow="fullscreen; autoplay; gamepad"
      />
    </div>
  );
}

export default App;
