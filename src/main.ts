import App from "./App.svelte";

const target = document.querySelector("app");
if (!target) {
  throw new Error("Missing <app> tag");
}
const app = new App({ target });
export default app;
