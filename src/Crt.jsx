import React, { useEffect, useRef } from "react";

/*
  Hero surveillance feed, edge to edge.
  A 2D canvas draws the feed (title, HUD, live clock, countdown). One WebGL
  fragment shader turns it into a CRT image (slight curvature, RGB fringing,
  scanlines, phosphor glow, grain) and draws a targeting scope that magnifies
  whatever is under it. The scope follows the pointer; when the pointer is idle
  (or on touch screens) it slowly scans across the title by itself.
  Renders only while on screen; static under reduced motion; flat 2D fallback
  without WebGL.
*/

const START = Date.UTC(2026, 11, 12, 8);
const RED = "#ff3b1f", PAPER = "#ece6d9";

const VERT = `attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}`;
const FRAG = `
precision mediump float;
uniform sampler2D T;uniform vec2 R,P;uniform float t,gl1,RP,fade;
varying vec2 v;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 p=v*2.-1.;
  vec2 c=p*(1.+.022*dot(p,p));
  vec2 uv=c*.5+.5;
  vec2 fp=(uv-P)*R;float dp=length(fp);
  float inside=1.-smoothstep(RP-1.5,RP+.5,dp);
  uv=mix(uv,P+(uv-P)*.5,inside);
  float row=floor(uv.y*42.);
  float g=gl1*step(.78,h(vec2(row,floor(t*16.))));
  uv.x+=g*(h(vec2(row,7.))-.5)*.06;
  vec2 m=smoothstep(0.,.002,uv)*smoothstep(0.,.002,1.-uv);
  float mask=m.x*m.y;
  float ca=.0008+g*.01+.0012*dot(c,c)+inside*.0012;
  vec3 col=vec3(texture2D(T,uv+vec2(ca,0.)).r,texture2D(T,uv).g,texture2D(T,uv-vec2(ca,0.)).b);
  vec3 gw=vec3(0.);float ar=R.y/R.x;
  for(int i=0;i<8;i++){float an=float(i)*.7854;gw+=texture2D(T,uv+vec2(cos(an)*ar,sin(an))*.006).rgb;}
  col+=max(gw/8.-.18,0.)*.8;
  col=mix(col,col*vec3(1.06,.9,.86)+vec3(.035,.004,0.),inside);
  float ring=1.-smoothstep(.7,1.8,abs(dp-RP));
  float dot0=1.-smoothstep(1.2,2.4,dp);
  float th=1.;
  float tk=step(abs(fp.y),th)*step(RP*.78,abs(fp.x))*step(abs(fp.x),RP*1.3)
          +step(abs(fp.x),th)*step(RP*.78,abs(fp.y))*step(abs(fp.y),RP*1.3);
  col=mix(col,vec3(1.,.25,.13)*1.1,clamp(ring+tk+dot0,0.,1.));
  col*=.86+.14*sin(uv.y*R.y*1.5708);
  float y=fract(uv.y*.6-t*.05);col+=exp(-pow((y-.5)*10.,2.))*.025;
  col+=(h(gl_FragCoord.xy+fract(t*7.)*91.)-.5)*.05;
  col*=1.-.22*dot(c*.7,c*.7);
  float ef=smoothstep(0.,.1,v.y)*smoothstep(0.,.1,1.-v.y);
  col=mix(vec3(.043,.043,.039),col,mask*ef*fade);
  gl_FragColor=vec4(col,1.);
}`;

const pad = (n) => String(n).padStart(2, "0");
const clock = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

// Draws the feed; returns the title box (CSS px) so the scope can scan it.
function drawFeed(c, w, h) {
  const now = Date.now();
  c.fillStyle = "#0b0b0a"; c.fillRect(0, 0, w, h);
  const bg = c.createRadialGradient(w * .5, h * .5, 0, w * .5, h * .5, Math.max(w, h) * .6);
  bg.addColorStop(0, "rgba(255,59,31,.13)"); bg.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = bg; c.fillRect(0, 0, w, h);

  const gs = Math.max(28, Math.round(Math.min(w, h) / 12));
  c.strokeStyle = "rgba(255,59,31,.08)"; c.lineWidth = 1; c.beginPath();
  for (let x = (w % gs) / 2; x < w; x += gs) { c.moveTo(x + .5, 0); c.lineTo(x + .5, h); }
  for (let y = (h % gs) / 2; y < h; y += gs) { c.moveTo(0, y + .5); c.lineTo(w, y + .5); }
  c.stroke();

  const m = Math.min(64, Math.max(16, w * .045)), L = Math.min(w, h) * .06, top = m * .8;
  c.strokeStyle = "rgba(236,230,217,.7)"; c.lineWidth = 1.5; c.beginPath();
  [[m, top, 1, 1], [w - m, top, -1, 1], [m, h - top, 1, -1], [w - m, h - top, -1, -1]].forEach(([x, y, sx, sy]) => {
    c.moveTo(x, y + sy * L); c.lineTo(x, y); c.lineTo(x + sx * L, y);
  });
  c.stroke();

  const wide = w / h > 1.15;
  c.fillStyle = PAPER;
  if ("fontStretch" in c) c.fontStretch = "expanded";
  c.textBaseline = "alphabetic";
  c.font = `900 100px Archivo, "Arial Black", sans-serif`;
  let box;
  if (wide) {
    const k = (w * .82) / c.measureText("SPYHACK").width;
    const fs = Math.min(100 * k, h * .4);
    c.font = `900 ${fs}px Archivo, "Arial Black", sans-serif`;
    const tw = c.measureText("SPYHACK").width, tx = (w - tw) / 2, ty = h * .52 + fs * .36;
    c.fillText("SPYHACK", tx, ty);
    box = { x: tx, y: ty - fs * .72, w: tw, h: fs * .72 };
  } else {
    const k = (w * .78) / c.measureText("HACK").width;
    const fs = Math.min(100 * k, h * .26);
    c.font = `900 ${fs}px Archivo, "Arial Black", sans-serif`;
    const tw = c.measureText("HACK").width, tx = (w - tw) / 2, ty = h * .5 - fs * .04;
    c.fillText("SPY", tx, ty); c.fillText("HACK", tx, ty + fs * .86);
    box = { x: tx, y: ty - fs * .72, w: tw, h: fs * 1.58 };
  }
  if ("fontStretch" in c) c.fontStretch = "normal";

  const fz = Math.max(10.5, Math.min(17, Math.min(w, h) * .034));
  c.font = `500 ${fz}px "IBM Plex Mono", ui-monospace, monospace`;
  c.textBaseline = "top";
  const tx0 = m + fz * .9, ty0 = top + fz * .9;
  c.fillStyle = RED;
  if (Math.floor(now / 1000) % 2 === 0) { c.beginPath(); c.arc(tx0 + fz * .4, ty0 + fz * .55, fz * .36, 0, 7); c.fill(); }
  c.fillText("REC", tx0 + fz * 1.2, ty0);
  c.fillStyle = "rgba(236,230,217,.82)";
  c.fillText("CAM 03 · MANCHESTER", tx0, ty0 + fz * 1.6);
  c.textAlign = "right";
  c.fillText(`${clock.format(now)} UK`, w - tx0, ty0);
  c.fillStyle = RED; c.fillText("TGT-01 TRACKING", w - tx0, ty0 + fz * 1.6);
  c.textBaseline = "alphabetic";
  const d = Math.max(0, START - now);
  const cd = d ? `T-${pad(Math.floor(d / 864e5))}D ${pad(Math.floor(d / 36e5) % 24)}H ${pad(Math.floor(d / 6e4) % 60)}M ${pad(Math.floor(d / 1e3) % 60)}S` : "MISSION LIVE";
  c.fillStyle = PAPER;
  c.font = `600 ${fz * 1.12}px "IBM Plex Mono", ui-monospace, monospace`;
  c.fillText(cd, w - tx0, h - top - fz * .9);
  c.textAlign = "left";
  c.font = `500 ${fz}px "IBM Plex Mono", ui-monospace, monospace`;
  c.fillStyle = "rgba(236,230,217,.82)";
  c.fillText("53.47°N  2.23°W", tx0, h - top - fz * .9);
  return box;
}

function compile(gl, type, src) {
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

export default function Crt() {
  const wrap = useRef(null), cv = useRef(null);

  useEffect(() => {
    const el = wrap.current, canvas = cv.current;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let gl = null;
    try { gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, stencil: false }); } catch (e) { gl = null; }
    const feed = gl ? document.createElement("canvas") : canvas;
    const c2 = feed.getContext("2d");

    let tex, U = {};
    if (gl) {
      try {
        const prog = gl.createProgram();
        gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
        gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(prog); gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        ["T", "R", "P", "t", "gl1", "RP", "fade"].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
      } catch (e) { gl = null; }
    }
    if (!gl) el.classList.add("crt--flat");

    let w = 1, h = 1, s = 1, visible = true, raf = 0, glitchUntil = 0, lastMove = -1e9;
    let box = { x: 0, y: 0, w: 1, h: 1 };
    const t0 = performance.now();
    const scope = { x: .5, y: .5, tx: .5, ty: .5, init: false };

    const paint = () => {
      c2.setTransform(s, 0, 0, s, 0, 0);
      box = drawFeed(c2, w, h);
      if (gl) { gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, feed); }
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      s = Math.min(devicePixelRatio || 1, 1.75, Math.sqrt(2.6e6 / (w * h)));
      canvas.width = feed.width = Math.round(w * s);
      canvas.height = feed.height = Math.round(h * s);
      paint();
      if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
      frame(performance.now());
    };

    // idle path: slow figure-of-eight over the title (uv, y up)
    const idle = (sec) => {
      const cx = (box.x + box.w / 2) / w, cy = 1 - (box.y + box.h / 2) / h;
      return [cx + (box.w / w) * .4 * Math.sin(sec * .32), cy + (box.h / h) * .22 * Math.sin(sec * .64)];
    };

    const frame = (now) => {
      const sec = reduce ? 4 : (now - t0) / 1000;
      if (now - lastMove > 2500) { const [x, y] = idle(sec); scope.tx = x; scope.ty = y; }
      if (!scope.init || reduce) { scope.x = scope.tx; scope.y = scope.ty; scope.init = true; }
      scope.x += (scope.tx - scope.x) * .09; scope.y += (scope.ty - scope.y) * .09;
      if (!gl) return;
      gl.uniform1i(U.T, 0);
      gl.uniform2f(U.R, canvas.width, canvas.height);
      gl.uniform2f(U.P, scope.x, scope.y);
      gl.uniform1f(U.RP, Math.min(w, h) * (w > h ? .17 : .2) * s);
      gl.uniform1f(U.t, sec);
      gl.uniform1f(U.gl1, now < glitchUntil ? 1 : 0);
      gl.uniform1f(U.fade, reduce ? 1 : Math.min(1, (now - t0) / 700));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const loop = (now) => { frame(now); raf = visible && !document.hidden && !reduce ? requestAnimationFrame(loop) : 0; };
    const start = () => { if (!raf && visible && !document.hidden && !reduce) raf = requestAnimationFrame(loop); };

    const onMove = (e) => {
      if (e.pointerType === "touch") return;
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      scope.tx = x; scope.ty = 1 - y; lastMove = performance.now();
    };
    const glitch = () => { if (!reduce) glitchUntil = performance.now() + 200; };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); });
    io.observe(el);
    const ro = new ResizeObserver(resize); ro.observe(canvas);
    const tick = setInterval(() => { if (visible) { paint(); if (reduce) frame(performance.now()); } }, 1000);
    const onVis = () => start();
    document.addEventListener("visibilitychange", onVis);
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerdown", glitch);
    document.fonts && Promise.all([document.fonts.load('900 100px "Archivo"'), document.fonts.load('500 16px "IBM Plex Mono"')]).then(paint, () => {});

    resize(); start();
    return () => {
      cancelAnimationFrame(raf); clearInterval(tick); io.disconnect(); ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", glitch);
    };
  }, []);

  return (
    <div className="crt" ref={wrap} aria-hidden="true">
      <canvas ref={cv} className="crt__screen" />
    </div>
  );
}
