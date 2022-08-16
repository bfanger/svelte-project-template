/* eslint-disable import/prefer-default-export */

/**
 * Enable or disable indexing of the site.
 *
 * @link https://www.robotstxt.org/robotstxt.html
 */
export const GET = () => {
  let allow = true;
  const robotstxt = process.env.ROBOTSTXT;
  if (robotstxt === "noindex") {
    allow = false;
  } else if (robotstxt !== "index") {
    console.warn("Invalid ROBOTSTXT env, expecting 'noindex' or 'index'");
  }

  return new Response(`User-agent: *
Disallow:${allow ? "" : " /"}
`);
};
