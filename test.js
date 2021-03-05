import { Observer } from "./index.js";
import Watcher from "./watcher.js";
let obj = { a: 1, b: 2 };
let o = new Observer(obj);
let w = new Watcher(
  obj,
  (oldVal, newVal) => {
    console.log(newVal.a, oldVal.b);
  },
  (obj) => {
    var t = obj.a; //vm get val
    var t1 = obj.b; //vm get val
    return obj;
  }
);

obj.a = 2;
