import Dep, { pushTarget, popTarget } from "./dep.js";
import {
  dependArray,
  isObject,
  isPlainObject,
  def,
  hasOwn,
  hasProto,
  arrayProto,
  arrayMethods,
  arrayKeys,
} from "./utils.js";
export class Observer {
  value;
  dep;
  vmCount; // number of vms that have this object as root $data

  constructor(value) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;
    def(value, "__ob__", this);
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods);
      } else {
        copyAugment(value, arrayMethods, arrayKeys);
      }
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk(obj) {
    const keys = Object.keys(obj);
    keys.forEach((i) => {
      defineReactive(obj, i);
    });
  }

  /**
   * Observe a list of Array items.
   */
  observeArray(items) {
    items.forEach((item) => {
      observe(item);
    });
  }
}

export function observe(value, asRootData) {
  if (!isObject(value)) {
    return;
  }
  let ob;
  if (hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value)
  ) {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob;
}

/**
 * Define a reactive property on an Object.
 */
export function defineReactive(obj, key, val) {
  const dep = new Dep();

  const property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) return;

  // cater for pre-defined getter/setters
  const getter = property && property.get;
  const setter = property && property.set;
  if ((!getter || setter) && arguments.length === 2) val = obj[key];

  let childOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
          if (Array.isArray(value)) {
            //数组
            dependArray(value);
          }
        }
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      const value = val;
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return;
      }
      dep.notify(); //通知数据变化
    },
  });
}

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment(target, src) {
  target.__proto__ = src;
}

/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */
function copyAugment(target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}
