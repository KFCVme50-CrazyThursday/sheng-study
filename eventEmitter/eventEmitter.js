// 事件的订阅和发布。
class EventEmitter {
  constructor() {
    this.__events = {}
  }
  isValidListener(listener) {
    if (typeof listener === 'function') {
      return true
    } else if (listener && typeof listener === 'object') {
      return this.isValidListener(listener.listener)
    } else {
      return false
    }
  }
  indexOf(array, item) {
    let result = -1
    item = typeof item === 'object' ? item.listener : item

    for (let i = 0, len = array.length; i < len; i++) {
      if (array[i].listener === item) {
        result = i
        break
      }
    }

    return result
  }
  on(eventName, listener) {
    if (!eventName || !listener) return
    if (!this.isValidListener(listener)) {
      throw new TypeError('listener must be a function')
    }
    const events = this.__events
    const listeners = (events[eventName] = events[eventName] || [])
    const listenerIsWrapped = typeof listener === 'object'

    // 不重复添加事件
    if (this.indexOf(listeners, listener) === -1) {
      // 判断新加入的时间是否是 once 类型的
      listeners.push(
        listenerIsWrapped
          ? listener
          : {
              listener: listener,
              once: false,
            }
      )
    }
    return this
  }
  emit(eventName, args) {
    const listeners = this.__events[eventName]
    if (!listeners) return
    for (let i = 0; i < args.length; i++) {
      const listener = listeners[i]
      if (listener) {
        listener.listener.apply(this, args || [])
        if (listener.once) {
          this.off(eventName, listener.listener)
        }
      }
    }
    return this
  }
  off(eventName, listener) {
    const listeners = this.__events[eventName]
    if (listeners) return
    let index
    for (let i = 0, len = listeners.length; i < len; i++) {
      if (listeners[i] && listeners[i].listener === listener) {
        index = i
        break
      }
    }

    if (typeof index !== 'undefined') {
      listeners.splice(index, 1, null)
    }
    return this
  }
  once(eventName, listener) {
    return this.on(eventName, {
      listener: listener,
      once: true,
    })
  }
  allOff(eventName) {
    if (eventName && this.__events[eventName]) {
      this.__events[eventName] = []
    } else {
      this.__events = {}
    }
  }
}

function fn1(...args) {
  console.log('第一个监听函数', ...args)
}

function fn2(...args) {
  console.log('第2个监听函数', ...args)
}

function fn3(...args) {
  console.log('第3个监听函数', ...args)
}

let emitter = new EventEmitter()

emitter
  .on('demo', fn1)
  .once('demo', fn2)
  .on('demo', fn3)
