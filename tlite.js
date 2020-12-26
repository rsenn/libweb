import Util from './util.js';

export function tlite(getTooltipOpts) {
  document.addEventListener('mouseover', e => {
    let el = e.target;
    let opts = getTooltipOpts(el);

    if(!opts) {
      el = el.parentElement;
      opts = el && getTooltipOpts(el);
    }
    let getTitle;
    if(opts.attrib) {
      let a = opts.attrib;

      if(a instanceof Array || (typeof a == 'object' && a !== null && typeof a.length == 'number')) {
        getTitle = e => {
          let x = a
            .filter(attrName => e.hasAttribute(attrName))
            .map(attrName => [
              attrName,
              (e.hasAttribute(attrName) && e.getAttribute(attrName)) || '',
              e.hasAttribute(attrName) ? e : null
            ])
            .filter(([attrName, attrVal]) => attrVal != '' && attrVal != null);
          return x[0] || [];
        };
      } else {
        getTitle = e => [
          opts.attrib,
          (e.hasAttribute(opts.attrib) && e.getAttribute(opts.attrib)) || '',
          e.hasAttribute(opts.attrib) ? e : null
        ];
      }
    }
    if(!getTitle) getTitle = e => ['title', (e.hasAttribute('title') && e.getAttribute('title')) || '', e];
    opts.getTitle = e => {
      let attrName,
        title,
        i = 0;
      do {
        if(!e) break;
        [attrName, title] = getTitle(e);
        if(typeof title == 'string' && title.length > 0) break;
        i++;
      } while((e = e.parentElement));
      if(title != '')
        //console.log(`getTitle[${i}]:`, title);
        return [attrName, title, e];
    };

    opts && tlite.show(el, opts, true);
  });
}

tlite.show = function(el, opts, isAuto) {
  opts = opts || {};
  let fallbackAttrib = /*opts.attrib ||*/ 'data-tlite';

  let mapper = this.mapper || Util.weakMapper(createTooltip);

  this.mapper = mapper;
  //console.info('tlite.show:', el, opts, isAuto, fallbackAttrib);

  (el.tooltip || Tooltip(el, opts)).show();

  function Tooltip(el, opts) {
    let showTimer;
    let text, attr, elem;
    [attr, text, elem] = opts.getTitle(el);

    let tooltipEl;

    /*
if(!elem)
  elem =el;*/

    el.addEventListener('mousedown', () => autoHide(el));
    el.addEventListener('mouseleave', () => autoHide(el));

    /*
if(elem)
  el=elem;
*/

    function show(el) {
      //console.log('show(', el, ')');
      [attr, text, elem] = opts.getTitle(el);
      //el.title = '';

      //el.setAttribute(fallbackAttrib, text);
      // console.info('show():',{attr,text,elem});
      text && !showTimer && (showTimer = setTimeout(() => fadeIn(el), isAuto ? 150 : 1));
    }

    function autoHide(el) {
      tlite.hide(el, true, opts);
    }

    function hide(isAutoHiding, el) {
      //console.log('hide(', isAutoHiding, el, ')');
      if(isAuto === isAutoHiding) {
        showTimer = clearTimeout(showTimer);
        let parent = tooltipEl && tooltipEl.parentElement;
        parent && parent.removeChild(tooltipEl);
        tooltipEl = undefined;
      }
    }

    function fadeIn(el) {
      if(!tooltipEl) {
        tooltipEl = mapper(el, text, opts);
        if(tooltipEl.parentElement) tooltipEl.parentElement.removeChild(tooltipEl);

        (elem || el).appendChild(tooltipEl);
      }
      //    setTimeout( () => hide(isAuto), 1000);
    }

    return (el.tooltip = {
      show: () => show(el),
      hide: isAuto => hide(isAuto, el)
    });
  }

  function createTooltip(el, text, opts) {
    let tooltipEl = document.createElement('span');
    const { grav } = opts;
    var [attr, text = '', elem] = opts.getTitle(el);

    if(elem) el = elem;

    let html;
    if(/\t/.test(text)) {
      let cells = text.split(/\n/g).map(row => row.split(/\t/g));
      html =
        '<table border="0" cellspacing="0" cellpadding="0" class="tlite-table" style="margin: 0px; padding: 0px; color: white; ">\n' +
        cells
          .map((row, j) =>
              `<tr class="tlite-table tlite-row-${j}">` +
              row.map((col, i) => `<td class="tlite-table tlite-row-${j} tlite-col-${i}">` + col + '</td>').join('') +
              '</tr>\n'
          )
          .join('') +
        '</table>';
    } else {
      html = text.replace(/\n/g, '<br />');
    }
    //console.log('html:', html);
    tooltipEl.innerHTML = html;

    el.appendChild(tooltipEl);

    let vertGrav = grav[0] || '';
    let horzGrav = grav[1] || '';

    function positionTooltip() {
      tooltipEl.className = 'tlite ' + 'tlite-' + vertGrav + horzGrav;

      let arrowSize = 10;
      let top = el.offsetTop;
      let left = el.offsetLeft;
      tooltipEl.style.position = 'fixed';

      if(tooltipEl.offsetParent === el) {
        top = left = 0;
      }

      let width = el.offsetWidth;
      let height = el.offsetHeight;
      let tooltipHeight = tooltipEl.offsetHeight;
      let tooltipWidth = tooltipEl.offsetWidth;
      let centerEl = left + width / 2;

      const pos = {
        top: vertGrav === 's'
            ? top - tooltipHeight - arrowSize
            : vertGrav === 'n'
            ? top + height + arrowSize
            : top + height / 2 - tooltipHeight / 2,
        left: horzGrav === 'w'
            ? left
            : horzGrav === 'e'
            ? left + width - tooltipWidth
            : vertGrav === 'w'
            ? left + width + arrowSize
            : vertGrav === 'e'
            ? left - tooltipWidth - arrowSize
            : centerEl - tooltipWidth / 2
      };

      if(pos.left < 0) pos.left = 0;

      tooltipEl.style.top = pos.top + 'px';
      tooltipEl.style.left = pos.left + 'px';

      const { top: y, left: x, position } = tooltipEl.style;

      //   console.log('tooltipEl.style', { x, y, position });
    }

    positionTooltip();

    let rect = tooltipEl.getBoundingClientRect();

    if(vertGrav === 's' && rect.top < 0) {
      vertGrav = 'n';
      positionTooltip();
    } else if(vertGrav === 'n' && rect.bottom > window.innerHeight) {
      vertGrav = 's';
      positionTooltip();
    } else if(vertGrav === 'e' && rect.left < 0) {
      vertGrav = 'w';
      positionTooltip();
    } else if(vertGrav === 'w' && rect.right > window.innerWidth) {
      vertGrav = 'e';
      positionTooltip();
    }

    tooltipEl.className += ' tlite-visible';

    return tooltipEl;
  }
}.bind(tlite);

tlite.hide = function(el, isAuto, opts) {
  let tooltipEl = this.mapper.get(el);
  //const     [attr,text,elem] = opts.getTitle(el);
  /*if(elem)
  eleml = elem;
*/
  el.tooltip && el.tooltip.hide(isAuto);
};

export default tlite;
