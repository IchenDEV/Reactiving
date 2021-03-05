import { Observer } from "./observer/index";
import Watcher from "./observer/watcher";
function Vmi(obj, cb) {
  new Observer(obj);
  new Watcher(obj, cb, (obj:any) => {
    if (!Array.isArray(obj))
      Object.keys(obj).forEach((k) => {
        let t = obj[k];
      });
    else
      obj.forEach((k) => {
        let t = obj.slice(k,1);
      });

    return obj;
  });
}