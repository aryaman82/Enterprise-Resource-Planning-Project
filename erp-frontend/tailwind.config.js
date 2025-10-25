// tailwind.config.js
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // any other folders where your components exist
  ],
  theme: {
    extend: {},
  },
  plugins: [],
});
