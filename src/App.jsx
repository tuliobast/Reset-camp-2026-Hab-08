import { useState, useEffect, useRef } from "react";

// ── Constants ────────────────────────────────────────────────────────────
const MATRIX_CHARS = "01@#$%^&*アァカサ01@#$%^&*タナハマヤャラワガザ01@#$%^&*ダバパイィキ01@#$%^&*シチニヒミ01@#$%^&*リヰギジヂビ01@#$%^&*ピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン"
const FONT_SIZE = 16;

const PARTICIPANTS = [
  { id: 1, name: "Adriana Gúzman", role: "Edad: 28", img: "./Adriana_Guzman-removebg-preview.png" },
  { id: 2, name: "Edith Vernhet", role: "Edad: 33", img: "./Edith_Vernhet-removebg-preview.png" },
  { id: 3, name: "Melany Lara", role: "Edad: 25", img: "./Melany_Lara-removebg-preview.png" },
  { id: 4, name: "Alejandra García", role: "Edad: 39", img: "./Alejandra_Garcia-removebg-preview.png" },
  { id: 5, name: "Ana Mestre", role: "Edad: 32", img: "./Ana_Mestre-removebg-preview.png" },
];

// ── Hooks ────────────────────────────────────────────────────────────────
function useScrollReveal(ref) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      if (!ref.current) return;
      const { top } = ref.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - top) / (vh * 0.75)));
      setProgress(p);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [ref]);

  return progress;
}

// ── MatrixBackground ─────────────────────────────────────────────────────
function MatrixBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drops = Array.from(
      { length: Math.floor(window.innerWidth / FONT_SIZE) },
      () => Math.random() * -100
    );

    let animId, lastTs = 0;
    const frame = (ts) => {
      animId = requestAnimationFrame(frame);
      if (ts - lastTs < 50) return;
      lastTs = ts;

      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FONT_SIZE}px monospace`;

      drops.forEach((y, i) => {
        ctx.fillStyle = i % 7 === 0 ? "#ccffcc" : "#00ff41";
        ctx.fillText(
          MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)],
          i * FONT_SIZE,
          y * FONT_SIZE
        );
        if (y * FONT_SIZE > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };

    animId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

// ── CardMatrixOverlay ─────────────────────────────────────────────────────
function CardMatrixOverlay({ opacity }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const F = 14;
    canvas.width = 300;
    canvas.height = 380;

    const drops = Array.from(
      { length: Math.floor(canvas.width / F) },
      () => Math.random() * -20
    );

    let animId, lastTs = 0;
    const frame = (ts) => {
      animId = requestAnimationFrame(frame);
      if (ts - lastTs < 60) return;
      lastTs = ts;

      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${F}px monospace`;
      ctx.fillStyle = "#00ff41";

      drops.forEach((y, i) => {
        ctx.fillText(
          MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)],
          i * F,
          y * F
        );
        if (y * F > canvas.height && Math.random() > 0.95) drops[i] = 0;
        drops[i]++;
      });
    };

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity,
        transition: "opacity 0.08s linear",
        zIndex: 2,
        borderRadius: 8,
      }}
    />
  );
}

// ── ParticipantCard ───────────────────────────────────────────────────────
function ParticipantCard({ participant }) {
  const ref = useRef(null);
  const progress = useScrollReveal(ref);

  const glowIntensity = progress * 30;
  const infoOpacity = Math.max(0, (progress - 0.7) / 0.3);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: 280,
        height: 360,
        borderRadius: 8,
        overflow: "hidden",
        border: `1px solid rgba(0,255,65,${0.2 + progress * 0.8})`,
        boxShadow: `0 0 ${glowIntensity}px rgba(0,255,65,0.4), inset 0 0 ${glowIntensity / 2}px rgba(0,255,65,0.1)`,
        margin: "0 auto",
        transition: "box-shadow 0.1s",
      }}
    >
      {/* Photo */}
      <img
        src={participant.img}
        alt={participant.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          filter: `
            grayscale(${1 - progress})
            brightness(${0.2 + progress * 0.8})
            contrast(${2 - progress * 1.0})
          `,
          transition: "filter 0.08s linear",
        }}
      />

      {/* Matrix overlay */}
      <CardMatrixOverlay opacity={1 - progress} />

      {/* Name + role */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "20px 16px 16px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
          opacity: infoOpacity,
          transform: `translateY(${(1 - infoOpacity) * 16}px)`,
          transition: "opacity 0.1s, transform 0.1s",
          zIndex: 3,
        }}
      >
        <p style={{ color: "#00ff41", margin: 0, fontFamily: "monospace", fontSize: 18, fontWeight: "bold", textShadow: "0 0 8px #00ff41" }}>
          {participant.name}
        </p>
        <p style={{ color: "#88cc88", margin: "4px 0 0", fontFamily: "monospace", fontSize: 13, letterSpacing: "0.05em" }}>
          {">"} {participant.role}
        </p>
      </div>

      {/* Scan line effect */}
      {progress < 0.95 && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(transparent ${progress * 100}%, rgba(0,255,65,0.05) ${progress * 100 + 2}%, transparent ${progress * 100 + 4}%)`,
          zIndex: 4,
          pointerEvents: "none",
        }} />
      )}
    </div>
  );
}

// ── HeroTitle ──────────────────────────────────────────────────────────────
function HeroTitle() {
  const text = "BIENVENIDO A RESET CAMP 2026";
  const [revealed, setRevealed] = useState(Array(text.length).fill(false));

  useEffect(() => {
    text.split("").forEach((_, i) => {
      setTimeout(() => {
        setRevealed(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * 120);
    });
  }, []);

  return (
    <h1 style={{
      fontFamily: "monospace",
      fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
      letterSpacing: "0.2em",
      margin: "50px",
      textAlign: "center",
      textShadow: "0 0 30px #00ff41",
    }}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          style={{
            color: revealed[i] ? "#00ff41" : "#003300",
            transition: "color 0.2s",
            display: "inline-block",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </h1>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ background: "#000", minHeight: "100vh", position: "relative" }}>
      <MatrixBackground />

      {/* Hero */}
      <section style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        margin: "auto",
        position: "relative",
        zIndex: 1,
        gap: 16,
      }}>
        <HeroTitle />
        <p style={{ color: "#ccffcc", fontFamily: "monospace", letterSpacing: "0.3em", margin: 0, fontSize: 12 }}>
          INICIANDO PROTOCOLO DE IDENTIFICACIÓN...
        </p>
        <div style={{ marginTop: 40, color: "#00ff41", fontFamily: "monospace", fontSize: 20, animation: "bounce 1.5s infinite" }}>
          ▼
        </div>
      </section>

      {/* Participants */}
      <section style={{ position: "relative", zIndex: 1 }}>
        {PARTICIPANTS.map((p) => (
          <div
            key={p.id}
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
            }}
          >
            <p className="num-participant"style={{
              fontFamily: "monospace",
              color: "#ccffcc",
              fontSize: 12,
              letterSpacing: "0.4em",
              margin: 0,
            }}>
              PARTICIPANTE #{String(p.id).padStart(3, "0")}
            </p>
            <ParticipantCard participant={p} />
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={{
        position: "relative",
        zIndex: 1,
        padding: "60px 20px",
        textAlign: "center",
        fontFamily: "monospace",
        color: "#ccffcc",
        fontSize: 12,
        letterSpacing: "0.3em",
      }}>
        FIN DE LA TRANSMISIÓN
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.3; transform: translateY(10px); }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}