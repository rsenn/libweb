import { useState, useEffect, useRef } from '../dom/preactComponent.js';


export function useFetch(url) {
  const [data, setData] = useState(null);
  useEffect( () => {
      fetch(url)
        .then(response => response.json())
        .then(json => setData(json));
 }, [url]);

  return data;
}

export default useFetch:
