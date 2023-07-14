import * as deep from './deep.js';
import { FetchURL } from './fetch.js';
import { ResponseData } from './fetch.js';
import { tXml } from './xml.js';

export async function FetchAndParseXML(url) {
  let data = await fetch(url).then(ResponseData);
  return tXml(data);
}

export const GithubListFiles = async (owner, repo, dir, opts = {}) => {
  const url = (opts.proxy ? opts.proxy : 'https://github.com') + `/${owner}/${repo}/contents${dir ? '/' + dir : ''}`;

  const xml = await FetchAndParseXML(url);

  return deep.select(data, e => e && e.tagName == 'a', deep.RETURN_VALUE).map(e => [e.attributes.href, e.children]);
};

export async function* GithubListRepositories(user, f = fetch) {
  let url = `/github/${user}?tab=repositories`;
  let fetched = [];
  do {
    fetched.push(url);
    let response = await f(url, { mode: 'no-cors' });
    let text = await response.clone().text();
    let matches = [...text.matchAll(/([^<"]*after=[^">]*)/g)].map(m => m[1]);
    matches = matches.map(m => decodeURIComponent(Util.decodeHTMLEntities(m)));
    matches = matches.filter(m => m[0] != '{' && fetched.indexOf(m) == -1);
    //console.log('matches:', matches);
    url = matches[matches.length - 1] + '';
    //   url = decodeURIComponent(Util.decodeHTMLEntities(url));
    url = url.replace(/.*github\.com/, '/github');
    url = url.replace(new RegExp('(,|"|%22).*', 'g'), '');
    console.log('url:', url);
    yield* [...text.matchAll(/pository"\s*>\s*([^<]*)/g)].map(m => m[1]);
  } while(url != 'undefined');
}

export async function GithubRepositories(user, f = fetch) {
  let url = `/github/${user}?tab=repositories`;
  let ret = [];
  let fetched = [];
  let i = 0;
  do {
    // console.debug(`url #${i}:`, url);
    let html = await f(url).then(ResponseData);
    fetched.push(url);
    let indexes = [...html.matchAll(/<li[^>]*itemtype[^>]*>/g)].map(i => i.index);
    let hrefs = Util.unique([...html.matchAll(/href="([^"]*)"/g)].map(m => m[1]))
      .map(Util.decodeHTMLEntities)
      .map(decodeURIComponent)
      .filter(h => !/(return_to=|before=)/.test(h))
      .filter(h => /(tab=repositories|after=)/.test(h))
      .map(url => url.replace('https://github.com', ''))
      .map(url => '/github' + url)
      .filter(url => fetched.indexOf(url) == -1 && !/page=1/.test(url));
    url = hrefs[hrefs.length - 1];
    //console.debug('hrefs:', hrefs);
    let tags = indexes.map(index => [index, html.indexOf('</li>', index)]).map(([s, e]) => html.substring(s, e));
    let data = tags.map(Util.stripHTML);
    ret = ret.concat(data.map(a => a.slice(0, 2).map(p => (['0', 'Forked from', 'Updated'].indexOf(p) != -1 || Util.isNumeric(p) ? '' : p))));
    i++;
  } while(url);
  return new Map(ret.map(([name, description]) => [`https://github.com/${user}/${name}`, description]));
  //return new Map(ret.map(([name, description]) => [name, { url: `https://github.com/${user}/${name}`, description }]));
  //return new Map(ret.map(([name, ...rest]) => [name, [`https://github.com/${user}/${name}`, ...rest]]));
}

export const GithubListContents = async (owner, repo, dir, filter, opts = {}) => {
  const { username, password, fetch = FetchURL } = opts;
  let host, path;
  if(new RegExp('://').test(owner) || (repo == null && dir == null)) {
    const url = owner;
    let parts = url
      .replace(/.*:\/\//g, '')
      .replace('/tree/master', '')
      .split('/');
    while(!/github.com/.test(parts[0])) parts = parts.slice(1);
    [host, owner, repo, ...path] = parts;
    dir = path.join('/');
  }
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${dir}`;
  console.log('GithubListContents', { host, owner, repo, dir, filter, url });
  const headers = {
    Authorization: 'Basic ' + window.btoa(`${username}:${password}`)
  };
  let response = await fetch(url, { headers });
  let result = JSON.parse(await response.text());
  if(!Array.isArray(result)) {
    result.status = response.status;
    return result;
  }
  if(filter) {
    const re = new RegExp(filter, 'g');
    result = result.filter(({ name, type }) => type == 'dir' || re.test(name));
  }
  console.log('result:', result);
  const firstFile = result.find(r => !!r.download_url);
  const base_url = firstFile ? firstFile.download_url.replace(/\/[^\/]*$/, '') : '';
  const files = result.map(({ download_url = '', html_url, name, type, size, path, sha }) => ({
    url: (download_url || html_url || '').replace(base_url + '/', ''),
    name,
    type,
    size,
    path,
    sha
  }));
  const at = i => {
    let url = files[i].url;
    if(!/:\/\//.test(url)) url = base_url + '/' + url;
    return url;
  };
  return Object.assign(
    files.map((file, i) => {
      file.toString = () => at(i);
      if(file.type == 'dir') file.list = async (f = filter) => await GithubListContents(at(i), null, null, f, {});
      else {
        let getter = async function() {
          let data = await fetch(at(i), {});
          this.buf = await data.text();
          return this.buf;
        };
        let text = function() {
          return typeof this.buf == 'string' && this.buf.length > 0 ? this.buf : this.get();
        };
        file.get = getter;
        file.getText = text;
        Object.defineProperty(file, 'text', {
          get: text,
          enumerable: true,
          configurable: true
        });
      }
      return file;
    }),
    {
      base_url,
      at,
      async get(i) {
        const url = at(i);
        console.log('url:', url);
        return await fetch(url, {});
      },
      get files() {
        return files.filter(item => item.type != 'dir');
      },
      get dirs() {
        return files.filter(item => item.type == 'dir');
      }
    }
  );
};

export async function ListGithubRepoServer(owner, repo, dir, filter, f = fetch) {
  let response;
  let request = { owner, repo, dir, filter };
  try {
    response = await f('/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
  } catch(err) {}
  let ret = Util.tryCatch(
    () => JSON.parse(response),
    response => response,
    error => ({ error, response })
  );

  ret.at = function(i) {
    return this.base_url + '/' + this.files[i];
  };
  ret.get = async function(i) {
    let data = await f(this.at(i));
    return data;
  };
  return ret;
}

export default {
  ListRepositories: GithubListRepositories,
  Repositories: GithubRepositories,
  ListContents: GithubListContents,
  ListRepoServer: ListGithubRepoServer,
  ListFiles: GithubListFiles
};
