//import dedent from 'dedent';
import App from "next/app";
import I18Next, { i18n } from "../i18n.js";
import { getStore } from "../stores/createStore.js";
import { Router } from "next/router";

//const I18Next = { Link, withNamespaces, changeLanguage };

export const { Link, withNamespaces, appWithTranslation, withTranslation } = I18Next;

export function setLanguage(lng, i18n = null) {
  if(lng == "fa") lng = "fa-IR";
  getStore("UserStore").setLanguage(lng);
}
export const changeLanguage = setLanguage;

export const setRouteChangeHandler = handleRouteChange => {
  Router.events.on("routeChangeError", (err, url) => {
    if(err.cancelled) console.log(`Route to ${url} was cancelled!`);
  });
  Router.events.on("routeChangeStart", handleRouteChange);
  if(Router.beforePopState !== undefined) {
    Router.beforePopState(({ url, as, options }) => {
      const pages = ["/about", "/account", "/admin", "/play", "/confirmation", "/deposit", "/drawings", "/games", "/guide", "/index", "/login", "/picks", "/profile", "/register", "/withdraw"];
      const page = url.replace(/[?&=:].*/, "");
      //I only want to allow these routes!
      //Have SSR render bad routes as a 404.    window.location.href = as;
      if(pages.indexOf(page) == -1) return false;
      console.log("Router.beforePopState ", { page, url, as, options });
      return true;
    });
  }
};

export const extendsApp = Component => Component.prototype instanceof App || Component === App;

export const isConstructor = (() => {
  if(typeof Proxy === "undefined") {
    return null;
  } else {
    const handler = {
      construct() {
        return handler;
      }
    };
    return x => {
      try {
        return !!new new Proxy(x, handler)();
      } catch(e) {
        return false;
      }
    };
  }
})();

/* global process */
export const NODE_ENV = (() => {
  const NODE_ENV = typeof process !== "undefined" && typeof process.env === "object" && process.env ? process.env.NODE_ENV : undefined;
  if(typeof NODE_ENV === "undefined") {
    console.warn("NODE_ENV is undefined");
  }
  return NODE_ENV;
})();

export const ordinalSuffixOf = i => {
  const j = i % 10;
  const k = i % 100;
  let n;
  if(j == 1 && k != 11) {
    n = i + "st";
  } else if(j == 2 && k != 12) {
    n = i + "nd";
  } else if(j == 3 && k != 13) {
    n = i + "rd";
  } else {
    n = i + "th";
  }
  return n;
};

/*export const reformat = s =>
  dedent(s)
    .replace(/\s+/g, ' ')
    .trim();
*/

export const wrappedT = props => text => {
  const translation = props.t(text);
  if(global.window != undefined) {
    if(!global.window.translations) global.window.translations = {};

    if(text == translation) global.window.translations[text] = "";
    else global.window.translations[text] = translation;
  }
  return translation;
};

//This function takes a component...
export function withI18Next(WrappedComponent) {
  let args = [...arguments];

  if(args.indexOf("common") == -1) args.unshift("common");

  if(args.indexOf("menu") == -1) args.unshift("menu");

  let nslist = args.slice(0, -1);
  WrappedComponent = args[args.length - 1];
  //console.log("WrappedComponent ", WrappedComponent);

  //...and returns another component...
  return I18Next.withNamespaces(...nslist)(
    class extends React.Component {
      static getInitialProps() {
        let initialProps = WrappedComponent.getInitialProps.apply(WrappedComponent, [...arguments]);
        /*
        if(initialProps.namespacesRequired === undefined) namespacesRequired = nslist
        else namespacesRequired = initialProps.namespacesRequired
        return {...initialProps, namespacesRequired}
        */
        return initialProps;
      }

      render() {
        const { t, ...restOfProps } = this.props;
        const translate = wrappedT({ t });
        return <WrappedComponent t={translate} {...restOfProps} />;
      }
    }
  );
}

export function inferLang(props) {
  const { pageProps, i18n } = props;
  const userStore = props.mobxStore["UserStore"] || getStore("UserStore");
  let { lang } = userStore;
  let lng;
  console.log("inferLang ", { lang, i18n, pageProps });

  if(i18n !== undefined) {
    i18n.changeLanguage(lang);
    lng = i18n.lng;
  }
  return lng;
}
