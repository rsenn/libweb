export function useConditional(cond, hook, onFalse) {
  if(typeof cond == 'function') cond = cond();

  return cond === true ? hook : onFalse();
}

export default useConditional;
