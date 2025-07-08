/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "primary-blue": "var(--primary-blue)",
        "primary-blue-hover": "var(--primary-blue-hover)",
        "secondary-blue": "var(--secondary-blue)",
        "secondary-blue-hover": "var(--secondary-blue-hover)",
        "red-destructive": "var(--red-destructive)",
        "red-destructive-hover": "var(--red-destructive-hover)",
        "success-green": "var(--success-green)",
        "success-green-hover": "var(--success-green-hover)",
        "dark-gray": "var(--dark-gray)",
        "light-gray": "var(--light-gray)",
        "body-text-color": "var(--body-text-color)",
        "heading-text-color": "var(--heading-text-color)",
        "input-label-color": "var(--input-label-color)",
        "input-text-color": "var(--input-text-color)",
        "placeholder-text-color": "var(--placeholder-text-color)",
        gray: {
          20: "rgb(var(--gray-20) / 1)",
          30: "rgb(var(--gray-30) / 1)",
          40: "rgb(var(--gray-40) / 1)",
          80: "rgb(var(--gray-80) / 1)",
          90: "rgb(var(--gray-90) / 1)",
          100: "rgb(var(--gray-100) / 1)",
          300: "rgb(var(--gray-300) / 1)",
          400: "var(--Grey-G400)",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "var(--input-label-color)",
          primary: "var(--secondary-blue)",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "#DEDEDE",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
    },
    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
    },
    fontFamily: {
      jaka: [
        "./assets/fonts/PlusJakartaSans-VariableFont_wght.ttf",
        "sans-serif",
      ],
      mono: ["./assets/fonts/SpaceMono-Regular.ttf", "sans-serif"],
    },
  },
  plugins: [],
};
