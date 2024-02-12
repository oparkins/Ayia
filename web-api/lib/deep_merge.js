/**
 *  Simple object check.
 *  @method is_object
 *  @param  item    The object to check {Object};
 *
 *  @return An indication of whether `item` is an object {Boolean};
 */
function is_object(item) {
  return (item && typeof(item) === 'object' && !Array.isArray(item));
}

/**
 *  Deep merge multiple objects into `target`.
 *  @method deep_merge
 *  @param  target      The original, target {Object};
 *  @param  ...sources  One or more sources {Object};
 *
 *  Mutates `target` only but not its objects and arrays.
 *
 *  @return An updated `target` {Object};
 */
function deep_merge(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (is_object(target) && is_object(source)) {
    for (const key in source) {
      if (is_object(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deep_merge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deep_merge(target, ...sources);
}

module.exports  = deep_merge;
// vi: ft=javascript
