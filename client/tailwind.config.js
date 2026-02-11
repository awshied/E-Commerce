/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          cyan: "#2fd4bf",
          purple: "#818cf8",
          indigo: "#3949ab",
        },
        background: {
          DEFAULT: "#0f172a",
          dark: "#0c1425",
          darker: "#0a1120",
        },
        surface: {
          DEFAULT: "#0a1120",
          pink: "#f471b5",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#1e293b",
          gray: "#d6d6d6",
        },
        accent: {
          success: "#2fd4bf",
          warning: "#f4bf51",
          error: "#fb7085",
          info: "#0ca5e9",
        },
      },
    },
  },
  plugins: [],
};
