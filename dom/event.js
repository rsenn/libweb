import Util from '../util.js';
export const Event = {
  simulateKey(keyCode, type, modifiers, target = window) {
    let evtName = typeof type === 'string' ? 'key' + type : 'keydown';
    //var modifier = (typeof(modifiers) === "object") ? modifier : {};

    const { ctrlKey = false, shiftKey = false, altKey = false, metaKey = false } = modifiers || {};

    let key = keyCode == 9 ? 'Tab' : String.fromCodePoint(keyCode);
    let code = keyCode == 9 ? 'Tab' : 'Key' + String.fromCodePoint(keyCode).toUpperCase();

    //var event = Object.assign(new window.Event('keydown'), {keyCode, key,code, ctrlKey,shiftKey,altKey,metaKey});
    //, srcElement: target, target: target, currentTarget: target, view: window });
    let event = new KeyboardEvent('key' + type, { bubbles: true, isTrusted: true, keyCode, key, code, ctrlKey, shiftKey, altKey, metaKey, srcElement: target, target, currentTarget: target, view: window }); //document.createEvent("Event");

    //event.initEvent(evtName, true, false);

    //Object.assign(event, {ctrlKey,shiftKey,altKey,metaKey});

    console.log('event:', event);
    target.dispatchEvent(event);
    return event;
  }
};
