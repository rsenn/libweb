export function thenableReject(error) {
  return {
    then: (resolve, reject) => reject(error),
  };
}
