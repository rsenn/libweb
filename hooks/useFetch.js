import { useEffect, useState } from '../preact.mjs';

export function useFetch(url, cb = resp => resp.text()) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(url)
      .then(
        cb /*|| async response => {
       console.log('response', await response.text());
       console.log('response', response.json);
        return response.json();
      }*/
      )
      .then(json => setData(json));
  }, [url]);

  return data;
}

export default useFetch;
