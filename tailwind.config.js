/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        /* === Base tokens (shadcn) === */
        background: "#f8fafc",
        foreground: "#0f172a",

        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },

        popover: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },

        border: "#e2e8f0",
        input: "#e2e8f0",
        ring: "#e2e8f0",

        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },

        accent: {
          DEFAULT: "#f1f5f9",
          foreground: "#0f172a",
        },

        /* === Brand / primary === */
        primary: {
          DEFAULT: "#FF8A25",
          foreground: "#ffffff",
        },

        secondary: {
          DEFAULT: "#e2e8f0",
          foreground: "#0f172a",
        },

        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#ffffff",
        },

        /* === Ticket status === */
        status: {
          pendente: "#d97706",
          atendimento: "#FF8A25",
          aguardando: "#7c3aed",
          finalizado: "#16a34a",
        },
      },

      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },

      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
}

