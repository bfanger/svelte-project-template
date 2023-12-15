/* @svelte/adapter-node start */
// import { env } from "$env/dynamic/private";
//
// const ROBOTS_TXT = env.ROBOTS_TXT;
/* @svelte/adapter-node end */

/* @svelte/adapter-static start */
import { ROBOTS_TXT } from "$env/static/private";

export const prerender = true;
/* @svelte/adapter-static end */

/**
 * Enable or disable indexing of the site.
 *
 * @link https://www.robotstxt.org/robotstxt.html
 */
export const GET = () => {
  let allow = true;

  if (ROBOTS_TXT === "noindex") {
    allow = false;
  } else if (ROBOTS_TXT !== "index") {
    console.warn("Invalid ROBOTS_TXT env, expecting 'noindex' or 'index'");
  }

  return new Response(`User-agent: *
Disallow:${allow ? "" : " /"}
`);
};
