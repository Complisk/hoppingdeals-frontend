import { useId, type ReactNode } from "react";

/**
 * Original night-scene artwork for Hopping Deals pages.
 *
 * Every page gets its own scene (a subject drawn on the right, a tinted night
 * sky, stars). Scenes are plain SVG so they stay sharp, tint with `accent`,
 * and cost no image downloads. They're decorative: always aria-hidden.
 *
 * Layout: 1440×520 artboard anchored bottom-right (`xMaxYMax slice`), so the
 * subject stays in view on phones and the left side stays calm for titles.
 */

export type SceneName =
  | "street"
  | "directory"
  | "observatory"
  | "ideas"
  | "gallery"
  | "lighthouse"
  | "phone"
  | "bags"
  | "storefront"
  | "launch"
  | "tower"
  | "lost"
  | "celebrate"
  | "orbit";

export const SCENE_ACCENTS: Record<SceneName, string> = {
  street: "#ff8a1f",
  directory: "#2dd4bf",
  observatory: "#a78bfa",
  ideas: "#f59e0b",
  gallery: "#ec4899",
  lighthouse: "#60a5fa",
  phone: "#34d399",
  bags: "#f472b6",
  storefront: "#fb6b3c",
  launch: "#ef2b3a",
  tower: "#3b82f6",
  lost: "#f7c948",
  celebrate: "#34d399",
  orbit: "#8b5cf6",
};

const GOLD = "#f7c948";
const NIGHT = "#070a20";
const NIGHT_2 = "#0c1138";
const TICKET_HUES = ["#ff8a1f", "#ff77b4", "#9be33c", "#b062ff", "#5aa2ff", "#fbbf24"];

// Deterministic pseudo-random so server and client render the same stars.
function seeded(seedText: string) {
  let seed = 0;
  for (let i = 0; i < seedText.length; i += 1) {
    seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
  }
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

const SPARKLE =
  "M0,-10 C1,-3 3,-1 10,0 C3,1 1,3 0,10 C-1,3 -3,1 -10,0 C-3,-1 -1,-3 0,-10Z";

function Stars({ seed, count = 70, maxY = 360 }: { seed: string; count?: number; maxY?: number }) {
  const r = seeded(seed);
  const dots = Array.from({ length: count }, () => ({
    x: r() * 1440,
    y: r() * maxY,
    s: 0.6 + r() * 1.2,
    o: 0.25 + r() * 0.65,
  }));
  const sparkles = Array.from({ length: 5 }, () => ({
    x: 120 + r() * 1240,
    y: 20 + r() * (maxY - 120),
    s: 0.35 + r() * 0.6,
  }));
  return (
    <g>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.s} fill="#fff" opacity={d.o} />
      ))}
      {sparkles.map((s, i) => (
        <path
          key={`s${i}`}
          d={SPARKLE}
          transform={`translate(${s.x} ${s.y}) scale(${s.s})`}
          fill={GOLD}
          opacity={0.85}
        />
      ))}
    </g>
  );
}

function Ground({ y = 452, color = NIGHT }: { y?: number; color?: string }) {
  return <rect x="0" y={y} width="1440" height={520 - y} fill={color} />;
}

/** Striped shop awning with scalloped edge. */
function Awning({
  x,
  y,
  w,
  color,
  stripes = 6,
}: {
  x: number;
  y: number;
  w: number;
  color: string;
  stripes?: number;
}) {
  const flare = 12;
  const h = 30;
  const bw = w + flare * 2;
  const parts = [];
  for (let k = 0; k < stripes; k += 1) {
    const t0 = x + (k * w) / stripes;
    const t1 = x + ((k + 1) * w) / stripes;
    const b0 = x - flare + (k * bw) / stripes;
    const b1 = x - flare + ((k + 1) * bw) / stripes;
    const fill = k % 2 === 0 ? color : "#f8f3ea";
    parts.push(
      <g key={k}>
        <polygon points={`${t0},${y} ${t1},${y} ${b1},${y + h} ${b0},${y + h}`} fill={fill} />
        <circle cx={(b0 + b1) / 2} cy={y + h} r={(b1 - b0) / 2} fill={fill} />
      </g>,
    );
  }
  return (
    <g>
      {parts}
      <rect x={x - flare} y={y + h - 2} width={bw} height="3" fill="#000" opacity="0.15" />
    </g>
  );
}

function Shop({
  x,
  w,
  h,
  accent,
  base = 452,
  sign,
}: {
  x: number;
  w: number;
  h: number;
  accent: string;
  base?: number;
  sign?: boolean;
}) {
  const top = base - h;
  const awningY = top + 42;
  const winY = awningY + 46;
  const doorW = Math.min(34, w * 0.22);
  return (
    <g>
      <rect x={x} y={top} width={w} height={h} fill="#121852" />
      <rect x={x - 4} y={top} width={w + 8} height="10" fill="#0b0f36" />
      <rect x={x} y={top + 10} width={w} height="3" fill={accent} opacity="0.5" />
      {sign ? (
        <rect
          x={x + w * 0.2}
          y={top + 18}
          width={w * 0.6}
          height="16"
          rx="8"
          fill="none"
          stroke={accent}
          strokeWidth="2.5"
          opacity="0.95"
        />
      ) : null}
      <Awning x={x + 6} y={awningY} w={w - 12} color={accent} />
      <rect
        x={x + 10}
        y={winY}
        width={w - doorW - 26}
        height={base - winY - 14}
        rx="3"
        fill={accent}
        opacity="0.38"
      />
      <rect
        x={x + 14}
        y={winY + 4}
        width={w - doorW - 34}
        height={(base - winY - 14) * 0.45}
        rx="2"
        fill="#fff"
        opacity="0.12"
      />
      <rect x={x + w - doorW - 10} y={winY} width={doorW} height={base - winY} fill="#0a0e32" />
      <circle cx={x + w - 18} cy={winY + (base - winY) / 2} r="2" fill={GOLD} />
    </g>
  );
}

function Planet({
  cx,
  cy,
  r,
  light,
  dark,
  id,
  ring = true,
}: {
  cx: number;
  cy: number;
  r: number;
  light: string;
  dark: string;
  id: string;
  ring?: boolean;
}) {
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-pl`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r * 1.8} fill={light} opacity="0.08" />
      {ring ? (
        <ellipse
          cx={cx}
          cy={cy}
          rx={r * 1.9}
          ry={r * 0.45}
          transform={`rotate(-16 ${cx} ${cy})`}
          fill="none"
          stroke="#fff"
          strokeOpacity="0.28"
          strokeWidth={r * 0.12}
        />
      ) : null}
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-pl)`} />
      {ring ? (
        <path
          d={`M ${cx - r * 1.85} ${cy + r * 0.45} A ${r * 1.9} ${r * 0.45} 0 0 0 ${cx + r * 1.85} ${cy - r * 0.6}`}
          transform={`rotate(-16 ${cx} ${cy})`}
          fill="none"
          stroke="#fff"
          strokeOpacity="0.45"
          strokeWidth={r * 0.12}
        />
      ) : null}
    </g>
  );
}

/** Small coupon ticket with side notches (used in several scenes). */
function Ticket({
  x,
  y,
  w = 70,
  h = 40,
  color,
  rotate = 0,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  color: string;
  rotate?: number;
}) {
  const n = h * 0.18;
  const d = `M ${x} ${y} h ${w} v ${h / 2 - n} a ${n} ${n} 0 0 0 0 ${n * 2} v ${h / 2 - n} h ${-w} v ${-(h / 2 - n)} a ${n} ${n} 0 0 0 0 ${-n * 2} Z`;
  return (
    <g transform={`rotate(${rotate} ${x + w / 2} ${y + h / 2})`}>
      <path d={d} fill={color} />
      <path d={d} fill="#000" opacity="0.12" />
      <line
        x1={x + w * 0.68}
        y1={y + 4}
        x2={x + w * 0.68}
        y2={y + h - 4}
        stroke="#fff"
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <rect x={x + w * 0.12} y={y + h * 0.3} width={w * 0.42} height={h * 0.16} rx="2" fill="#fff" opacity="0.85" />
      <rect x={x + w * 0.12} y={y + h * 0.56} width={w * 0.28} height={h * 0.12} rx="2" fill="#fff" opacity="0.55" />
    </g>
  );
}

function StringLights({ points, sag = 22 }: { points: [number, number][]; sag?: number }) {
  const segments = [];
  const bulbs = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const mx = (x0 + x1) / 2;
    const my = Math.max(y0, y1) + sag;
    segments.push(`M ${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}`);
    for (let t = 0.15; t < 1; t += 0.17) {
      const bx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * mx + t * t * x1;
      const by = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * my + t * t * y1;
      bulbs.push([bx, by + 4]);
    }
  }
  return (
    <g>
      <path d={segments.join(" ")} fill="none" stroke="#2a3270" strokeWidth="1.5" />
      {bulbs.map(([bx, by], i) => (
        <g key={i}>
          <circle cx={bx} cy={by} r="7" fill={GOLD} opacity="0.18" />
          <circle cx={bx} cy={by} r="2.6" fill={GOLD} />
        </g>
      ))}
    </g>
  );
}

/* ── Subjects ─────────────────────────────────────────────────────────── */

function StreetSubject({ a, id }: { a: string; id: string }) {
  return (
    <g>
      <Planet cx={1210} cy={105} r={34} light="#ffe7b0" dark="#c9772a" id={`${id}-p`} />
      {/* far skyline */}
      {[620, 700, 760, 840, 930, 1010, 1100, 1180, 1260, 1340, 1400].map((x, i) => (
        <rect key={x} x={x} y={300 + ((i * 37) % 70)} width={70} height={160} fill="#0e1442" />
      ))}
      <Ground />
      <Shop x={700} w={150} h={155} accent={a} sign />
      <Shop x={862} w={118} h={196} accent="#ff77b4" />
      <Shop x={992} w={170} h={142} accent={a} sign />
      <Shop x={1174} w={124} h={178} accent="#5aa2ff" />
      <Shop x={1310} w={150} h={150} accent={a} sign />
      <StringLights
        points={[
          [700, 297],
          [862, 256],
          [992, 310],
          [1174, 274],
          [1310, 302],
          [1440, 300],
        ]}
      />
      {/* lamp post */}
      <rect x="652" y="352" width="5" height="100" fill="#1b2263" />
      <circle cx="654" cy="350" r="26" fill={GOLD} opacity="0.12" />
      <circle cx="654" cy="350" r="8" fill={GOLD} />
    </g>
  );
}

function DirectorySubject({ a, id }: { a: string; id: string }) {
  const vx = 1060;
  const vy = 300;
  const rays = [];
  for (let x = -900; x <= 3000; x += 150) {
    rays.push(<line key={x} x1={vx} y1={vy} x2={x} y2={520} stroke={a} strokeOpacity="0.28" strokeWidth="1.2" />);
  }
  const rows = [];
  for (let k = 1; k <= 9; k += 1) {
    const y = vy + k * k * 2.7;
    rows.push(<line key={k} x1="0" y1={y} x2="1440" y2={y} stroke={a} strokeOpacity={0.12 + k * 0.025} strokeWidth="1.2" />);
  }
  const pins: [number, number, number, string][] = [
    [1120, 370, 1.2, "#ef2b3a"],
    [960, 412, 1, a],
    [1290, 420, 1.35, GOLD],
    [820, 470, 1.1, "#ff77b4"],
    [1210, 335, 0.8, a],
    [1380, 352, 0.9, "#5aa2ff"],
  ];
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-plane`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f1650" />
          <stop offset="1" stopColor={NIGHT} />
        </linearGradient>
      </defs>
      {/* horizon skyline */}
      {[760, 820, 880, 930, 1000, 1060, 1110, 1170, 1240, 1300, 1370].map((x, i) => (
        <rect key={x} x={x} y={vy - 30 - ((i * 23) % 50)} width={44} height={60 + ((i * 23) % 50)} fill="#11185a" />
      ))}
      <rect x="0" y={vy} width="1440" height={520 - vy} fill={`url(#${id}-plane)`} />
      {rays}
      {rows}
      {pins.map(([x, y, s, c], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y + 2} rx={16 * s} ry={5 * s} fill={c} opacity="0.35" />
          <path
            d={`M ${x} ${y} C ${x - 13 * s} ${y - 15 * s} ${x - 15 * s} ${y - 30 * s} ${x} ${y - 38 * s} C ${x + 15 * s} ${y - 30 * s} ${x + 13 * s} ${y - 15 * s} ${x} ${y} Z`}
            fill={c}
          />
          <circle cx={x} cy={y - 26 * s} r={5 * s} fill="#fff" />
        </g>
      ))}
    </g>
  );
}

function ObservatorySubject({ a, id }: { a: string; id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-aur`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={a} stopOpacity="0" />
          <stop offset="0.5" stopColor={a} stopOpacity="0.8" />
          <stop offset="1" stopColor="#34d399" stopOpacity="0.35" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <g filter={`url(#${id}-blur)`}>
        <path d="M 420 170 C 700 60 900 230 1440 90" stroke={`url(#${id}-aur)`} strokeWidth="60" fill="none" />
        <path d="M 600 240 C 860 150 1040 280 1440 180" stroke={`url(#${id}-aur)`} strokeWidth="36" fill="none" opacity="0.7" />
      </g>
      <path d="M 560 520 C 780 430 980 382 1170 376 C 1310 372 1400 392 1440 404 L 1440 520 Z" fill={NIGHT_2} />
      <path d="M 0 520 C 300 470 520 452 760 470 C 980 486 1200 470 1440 452 L 1440 520 Z" fill={NIGHT} />
      {/* observatory */}
      <g transform="translate(1162 378) scale(1.25) translate(-1162 -378)">
      <rect x="1100" y="318" width="124" height="60" fill="#151c5c" />
      <path d="M 1094 320 A 68 68 0 0 1 1230 320 Z" fill="#1d2570" />
      <path d="M 1158 254 L 1172 254 L 1172 320 L 1158 320 Z" fill="#0a0e32" />
      <rect
        x="1150"
        y="236"
        width="16"
        height="70"
        rx="3"
        fill="#cfd6ff"
        transform="rotate(38 1158 290)"
      />
      <rect x="1116" y="340" width="14" height="14" fill={GOLD} opacity="0.9" />
      <rect x="1190" y="340" width="14" height="14" fill={GOLD} opacity="0.9" />
      <rect x="1150" y="344" width="22" height="34" fill="#0a0e32" />
      </g>
    </g>
  );
}

function IdeasSubject({ a }: { a: string }) {
  const pts: [number, number][] = [
    [960, 236],
    [960, 286],
    [1210, 150],
    [1244, 260],
    [1210, 370],
    [1010, 300],
    [1030, 350],
    [1060, 342],
  ];
  const lines: [number, number][] = [
    [0, 1],
    [0, 2],
    [2, 3],
    [3, 4],
    [4, 1],
    [5, 6],
    [6, 7],
  ];
  return (
    <g>
      {[0, 1, 2].map((k) => (
        <path
          key={k}
          d={`M ${1290 + k * 34} ${200 - k * 22} Q ${1330 + k * 40} 260 ${1290 + k * 34} ${320 + k * 22}`}
          fill="none"
          stroke={a}
          strokeWidth="3"
          strokeDasharray="6 8"
          opacity={0.75 - k * 0.2}
        />
      ))}
      {lines.map(([i, j], k) => (
        <line key={k} x1={pts[i][0]} y1={pts[i][1]} x2={pts[j][0]} y2={pts[j][1]} stroke={GOLD} strokeOpacity="0.55" strokeWidth="1.6" />
      ))}
      {pts.map(([x, y], k) => (
        <g key={k}>
          <circle cx={x} cy={y} r="9" fill={GOLD} opacity="0.18" />
          <circle cx={x} cy={y} r="3.4" fill="#fff" />
        </g>
      ))}
      {/* paper planes with trails */}
      {[
        [700, 190, -8],
        [820, 330, 6],
        [560, 280, -14],
      ].map(([x, y, r], k) => (
        <g key={k} transform={`rotate(${r} ${x} ${y})`}>
          <path
            d={`M ${x - 220} ${y + 30} C ${x - 150} ${y + 60} ${x - 80} ${y - 20} ${x - 10} ${y + 4}`}
            fill="none"
            stroke="#fff"
            strokeOpacity="0.25"
            strokeWidth="2"
            strokeDasharray="5 7"
          />
          <path d={`M ${x} ${y} l 46 -14 l -30 30 z`} fill="#f8f3ea" />
          <path d={`M ${x} ${y} l 46 -14 l -26 8 z`} fill={a} />
        </g>
      ))}
      <path d="M 0 520 C 320 470 600 488 900 466 C 1150 448 1300 470 1440 456 L 1440 520 Z" fill={NIGHT} />
    </g>
  );
}

function GallerySubject({ a, id }: { a: string; id: string }) {
  const frames: [number, number, number, string][] = [
    [690, 128, -6, a],
    [840, 150, 4, GOLD],
    [990, 160, -3, "#5aa2ff"],
    [1140, 156, 6, "#9be33c"],
    [1290, 140, -5, "#b062ff"],
  ];
  return (
    <g>
      <path d="M 560 92 Q 1000 210 1440 120" fill="none" stroke="#c9cff5" strokeOpacity="0.55" strokeWidth="2" />
      {frames.map(([x, y, r, c], k) => (
        <g key={k} transform={`rotate(${r} ${x + 55} ${y})`}>
          <defs>
            <linearGradient id={`${id}-ph${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={c} />
              <stop offset="1" stopColor="#141a4e" />
            </linearGradient>
          </defs>
          <rect x={x} y={y} width="110" height="132" rx="3" fill="#f8f3ea" />
          <rect x={x + 8} y={y + 8} width="94" height="92" fill={`url(#${id}-ph${k})`} />
          <path d={`M ${x + 8} ${y + 100} l 30 -34 l 20 22 l 16 -14 l 28 26 z`} fill="#0b0f36" opacity="0.8" />
          <circle cx={x + 76} cy={y + 30} r="9" fill="#fff" opacity="0.85" />
          <rect x={x + 47} y={y - 10} width="16" height="22" rx="3" fill={GOLD} />
        </g>
      ))}
      <Ground y={470} />
    </g>
  );
}

function LighthouseSubject({ a, id }: { a: string; id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-beam`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#fff6cc" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff6cc" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#13206a" />
          <stop offset="1" stopColor={NIGHT} />
        </linearGradient>
      </defs>
      <polygon points="1195,214 420,120 420,320" fill={`url(#${id}-beam)`} />
      <rect x="0" y="400" width="1440" height="120" fill={`url(#${id}-sea)`} />
      {[420, 448, 476, 500].map((y, k) => (
        <path
          key={y}
          d={`M ${200 + k * 60} ${y} q 30 -8 60 0 t 60 0 t 60 0`}
          fill="none"
          stroke={a}
          strokeOpacity={0.35 - k * 0.05}
          strokeWidth="2"
        />
      ))}
      <path d="M 1040 520 L 1060 430 L 1130 410 L 1290 418 L 1360 444 L 1400 520 Z" fill="#090c2a" />
      <polygon points="1170,430 1180,236 1214,236 1224,430" fill="#e9edff" />
      {[260, 316, 372].map((y) => (
        <polygon key={y} points={`${1182 - (y - 236) * 0.05},${y} ${1212 + (y - 236) * 0.05},${y} ${1213 + (y - 236) * 0.052},${y + 26} ${1181 - (y - 236) * 0.052},${y + 26}`} fill={a} />
      ))}
      <rect x="1172" y="200" width="50" height="38" rx="4" fill="#1b2263" />
      <rect x="1180" y="206" width="34" height="26" fill="#fff6cc" />
      <path d="M 1166 202 L 1197 178 L 1228 202 Z" fill="#ef2b3a" />
      <circle cx="1197" cy="219" r="34" fill="#fff6cc" opacity="0.18" />
    </g>
  );
}

function PhoneSubject({ a, id }: { a: string; id: string }) {
  const icons = [];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const k = row * 3 + col;
      icons.push(
        <rect
          key={k}
          x={1072 + col * 54}
          y={176 + row * 56}
          width="38"
          height="38"
          rx="10"
          fill={TICKET_HUES[k % TICKET_HUES.length]}
          opacity={k === 4 ? 1 : 0.85}
        />,
      );
    }
  }
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-scr`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d2a7a" />
          <stop offset="1" stopColor="#0f1650" />
        </linearGradient>
      </defs>
      <ellipse cx="1130" cy="452" rx="220" ry="26" fill={a} opacity="0.3" />
      <rect x="1040" y="118" width="190" height="344" rx="30" fill="#0a0e32" stroke="#2c3790" strokeWidth="4" />
      <rect x="1054" y="140" width="162" height="300" rx="18" fill={`url(#${id}-scr)`} />
      <rect x="1108" y="126" width="54" height="8" rx="4" fill="#2c3790" />
      {icons}
      <Ticket x={1088} y={402} w={92} h={26} color={a} />
      <Ground y={460} />
    </g>
  );
}

function BagsSubject({ a }: { a: string }) {
  const bag = (x: number, y: number, s: number, c: string, r: number, k: number) => (
    <g key={k} transform={`rotate(${r} ${x} ${y})`}>
      <path
        d={`M ${x - 22 * s} ${y - 20 * s} q 0 -26 ${22 * s} -26 q ${22 * s} 0 ${22 * s} 26`}
        fill="none"
        stroke="#f8f3ea"
        strokeWidth={4 * s}
      />
      <path d={`M ${x - 40 * s} ${y - 20 * s} h ${80 * s} l ${8 * s} ${86 * s} h ${-96 * s} z`} fill={c} />
      <path d={`M ${x - 40 * s} ${y - 20 * s} h ${80 * s} l ${2 * s} ${16 * s} h ${-84 * s} z`} fill="#000" opacity="0.15" />
      <path d={SPARKLE} transform={`translate(${x} ${y + 28 * s}) scale(${1.4 * s})`} fill="#fff" opacity="0.9" />
    </g>
  );
  return (
    <g>
      {bag(1150, 250, 1.3, a, -8, 0)}
      {bag(980, 330, 0.9, GOLD, 10, 1)}
      {bag(1320, 340, 1, "#b062ff", 6, 2)}
      {bag(860, 190, 0.7, "#5aa2ff", -12, 3)}
      <Ticket x={1210} y={140} color="#9be33c" rotate={-14} />
      <Ticket x={1040} y={170} w={60} h={34} color="#ff8a1f" rotate={12} />
      <Ticket x={760} y={320} w={56} h={32} color={a} rotate={-6} />
      <path d="M 0 520 C 360 480 760 500 1040 476 C 1220 462 1340 470 1440 462 L 1440 520 Z" fill={NIGHT} />
    </g>
  );
}

function StorefrontSubject({ a, id }: { a: string; id: string }) {
  const base = 452;
  return (
    <g>
      <Planet cx={760} cy={120} r={26} light="#c7b6ff" dark="#4b2fb0" id={`${id}-p`} />
      <Ground />
      <rect x="900" y={base - 262} width="440" height="262" fill="#121852" />
      <rect x="890" y={base - 262} width="460" height="16" fill="#0b0f36" />
      <rect x="980" y={base - 232} width="280" height="40" rx="8" fill="#0a0e32" stroke={a} strokeWidth="3" />
      <Ticket x={1000} y={base - 226} w={48} h={28} color={GOLD} />
      <rect x="1060" y={base - 220} width="170" height="10" rx="3" fill="#f8f3ea" opacity="0.85" />
      <rect x="1060" y={base - 205} width="110" height="7" rx="3" fill="#f8f3ea" opacity="0.5" />
      <Awning x={910} y={base - 182} w={420} color={a} stripes={10} />
      <rect x="922" y={base - 132} width="250" height="118" rx="4" fill={a} opacity="0.3" />
      <Ticket x={940} y={base - 118} w={66} h={38} color="#ff77b4" rotate={-6} />
      <Ticket x={1020} y={base - 104} w={66} h={38} color="#9be33c" rotate={5} />
      <Ticket x={1096} y={base - 120} w={62} h={36} color="#5aa2ff" rotate={-3} />
      <rect x="1196" y={base - 132} width="110" height="132" fill="#0a0e32" />
      <rect x="1212" y={base - 120} width="78" height="26" rx="13" fill="none" stroke="#ef2b3a" strokeWidth="3" />
      <text
        x="1251"
        y={base - 101}
        textAnchor="middle"
        fontFamily="Outfit, system-ui, sans-serif"
        fontWeight="800"
        fontSize="16"
        fill="#ff8a95"
      >
        OPEN
      </text>
      <circle cx="1290" cy={base - 60} r="3" fill={GOLD} />
      <StringLights
        points={[
          [700, 340],
          [890, base - 262],
          [1350, base - 262],
          [1440, 230],
        ]}
        sag={30}
      />
    </g>
  );
}

function LaunchSubject({ a, id }: { a: string; id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-flame`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6cc" />
          <stop offset="0.45" stopColor={GOLD} />
          <stop offset="1" stopColor={a} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* coupon trail */}
      <Ticket x={1030} y={378} w={54} h={30} color="#ff77b4" rotate={-20} />
      <Ticket x={985} y={318} w={48} h={28} color={GOLD} rotate={14} />
      <Ticket x={935} y={392} w={44} h={26} color="#9be33c" rotate={-8} />
      <Ticket x={1290} y={300} w={44} h={26} color="#5aa2ff" rotate={20} />
      <g transform="rotate(14 1170 250)">
        <path d="M 1150 330 Q 1170 470 1190 330 Z" fill={`url(#${id}-flame)`} />
        <path d="M 1170 120 C 1210 160 1214 250 1206 320 L 1134 320 C 1126 250 1130 160 1170 120 Z" fill="#f1f3ff" />
        <path d="M 1170 120 C 1190 140 1200 160 1204 180 L 1136 180 C 1140 160 1150 140 1170 120 Z" fill={a} />
        <circle cx="1170" cy="222" r="18" fill="#1b2263" stroke={a} strokeWidth="6" />
        <circle cx="1164" cy="216" r="6" fill="#fff" opacity="0.5" />
        <path d="M 1134 270 L 1104 330 L 1136 320 Z" fill={a} />
        <path d="M 1206 270 L 1236 330 L 1204 320 Z" fill={a} />
        <rect x="1162" y="290" width="16" height="34" rx="6" fill={a} opacity="0.85" />
      </g>
      {/* smoke */}
      {[
        [1080, 450, 46],
        [1150, 462, 58],
        [1240, 452, 50],
        [1310, 466, 40],
        [1010, 468, 34],
      ].map(([x, y, r], k) => (
        <circle key={k} cx={x} cy={y} r={r} fill="#28307a" opacity="0.9" />
      ))}
      <Ground y={470} />
    </g>
  );
}

function TowerSubject({ a, id }: { a: string; id: string }) {
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-sweep`} cx="0" cy="0" r="1">
          <stop offset="0" stopColor={a} stopOpacity="0.6" />
          <stop offset="1" stopColor={a} stopOpacity="0" />
        </radialGradient>
      </defs>
      {[90, 160, 230, 300].map((r) => (
        <ellipse key={r} cx="1170" cy="452" rx={r * 1.8} ry={r * 0.32} fill="none" stroke={a} strokeOpacity="0.25" strokeWidth="1.5" />
      ))}
      <path d="M 1170 150 L 860 60 A 330 330 0 0 1 940 20 Z" fill={`url(#${id}-sweep)`} opacity="0.7" />
      <Ground />
      <polygon points="1140,452 1150,240 1190,240 1200,452" fill="#151c5c" />
      <rect x="1110" y="196" width="120" height="48" rx="6" fill="#1d2570" />
      <rect x="1120" y="206" width="100" height="22" fill={a} opacity="0.55" />
      <rect x="1104" y="188" width="132" height="10" rx="4" fill="#0b0f36" />
      <rect x="1166" y="150" width="8" height="38" fill="#2a3270" />
      <path d="M 1140 156 A 34 22 0 0 1 1200 150 L 1170 160 Z" fill="#cfd6ff" />
      <circle cx="1170" cy="146" r="4" fill="#ef2b3a" />
      <circle cx="1170" cy="146" r="12" fill="#ef2b3a" opacity="0.3" />
      {[300, 350, 400].map((y) => (
        <rect key={y} x="1162" y={y} width="16" height="10" fill={GOLD} opacity="0.8" />
      ))}
    </g>
  );
}

function LostSubject({ a, id }: { a: string; id: string }) {
  return (
    <g>
      <Planet cx={1290} cy={360} r={60} light="#9fb4ff" dark="#2b3aa0" id={`${id}-p`} />
      <g transform="rotate(-18 1000 200)">
        <path d="M 900 160 h 100 l -8 12 l 8 12 l -8 12 l 8 12 l -8 12 l 8 12 h -100 v -24 a 10 10 0 0 0 0 -20 z" fill="#ff8a1f" />
        <rect x="914" y="180" width="54" height="10" rx="3" fill="#fff" opacity="0.85" />
      </g>
      <g transform="rotate(22 1110 240)">
        <path d="M 1070 210 h 100 v 26 a 10 10 0 0 0 0 20 v 26 h -100 l 8 -12 l -8 -12 l 8 -12 l -8 -12 l 8 -12 l -8 -12 z" fill="#ff77b4" />
        <rect x="1096" y="230" width="44" height="10" rx="3" fill="#fff" opacity="0.85" />
      </g>
      <path d={SPARKLE} transform="translate(1040 230) scale(1.6)" fill={a} />
    </g>
  );
}

function CelebrateSubject({ a }: { a: string }) {
  const burst = (cx: number, cy: number, r: number, c: string, k: number) => (
    <g key={k}>
      {Array.from({ length: 14 }, (_, i) => {
        const t = (i / 14) * Math.PI * 2;
        return (
          <g key={i}>
            <line
              x1={cx + Math.cos(t) * r * 0.35}
              y1={cy + Math.sin(t) * r * 0.35}
              x2={cx + Math.cos(t) * r}
              y2={cy + Math.sin(t) * r}
              stroke={c}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.85"
            />
            <circle cx={cx + Math.cos(t) * (r + 8)} cy={cy + Math.sin(t) * (r + 8)} r="2.6" fill={c} />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.9} fill={c} opacity="0.08" />
    </g>
  );
  return (
    <g>
      {burst(1120, 170, 80, a, 0)}
      {burst(1300, 250, 56, GOLD, 1)}
      {burst(930, 230, 50, "#ff77b4", 2)}
      {[760, 820, 870, 940, 1000, 1070, 1140, 1210, 1280, 1350, 1410].map((x, i) => (
        <rect key={x} x={x} y={380 - ((i * 29) % 70)} width={56} height={140} fill="#0f1546" />
      ))}
      <Ground y={460} />
    </g>
  );
}

function OrbitSubject({ a, id }: { a: string; id: string }) {
  return (
    <g>
      <ellipse cx="1180" cy="260" rx="260" ry="80" fill="none" stroke="#fff" strokeOpacity="0.22" strokeDasharray="4 8" strokeWidth="2" />
      <Planet cx={1180} cy={260} r={78} light="#f6d68a" dark={a} id={`${id}-op`} />
      <circle cx="930" cy="250" r="14" fill="#5aa2ff" />
      <circle cx="1420" cy="282" r="10" fill="#ff77b4" />
      <Ticket x={1310} y={170} w={52} h={30} color={GOLD} rotate={-12} />
    </g>
  );
}

const SUBJECTS: Record<SceneName, (p: { a: string; id: string }) => ReactNode> = {
  street: StreetSubject,
  directory: DirectorySubject,
  observatory: ObservatorySubject,
  ideas: IdeasSubject,
  gallery: GallerySubject,
  lighthouse: LighthouseSubject,
  phone: PhoneSubject,
  bags: BagsSubject,
  storefront: StorefrontSubject,
  launch: LaunchSubject,
  tower: TowerSubject,
  lost: LostSubject,
  celebrate: CelebrateSubject,
  orbit: OrbitSubject,
};

interface SceneProps {
  name: SceneName;
  /** Tint for the horizon glow and the subject (defaults per scene). */
  accent?: string;
  className?: string;
  /** Anchor; bottom-right keeps the subject visible on narrow screens. */
  align?: "right" | "center";
  /** Trim the empty upper sky for short banners and cards. */
  compact?: boolean;
}

export default function Scene({
  name,
  accent,
  className,
  align = "right",
  compact = false,
}: SceneProps) {
  const id = `sc${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const a = accent || SCENE_ACCENTS[name];
  const Subject = SUBJECTS[name];
  return (
    <svg
      viewBox={compact ? "0 150 1440 330" : "0 0 1440 520"}
      preserveAspectRatio={`${align === "right" ? "xMax" : "xMid"}${compact ? "YMid" : "YMax"} slice`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d0826" />
          <stop offset="0.65" stopColor="#1c1250" />
          <stop offset="1" stopColor="#2a1a62" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.78" cy="0.92" r="0.62">
          <stop offset="0" stopColor={a} stopOpacity="0.55" />
          <stop offset="0.55" stopColor={a} stopOpacity="0.12" />
          <stop offset="1" stopColor={a} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="520" fill={`url(#${id}-sky)`} />
      <rect width="1440" height="520" fill={`url(#${id}-glow)`} />
      <Stars seed={name} />
      <Subject a={a} id={id} />
    </svg>
  );
}

interface SceneBackdropProps extends SceneProps {
  /** Darken toward the page so overlaid text stays readable. */
  fade?: "left" | "bottom" | "both" | "none";
}

/**
 * Scene positioned behind content. The parent needs
 * `relative isolate overflow-hidden`.
 */
export function SceneBackdrop({ fade = "both", ...props }: SceneBackdropProps) {
  const overlays: string[] = [];
  if (fade === "left" || fade === "both") {
    overlays.push(
      "linear-gradient(90deg, hsl(var(--background) / 0.92) 0%, hsl(var(--background) / 0.55) 38%, transparent 68%)",
    );
  }
  if (fade === "bottom" || fade === "both") {
    overlays.push(
      "linear-gradient(180deg, transparent 55%, hsl(var(--background) / 0.95) 100%)",
    );
  }
  return (
    <>
      <Scene
        {...props}
        className={`pointer-events-none absolute inset-0 -z-20 h-full w-full ${props.className || ""}`}
      />
      {overlays.length ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: overlays.join(", ") }}
        />
      ) : null}
    </>
  );
}
