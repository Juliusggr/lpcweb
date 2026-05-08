/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#000000",
        secondary: "#ffffff",
        accent: "#f3f4f6", // gray-100
        neutral: "#e5e7eb", // gray-200
      },
    },
  },
  plugins: [],
};
