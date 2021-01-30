import { useCallback, useState } from '../dom/preactComponent.js';

const initialState = { attributeId: 'name' };

export function useToggleButtonGroupState(arg) {
  const options = arg === void 0 ? initialState : arg;
  const { selectedId } = options;
  const attributeId =
    options.attributeId === void 0 ? initialState.attributeId : options.attributeId;

  const [currentSelectedId, setCurrentSelectedId] = useState(selectedId);

  function handleSelect(callback) {
    if(callback === void 0) callback = function() {};

    return function(event) {
      const nextSelectedId = event.currentTarget[attributeId];
      if(currentSelectedId !== nextSelectedId) {
        setCurrentSelectedId(nextSelectedId);
        callback(event);
      }
    };
  }

  return {
    currentSelectedId,
    handleSelect: useCallback(handleSelect, [currentSelectedId]),
    reset: useCallback(() => setCurrentSelectedId(undefined), [])
  };
}
