/*
 * Adapted from:
 * https://blobfolio.com/2018/06/lazy-loading-sprites-inline/
 */

import axios from "../utils/axios.js";

/**
 * Process SVGs onLoad
 *
 * @returns {void} Nothing.
 */
export function loadSVGs() {
  // Find our SVGs.
  const svgs = document.querySelectorAll("svg[data-url]");

  // Loop and process.
  for(let i = 0; i < svgs.length; ++i) {
    // Grab the URL and delete the attribute; we no longer need it.
    let url = svgs[i].getAttribute("data-url");
    svgs[i].removeAttribute("data-url");

    inlineSVG(url, svgs[i]);
  }
}

const CacheSVG = new (class CacheProxy {
  instance = "window" in global && "caches" in window ? caches.open("svg") : null;

  async get(url) {
    if(this.instace !== null) {
      const match = await (await this.instance).match(url);
      if(match && match.ok) {
        console.log("CacheSVG hit ", { url, match });
        return match.text();
      }
    }
    return null;
  }
  put(url, data) {
    if(this.instace !== null) {
      this.instance.then(cache => cache.put(url, new Response(data, { headers: { "Content-Type": "image/svg+xml" } })));
    }
  }
})();

/**
 * Fetch an SVG
 *
 * @param {string} url URL.
 * @param {DOMElement} el Element.
 * @returns {void} Nothing.
 */
export async function inlineSVG(url, el) {
  let data = await CacheSVG.get(url);

  if(!data) {
    console.log(`fetchSVG(${url})`);
    data = await axios.get(url).then(response => response.data);
    CacheSVG.put(url, data);
  }

  // This response should be an XML document we can parse.
  const parser = new DOMParser();
  const parsed = parser.parseFromString(data, "image/svg+xml");

  // The file might not actually begin with "<svg>", and
  // for that matter there could be none, or many.
  let svg = parsed.getElementsByTagName("svg");
  if(svg.length) {
    // But we only want the first.
    svg = svg[0];

    // Copy over the attributes first.
    const attr = svg.attributes;
    const attrLen = attr.length;
    for(let i = 0; i < attrLen; ++i) {
      if(attr[i].specified) {
        // Merge classes.
        if(attr[i].name === "class") {
          const classes = attr[i].value
            .replace(/\s+/g, " ")
            .trim()
            .split(" ");
          const classesLen = classes.length;
          for(let j = 0; j < classesLen; ++j) {
            el.classList.add(classes[j]);
          }
        }
        // Add/replace anything else.
        else {
          el.setAttribute(attr[i].name, attr[i].value);
        }
      }
    }

    // Now transfer over the children. Note: IE does not
    // assign an innerHTML property to SVGs, so we need to
    // go node by node.
    while(svg.childNodes.length) {
      el.appendChild(svg.childNodes[0]);
    }
  }
}

inlineSVG.cache = CacheSVG;
