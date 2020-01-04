import Router from 'next/router';

//An event handler.
handlePanelSelect = e => {
  const id = getCurrentUser();
  const view = getViewName();
  const href = `/learn?id=${id}&view=${view}`;
  const as = `/learn/${id}/${view}`;
  Router.push(href, as);
};
