function hexToRGB(hex) {
  hex = String(hex || '#7B7481').replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255
  ];
}

function createSilk(canvas, opts) {
  if (!canvas) return;
  const o = Object.assign({
    speed: 3.9,
    scale: 1,
    color: '#2a2730',
    noiseIntensity: 0.9,
    rotation: 0
  }, opts || {});

  const gl = canvas.getContext('webgl', { antialias: true, alpha: false });
  if (!gl) return;

  const vs = `
    attribute vec2 aPos;
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = aPos * 0.5 + 0.5;
      vPosition = vec3(aPos, 0.0);
      gl_Position = vec4(aPos, 0.0, 1.0);
    }
  `;

  const fs = `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uSpeed;
    uniform float uScale;
    uniform float uRotation;
    uniform float uNoiseIntensity;
    const float e = 2.71828182845904523536;
    float noise(vec2 texCoord) {
      float G = e;
      vec2 r = (G * sin(G * texCoord));
      return fract(r.x * r.y * (1.0 + texCoord.x));
    }
    vec2 rotateUvs(vec2 uv, float angle) {
      float c = cos(angle);
      float s = sin(angle);
      mat2 rot = mat2(c, -s, s, c);
      return rot * uv;
    }
    void main() {
      float rnd = noise(gl_FragCoord.xy);
      vec2 uv = rotateUvs(vUv * uScale, uRotation);
      vec2 tex = uv * uScale;
      float tOffset = uSpeed * uTime;
      tex.y += 0.03 * sin(8.0 * tex.x - tOffset);
      float pattern = 0.6 +
        0.4 * sin(5.0 * (tex.x + tex.y +
          cos(3.0 * tex.x + 5.0 * tex.y) +
          0.02 * tOffset) +
          sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));
      float grain = rnd / 15.0 * uNoiseIntensity;
      vec3 result = uColor * pattern - vec3(grain);
      gl_FragColor = vec4(clamp(result, 0.0, 1.0), 1.0);
    }
  `;

  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uColor = gl.getUniformLocation(prog, 'uColor');
  const uSpeed = gl.getUniformLocation(prog, 'uSpeed');
  const uScale = gl.getUniformLocation(prog, 'uScale');
  const uRotation = gl.getUniformLocation(prog, 'uRotation');
  const uNoise = gl.getUniformLocation(prog, 'uNoiseIntensity');
  const rgb = hexToRGB(o.color);
  gl.uniform3f(uColor, rgb[0], rgb[1], rgb[2]);
  gl.uniform1f(uSpeed, o.speed);
  gl.uniform1f(uScale, o.scale);
  gl.uniform1f(uRotation, o.rotation);
  gl.uniform1f(uNoise, o.noiseIntensity);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  let running = true;
  const t0 = performance.now();
  function tick(now) {
    if (!running) return;
    gl.uniform1f(uTime, (now - t0) / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  return () => { running = false; };
}

window.createSilk = createSilk;
