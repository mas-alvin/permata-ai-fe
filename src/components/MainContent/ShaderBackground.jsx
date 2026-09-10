import { useRef, useEffect, useState } from 'react'

export default function ShaderBackground() {
  const canvasRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true })
    if (!gl) return

    // Vertex shader
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    // Fragment shader - noise/gradient with mouse interaction
    const fsSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform vec2 u_resolution;

      // Hash function
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      // Smooth noise
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      // FBM (Fractional Brownian Motion)
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 5; i++) {
          value += amplitude * noise(p);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = v_uv;
        vec2 center = vec2(0.5);
        float dist = length(uv - center);
        
        // Mouse influence
        vec2 mouseNorm = u_mouse / u_resolution;
        float mouseDist = length(uv - mouseNorm);
        float mouseInfluence = smoothstep(0.5, 0.0, mouseDist) * 0.8;
        
        // Animated noise
        float n = fbm(uv * 3.0 + u_time * 0.05) * 0.5;
        n += fbm(uv * 6.0 + u_time * 0.03) * 0.25;
        n += fbm(uv * 12.0 + u_time * 0.01) * 0.125;
        
        // Radial gradient
        float radial = 1.0 - dist * 1.2;
        
        // Combine effects
        float intensity = (n * 0.3 + radial * 0.4 + mouseInfluence * 0.6) * 0.5;
        
        // Color palette - Burgundy to Gold theme
        vec3 color1 = vec3(0.5, 0.0, 0.07);  // #800020 - Burgundy
        vec3 color2 = vec3(0.99, 0.84, 0.0); // #FFD700 - Gold
        vec3 color3 = vec3(0.08, 0.04, 0.08); // Dark purple
        
        vec3 color = mix(color3, color1, intensity);
        color = mix(color, color2, intensity * 0.3);
        
        // Vignette
        float vignette = 1.0 - dist * 0.8;
        color *= vignette;
        
        // Alpha for transparency
        float alpha = intensity * 0.35;
        
        gl_FragColor = vec4(color, alpha);
      }
    `

    function createShader(gl, type, source) {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    function createProgram(gl, vs, fs) {
      const program = gl.createProgram()
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program error:', gl.getProgramInfoLog(program))
        return null
      }
      return program
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource)
    const program = createProgram(gl, vertexShader, fragmentShader)

    if (!program) return

    // Geometry - full screen quad
    const positions = new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1, 1,   1, -1,  1, 1,
    ])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const timeLocation = gl.getUniformLocation(program, 'u_time')
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse')
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')

    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
    }

    let startTime = performance.now()
    let animationId

    function render(now) {
      const elapsed = (now - startTime) / 1000
      resize()
      
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      
      gl.useProgram(program)
      gl.uniform1f(timeLocation, elapsed)
      gl.uniform2f(mouseLocation, 
        mousePos.x * canvas.width, 
        (1 - mousePos.y) * canvas.height
      )
      
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      animationId = requestAnimationFrame(render)
    }

    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    resize()
    animationId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationId)
      canvas.removeEventListener('mousemove', handleMouseMove)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      gl.deleteBuffer(buffer)
    }
  }, [mousePos])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}