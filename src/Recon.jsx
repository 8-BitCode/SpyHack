import React, { useMemo } from "react";

// Decorative "surveillance photo" of the venue: abstract aerial blocks on grainy
// grey, a red target and annotation callouts whose leader lines draw in on scroll.
// Not a real map: the real directions are the links beside it.

function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const W = 800, H = 560, TX = 340, TY = 246, TW = 146, TH = 84;

const CALLOUTS = [
  { x: 28, y: 30, w: 210, t: "ADDR", l: ["BOOTH ST E", "MANCHESTER M13"], to: [TX, TY] },
  { x: 560, y: 30, w: 212, t: "WHEN", l: ["SAT 12.12.2026", "08:00 - 21:00"], to: [TX + TW, TY] },
  { x: 28, y: 410, w: 230, t: "ACCESS", l: ["STEP-FREE GROUND", "FLOOR ENTRANCES"], to: [TX, TY + TH] },
  { x: 520, y: 410, w: 252, t: "RAIL", l: ["NEAREST STATION", "MANCHESTER OXFORD RD"], to: [TX + TW, TY + TH] },
];

export default function Recon() {
  const blocks = useMemo(() => {
    const r = rng(1212), out = [];
    const cols = [0, 70, 150, 210, 300, 380, 470, 520, 610, 690, 760, 800];
    const rows = [0, 60, 130, 200, 290, 360, 440, 500, 560];
    for (let i = 0; i < cols.length - 1; i++) for (let j = 0; j < rows.length - 1; j++) {
      const x = cols[i] + 8, y = rows[j] + 8, w = cols[i + 1] - cols[i] - 16, h = rows[j + 1] - rows[j] - 16;
      if (w < 8 || h < 8 || r() < .12) continue;
      if (r() < .45) { const sw = w * (.35 + r() * .3); out.push([x, y, sw, h, r()], [x + sw + 6, y, w - sw - 6, h, r()]); }
      else out.push([x, y, w, h, r()]);
    }
    return out;
  }, []);

  return (
    <figure className="recon rv" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <g className="recon__blocks">
          {blocks.map(([x, y, w, h, o], i) => <rect key={i} x={x} y={y} width={w} height={h} opacity={.25 + o * .6} />)}
        </g>
        {/* crosshair through target */}
        <path className="recon__hair" d={`M0 ${TY + TH / 2}H${W}M${TX + TW / 2} 0V${H}`} />
        {/* small red squares */}
        {[[120, 180], [662, 230], [470, 470], [240, 120], [700, 330]].map(([x, y], i) => <rect key={i} className="recon__sq" x={x} y={y} width="14" height="14" />)}
        {/* leader lines */}
        {CALLOUTS.map((c, i) => {
          const sy = c.y + (c.y < TY ? 22 + c.l.length * 20 + 12 : 0);
          return <path key={i} className="recon__line" pathLength="1" style={{ "--i": i }} d={`M${c.x < TX ? c.x + c.w : c.x} ${sy}L${c.to[0]} ${c.to[1]}`} />;
        })}
        {/* target */}
        <g className="recon__tgt">
          <rect x={TX} y={TY} width={TW} height={TH} />
          <text className="recon__tk" x={TX + 10} y={TY + 20}>TARGET</text>
          <text x={TX + 10} y={TY + 45}>NANCY</text>
          <text x={TX + 10} y={TY + 66}>ROTHWELL</text>
          <rect className="recon__ring" x={TX - 14} y={TY - 14} width={TW + 28} height={TH + 28} />
        </g>
        <text className="recon__coord" x={TX + TW + 22} y={TY + TH + 30}>53.47N / 2.23W</text>
        {/* callouts */}
        {CALLOUTS.map((c) => (
          <g key={c.t} className="recon__call">
            <rect className="recon__tag" x={c.x} y={c.y} width={c.t.length * 12 + 18} height="22" />
            <text className="recon__tagt" x={c.x + 9} y={c.y + 16}>{c.t}</text>
            <rect className="recon__box" x={c.x} y={c.y + 22} width={c.w} height={c.l.length * 20 + 12} />
            {c.l.map((l, k) => <text key={k} className="recon__txt" x={c.x + 10} y={c.y + 42 + k * 20}>{l}</text>)}
          </g>
        ))}
      </svg>
    </figure>
  );
}
