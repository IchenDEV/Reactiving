import { traverse } from "./traverse";
import { isObject } from "./utils";
import Dep, { pushTarget, popTarget } from "./dep";
let uid = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
export default class Watcher {
  vm: Object|Array<any>;
  expression: string;
  cb: Function;
  id: number;
  deep: boolean;
  user: boolean;
  lazy: boolean;
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>;
  newDeps: Array<Dep>;
  depIds: Set<Number>;
  newDepIds: Set<Number>;
  before: Function|undefined;
  getter: Function;
  value: any;



  constructor(obj, cb, getter, options?:any) {
    this.vm = obj;
    this.getter = getter;
    // options
    if (options) {
      this.deep = !!options.deep;
    } else {
      this.deep = this.sync = false;
    }
    this.cb = cb;
    this.id = ++uid; // uid for batching
    this.active = true;
    this.deps = [];
    this.newDeps = [];
    this.depIds = new Set();
    this.newDepIds = new Set();
    this.expression = "";
    this.value = this.get();
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get() {
    pushTarget(this);
    let value;
    const vm = this.vm;
    try {
      value = this.getter(vm);
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) traverse(value);

      popTarget();
      this.cleanupDeps();
    }
    return value;
  }

  /**
   * Add a dependency to this directive.
   */
  addDep(dep) {
    const id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) dep.addSub(this);
    }
  }

  /**
   * Clean up for dependency collection.
   */
  cleanupDeps() {
    this.deps.forEach((dep) => {
      if (!this.newDepIds.has(dep.id)) dep.removeSub(this);
    });
    let tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;

    this.newDepIds.clear();

    let tmp2 = this.deps;
    this.deps = this.newDeps;
    this.deps = tmp2;
    //swap

    this.newDeps.length = 0;
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  update() {
    this.run();
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run() {
    if (this.active) {
      const value = this.get();
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value;
        this.value = value;
        this.cb.call(this.vm, value, oldValue);
      }
    }
  }
  /**
   * Depend on all deps collected by this watcher.
   */
  depend() {
    this.deps.forEach((item) => {
      item.depend();
    });
  }
}
