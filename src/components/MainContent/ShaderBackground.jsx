import { useEffect, useRef } from 'react'

function hexToRgb(hex) {
  if (!hex) return null
  const value = hex.replace('#', '').trim()
  if (value.length !== 6) return null
  return [
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  ]
}

function readColor(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return hexToRgb(value) || fallback
}

export default function ShaderBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: true,
    })

    if (!gl) {
      console.error('WebGL tidak didukung browser.')
      return
    }

    const vertexShaderSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;

      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    const fragmentShaderSource = `
      precision highp float;

      varying vec2 v_uv;

      uniform vec2 u_resolution;
      uniform vec3 u_background;
      uniform vec3 u_glowA;
      uniform vec3 u_glowB;
      uniform float u_isDark;

      void main() {
        vec2 uv = v_uv;

        float aspect = u_resolution.x / u_resolution.y;

        vec2 p = uv - 0.5;
        p.x *= aspect;

        /*
         * Glow utama.
         * Dibuat lebih lebar secara horizontal seperti background Gemini.
         */
        vec2 glowScale = vec2(1.90, 0.58);
        float distance1 = length(p / glowScale);

        float glow1 = 1.0 - smoothstep(0.05, 0.95, distance1);
        glow1 = pow(glow1, 2.15);

        /*
         * Glow kedua yang lebih kecil dan sedikit lebih terang
         * untuk membuat pusat cahaya lebih hidup.
         */
        vec2 glowScale2 = vec2(0.72, 0.42);
        float distance2 = length(p / glowScale2);

        float glow2 = 1.0 - smoothstep(0.0, 0.85, distance2);
        glow2 = pow(glow2, 2.6);

        /*
         * Glow sangat lembut di area luar.
         */
        float atmosphere = 1.0 - smoothstep(0.25, 1.35, distance1);
        atmosphere = pow(atmosphere, 2.0);

        vec3 color = u_background;

        /*
         * Cahaya utama.
         */
        color = mix(
          color,
          u_glowA,
          glow1 * 0.12
        );

        /*
         * Cahaya kedua.
         */
        color = mix(
          color,
          u_glowB,
          glow2 * 0.34
        );

        /*
         * Atmosphere membuat transisi glow menjadi sangat halus.
         */
        color = mix(
          color,
          u_glowA,
          atmosphere * 0.10
        );

        /*
         * Mode gelap dibuat sedikit lebih pekat di pinggir.
         * Mode terang tidak menggunakan penggelapan.
         */
        if (u_isDark > 0.5) {
          float vignette = smoothstep(
            0.25,
            1.15,
            length(p)
          );

          color *= mix(
            1.0,
            0.72,
            vignette
          );
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `

    function createShader(type, source) {
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

    function createProgram(vertexShader, fragmentShader) {
      const program = gl.createProgram()

      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program error:', gl.getProgramInfoLog(program))
        gl.deleteProgram(program)
        return null
      }

      return program
    }

    const vertexShader = createShader(
      gl.VERTEX_SHADER,
      vertexShaderSource
    )

    const fragmentShader = createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    )

    if (!vertexShader || !fragmentShader) return

    const program = createProgram(
      vertexShader,
      fragmentShader
    )

    if (!program) return

    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ])

    const buffer = gl.createBuffer()

    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      buffer
    )

    gl.bufferData(
      gl.ARRAY_BUFFER,
      positions,
      gl.STATIC_DRAW
    )

    const positionLocation = gl.getAttribLocation(
      program,
      'a_position'
    )

    const resolutionLocation = gl.getUniformLocation(
      program,
      'u_resolution'
    )

    const backgroundLocation = gl.getUniformLocation(
      program,
      'u_background'
    )

    const glowALocation = gl.getUniformLocation(
      program,
      'u_glowA'
    )

    const glowBLocation = gl.getUniformLocation(
      program,
      'u_glowB'
    )

    const isDarkLocation = gl.getUniformLocation(
      program,
      'u_isDark'
    )

    gl.useProgram(program)

    gl.enableVertexAttribArray(positionLocation)

    gl.vertexAttribPointer(
      positionLocation,
      2,
      gl.FLOAT,
      false,
      0,
      0
    )

    /*
     * Palet warna.
     *
     * DARK:
     * background = #0D0D0F
     * glowA      = burgundy
     * glowB      = gold
     *
     * LIGHT:
     * background = #FAF9F7
     * glowA      = soft burgundy
     * glowB      = warm gold
     *
     * Struktur glow SAMA.
     * Hanya warnanya yang berubah.
     */
    const darkPalette = {
      background: [0.035, 0.032, 0.035],
      glowA: [0.20, 0.012, 0.025],
      glowB: [0.56, 0.34, 0.12],
    }

    const lightPalette = {
      background: [0.985, 0.975, 0.965],
      glowA: [0.76, 0.35, 0.30],
      glowB: [0.92, 0.68, 0.28],
    }

    function syncTheme() {
      const isDark =
        document.documentElement.classList.contains('dark')

      /*
       * Jika Anda ingin tetap mengikuti token CSS,
       * background dibaca dari --color-background.
       */
      const cssBackground = readColor(
        '--color-background',
        isDark
          ? darkPalette.background
          : lightPalette.background
      )

      const palette = isDark
        ? darkPalette
        : lightPalette

      gl.useProgram(program)

      gl.uniform3f(
        backgroundLocation,
        ...cssBackground
      )

      gl.uniform3f(
        glowALocation,
        ...palette.glowA
      )

      gl.uniform3f(
        glowBLocation,
        ...palette.glowB
      )

      gl.uniform1f(
        isDarkLocation,
        isDark ? 1.0 : 0.0
      )
    }

    function resize() {
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      )

      const width = Math.floor(
        canvas.clientWidth * dpr
      )

      const height = Math.floor(
        canvas.clientHeight * dpr
      )

      if (
        canvas.width !== width ||
        canvas.height !== height
      ) {
        canvas.width = width
        canvas.height = height

        gl.viewport(
          0,
          0,
          width,
          height
        )
      }

      gl.useProgram(program)

      gl.uniform2f(
        resolutionLocation,
        canvas.width,
        canvas.height
      )
    }

    function render() {
      resize()

      gl.clearColor(
        0,
        0,
        0,
        1
      )

      gl.clear(
        gl.COLOR_BUFFER_BIT
      )

      gl.useProgram(program)

      gl.drawArrays(
        gl.TRIANGLES,
        0,
        6
      )
    }

    const themeObserver = new MutationObserver(
      () => {
        syncTheme()
        render()
      }
    )

    themeObserver.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: ['class'],
      }
    )

    window.addEventListener(
      'resize',
      render
    )

    syncTheme()
    render()

    return () => {
      themeObserver.disconnect()

      window.removeEventListener(
        'resize',
        render
      )

      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      gl.deleteBuffer(buffer)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: -1,
      }}
    />
  )
}