// Copyright (c) 2016 Masato Noguchi
// https://github.com/joe-re/object-dig/blob/master/src/index.js

const dig = (target: any, ...keys: any[]) => {
  let digged = target;
  for (const key of keys) {
    if (typeof digged === 'undefined' || digged === null) {
      return undefined;
    }
    if (typeof key === 'function') {
      digged = key(digged);
    } else {
      digged = digged[key];
    }
  };
  return digged;
};

export default dig;