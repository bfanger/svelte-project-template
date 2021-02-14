// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-extraneous-dependencies
const preprocess = require("svelte-preprocess");

module.exports = {
  preprocess: preprocess({
    typescript: {
      transpileOnly: true,
    },
  }),
};
