import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: ["./src/**/*.{html,js,jsx,tsx}", "./index.html"],
  plugins: [daisyui],
  daisyui: {
    themes: ["light", "dracula"], // Make sure both themes are included
  },
};

export default config;
