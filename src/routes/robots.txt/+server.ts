import { env } from "$env/dynamic/private";

// Remove prerender when switching to the adapter-node (SSR)
export const prerender = true;

/**
 * Enable or disable indexing of the site.
 *
 * @link https://www.robotstxt.org/robotstxt.html
 */
export const GET = () => {
  let allow = true;
  const robotsTxt = env.ROBOTS_TXT;
  if (robotsTxt === "noindex") {
    allow = false;
  } else if (robotsTxt !== "index") {
    console.warn("Invalid ROBOTS_TXT env, expecting 'noindex' or 'index'");
  }

  return new Response(`User-agent: *
Disallow:${allow ? "" : " /"}
`);
};
