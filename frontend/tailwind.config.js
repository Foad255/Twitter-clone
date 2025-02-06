/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';
import { light, black, cupcake } from 'daisyui/src/theming/themes';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  // themes | btn-twitter will have its
  daisyui: {
    themes: [
      {
        light: {
          ...light,
        },
      },
      {
        cupcake: {
          ...cupcake,
        },
      },
      {
        black: {
          // two ways to custom like '' this like tailwind command
          ...black,
          ".btn-twitter": {
            "background-color": "#000000",
            "border-color": "#000000",
          },
          // or like this and this you can add to your command like btn btn-primary
          primary: 'rgb(29,155,240)',
          secondary: 'rgb(24,24,24)'
        },
      },
    ],
  },
  plugins: [daisyui],
};
