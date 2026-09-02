"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useTheme } from "@/context/ThemeContext";

// Ported from docs/design/portfolio-home/Portfolio Home.dc.html, initGL()
// (lines 307-333): two slow-drifting soft blobs plus film grain, painted with
// a raw WebGL shader instead of a canvas library.
const VERTEX_SHADER = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

// Copied verbatim from the design export (fragment shader source only).
const FRAGMENT_SHADER = `precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;uniform vec3 c;uniform float s;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){vec2 uv=gl_FragCoord.xy/r;float ar=r.x/r.y;vec2 p=vec2(uv.x*ar,uv.y);
vec2 mm=vec2(m.x/r.x*ar,1.-m.y/r.y);
vec2 b1=vec2(.25*ar+.12*sin(t*.07),.7+.08*cos(t*.05))+(mm-vec2(.5*ar,.5))*.06;
vec2 b2=vec2(.8*ar+.1*cos(t*.06),.25+.1*sin(t*.045));
float g1=exp(-pow(distance(p,b1)/.55,2.));float g2=exp(-pow(distance(p,b2)/.6,2.));
float grain=(h(gl_FragCoord.xy+fract(t)*13.)-.5)*.018;
float a=g1*.045+g2*.035+grain;
vec3 warm=vec3(1.,.93,.78);vec3 cool=vec3(.78,.86,1.);
vec3 col=(warm*g1+cool*g2)/max(g1+g2,.001);
gl_FragColor=vec4(c*col*max(a,0.),max(a,0.));}`;

// Fixed full-viewport backdrop behind the page content. Reduced motion (OS
// preference or reader mode) drops the canvas entirely, no context, no
// listeners, nothing to pause.
export function GlBackdrop(): JSX.Element | null {
  const reduced = usePrefersReducedMotion();
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const themeRef = useRef(theme);

  // The GL effect below must not depend on theme (a toggle would tear down
  // and recompile the whole program), so the draw loop reads it through this
  // ref instead, kept current by a separate, cheap effect.
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
    // jsdom (and any browser without WebGL) returns null here. Exit quietly.
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };
    const vertexShader = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vertexShader || !fragmentShader || !program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uR = gl.getUniformLocation(program, "r");
    const uT = gl.getUniformLocation(program, "t");
    const uM = gl.getUniformLocation(program, "m");
    const uC = gl.getUniformLocation(program, "c");
    const uS = gl.getUniformLocation(program, "s");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const resize = () => {
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const onPointerMove = (e: PointerEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", onPointerMove);

    const start = performance.now();
    let smx = window.innerWidth / 2;
    let smy = window.innerHeight / 2;
    let rafId = 0;

    const draw = () => {
      const target = pointerRef.current;
      smx += (target.x - smx) * 0.08;
      smy += (target.y - smy) * 0.08;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, (performance.now() - start) / 1000);
      gl.uniform2f(uM, smx * dpr, smy * dpr);
      const col = themeRef.current === "dark" ? [1, 1, 1] : [0.1, 0.1, 0.12];
      gl.uniform3f(uC, col[0], col[1], col[2]);
      gl.uniform1f(uS, dpr);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(draw);
    };

    // A backgrounded tab must not keep a rAF loop running.
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        rafId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 h-full w-full pointer-events-none"
    />
  );
}
