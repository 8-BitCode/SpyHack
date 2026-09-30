import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// Fixed 3D backdrop: globe with live hotspots + data arcs, radar sweep, orbiting satellites,
// a drifting intelligence network, and a scroll-driven perspective grid.
export default function Scene() {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = innerWidth < 800;
    const r = new THREE.WebGLRenderer({ antialias: !small, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
    el.appendChild(r.domElement);
    const s = new THREE.Scene();
    s.fog = new THREE.Fog(0x1c0507, 7, 26);
    const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    cam.position.z = 9;
    const RED = 0xe3201b, BONE = 0xeadfcb, R = 2.6;
    const lm = (c, o, add) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending });
    const ll = (lat, lon, rad) => {
      const p = ((90 - lat) * Math.PI) / 180, t = ((lon + 180) * Math.PI) / 180;
      return new THREE.Vector3(-rad * Math.sin(p) * Math.cos(t), rad * Math.cos(p), rad * Math.sin(p) * Math.sin(t));
    };

    // --- globe
    const globe = new THREE.Group();
    s.add(globe);
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(R - 0.02, 32, 24), new THREE.MeshBasicMaterial({ color: 0x0d0203 })));
    globe.add(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(R, 28, 18)), lm(RED, 0.55, true)));
    [3.3, 4.1].forEach((rad, i) => {
      const ring = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.TorusGeometry(rad, 0.01, 2, 96)), lm(BONE, 0.25));
      ring.rotation.set(1.2 + i * 0.5, i * 0.6, 0);
      globe.add(ring);
    });

    // --- hotspots + arcs (Manchester is the hub)
    const cities = [
      [53.5, -2.2],   // Manchester (hub)
      [38.9, -77],    // Washington
      [34, -118],     // Los Angeles
      [19.4, -99.1],  // Mexico City
      [-23.5, -46.6], // Sao Paulo
      [-33.4, -70.6], // Santiago
      [6.5, 3.4],     // Lagos
      [-1.3, 36.8],   // Nairobi
      [-33.9, 18.4],  // Cape Town
      [55.7, 37.6],   // Moscow
      [25.2, 55.3],   // Dubai
      [28.6, 77.2],   // Delhi
      [1.35, 103.8],  // Singapore
      [39.9, 116.4],  // Beijing
      [35.7, 139.7],  // Tokyo
    ];
    const pins = [], travellers = [];
    cities.forEach(([la, lo], i) => {
      const p = ll(la, lo, R);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(i ? 0.045 : 0.08, 8, 8), new THREE.MeshBasicMaterial({ color: i ? RED : BONE }));
      dot.position.copy(p);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.075, 24), new THREE.MeshBasicMaterial({ color: RED, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
      ring.position.copy(p);
      ring.lookAt(p.clone().multiplyScalar(2));
      globe.add(dot, ring);
      pins.push(ring);
      if (i) {
        const a = ll(cities[0][0], cities[0][1], R), b = p;
        const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R + Math.min(a.distanceTo(b) * 0.45, 2));
        const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
        globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)), lm(RED, 0.7, true)));
        const tr = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), new THREE.MeshBasicMaterial({ color: BONE }));
        globe.add(tr);
        travellers.push({ tr, curve, o: i / 15, sp: 0.12 + (i % 3) * 0.05 });
      }
    });

    // --- radar sweep
    const sweep = new THREE.Group();
    const fan = new THREE.Mesh(new THREE.CircleGeometry(3.6, 48, 0, 0.9), new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    fan.rotation.x = -Math.PI / 2;
    const beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(3.6, 0, 0)]), lm(RED, 0.9, true));
    sweep.add(fan, beam);
    globe.add(sweep);

    // --- satellites (Sputnik-style)
    const sats = [0, 1, 2].map((k) => {
      const orbit = new THREE.Group();
      orbit.rotation.set(0.5 + k * 0.9, k * 1.7, 0.35 - k * 0.5);
      const sat = new THREE.Group();
      sat.position.x = 3.9 + k * 0.55;
      sat.scale.setScalar(1 - k * 0.2);
      sat.add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshBasicMaterial({ color: BONE, wireframe: true })));
      const pts = [];
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => pts.push(0, 0, 0, -1.1, a * 0.45, b * 0.45));
      sat.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)), lm(BONE, 0.9)));
      orbit.add(sat);
      globe.add(orbit);
      return { orbit, sat, sp: 3 - k * 0.8 };
    });

    // --- intelligence network (nodes + links)
    const net = new THREE.Group();
    const NN = small ? 34 : 70, np = [];
    for (let i = 0; i < NN; i++) np.push(new THREE.Vector3().randomDirection().multiplyScalar(9 + Math.random() * 7));
    const lp = [];
    np.forEach((a, i) => np.slice(i + 1).forEach((b) => { if (a.distanceTo(b) < 5.5) lp.push(a.x, a.y, a.z, b.x, b.y, b.z); }));
    net.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(lp, 3)), lm(BONE, 0.13)));
    net.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(np), new THREE.PointsMaterial({ color: RED, size: 0.12, transparent: true })));
    s.add(net);

    // --- dust + perspective grid
    const N = small ? 250 : 500, dp = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) dp.set(new THREE.Vector3().randomDirection().multiplyScalar(6 + Math.random() * 12).toArray(), i * 3);
    const dust = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(dp, 3)), new THREE.PointsMaterial({ color: BONE, size: 0.04, transparent: true, opacity: 0.6 }));
    s.add(dust);
    const grid = new THREE.GridHelper(70, 70, RED, RED);
    grid.position.y = -5.5;
    grid.material.transparent = true;
    grid.material.opacity = 0.16;
    s.add(grid);

    const mouse = { x: 0, y: 0 }, sm = { x: 0, y: 0, s: 0, v: 0 };
    let last = scrollY, spin = 0;
    const onMove = (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; };
    const resize = () => {
      r.setSize(innerWidth, innerHeight);
      cam.aspect = innerWidth / innerHeight;
      cam.updateProjectionMatrix();
      globe.scale.setScalar(innerWidth > 900 ? 1 : 0.72);
    };
    resize();
    addEventListener("resize", resize);
    addEventListener("pointermove", onMove);

    let raf, t = 0;
    const tick = () => {
      const dt = reduce ? 0 : 1;
      t += 0.004 * dt;
      sm.s += (scrollY / innerHeight - sm.s) * 0.06;
      sm.x += (mouse.x - sm.x) * 0.05;
      sm.y += (mouse.y - sm.y) * 0.05;
      sm.v += (scrollY - last - sm.v) * 0.12; // scroll velocity
      last = scrollY;
      spin += sm.v * 0.0012;
      const sc = sm.s, wide = innerWidth > 900;

      globe.rotation.y = t + sc * 1.2 + spin;
      globe.rotation.x = 0.35 + sm.y * 0.4 + sc * 0.15;
      globe.position.x = wide ? 3.2 * Math.cos(sc * 1.1) : 0;
      globe.position.y = Math.sin(sc * 0.8) * 0.8 - sm.y * 0.3;
      sweep.rotation.y = t * 9;
      sats.forEach((o) => { o.orbit.rotation.y = t * o.sp; o.sat.rotation.y = -t * o.sp; });
      pins.forEach((p, i) => { const k = (t * 0.55 + i * 0.37) % 1; p.scale.setScalar(1 + k * 1.6); p.material.opacity = (1 - k) * (1 - k) * 0.35; });
      travellers.forEach((o) => o.tr.position.copy(o.curve.getPoint((t * 16 * o.sp + o.o) % 1)));
      net.rotation.y = -t * 0.35 + sc * 0.3;
      net.rotation.x = sc * 0.12;
      dust.rotation.y = -t * 0.3;
      grid.position.z = ((sc * 7 + t * 10) % 1);
      cam.position.x = sm.x * 0.8;
      cam.position.z = 9 - Math.min(Math.abs(sm.v) * 0.04, 1.2);
      cam.fov = 50 + Math.min(Math.abs(sm.v) * 0.12, 10);
      cam.updateProjectionMatrix();
      r.render(s, cam);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
      r.dispose();
      el.removeChild(r.domElement);
    };
  }, []);
  return <div ref={ref} className="scene" aria-hidden="true" />;
}