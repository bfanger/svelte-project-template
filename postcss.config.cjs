const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");

module.exports = {
  plugins: [
    require("postcss-preset-env"),
    // Some plugins, like tailwindcss/nesting, need to run before Tailwind,
    tailwindcss(),
    // But others, like autoprefixer, need to run after,
    autoprefixer,
  ],
};
