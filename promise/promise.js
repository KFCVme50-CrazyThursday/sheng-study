const PENDING = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'

const resolvePromise = (promise2, x, resolve, reject) => {
  // x 与 promise 是同一个对象时候 抛出错误
  if (x === promise2) {
    return reject(
      new TypeError('Chaining cycle detected for promise #<Promise>')
    )
  }
  // 当 x 是一个对象或者函数时候
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    let called // 内部测试时候 成功失败都会继续调用  进行阻止
    try {
      let then = x.then // 防止then可能是通过 Object.defineProperty 定义的进行错误处理
      if (typeof then === 'function') {
        // then 方法是一个promise时候. 以 x 为 this，成功失败时均乡下传递
        then.call(
          x,
          (y) => {
            if (called) {
              return
            }
            called = true
            // y 可能还是一个 promise ，递归调用该处理函数
            resolvePromise(promise2, y, resolve, reject)
            // resolve(y)
          },
          (r) => {
            if (called) {
              return
            }
            called = true
            reject(r)
          }
        )
      } else {
        resolve(x) // 普通对象 直接resolve
      }
    } catch (error) {
      // promise 失败了有可能还会调用成功 进行阻止
      if (called) {
        return
      }
      called = true
      reject(error)
    }
  } else {
    resolve(x)
  }
}

class Promise {
  constructor(executor) {
    this.state = 'pending' // default state
    this.value = undefined // successful value
    this.reason = undefined // failed value
    this.onResolvedCbs = [] // the successful callbacks
    this.onRejectedCbs = [] // the failed callbacks

    let resolve = (value) => {
      if (this.state === PENDING) {
        this.value = value
        this.state = RESOLVED
        this.onResolvedCbs.forEach((fn) => fn()) // emit
      }
    }

    let reject = (reason) => {
      if (this.state === PENDING) {
        this.reason = reason
        this.state = REJECTED
        this.onRejectedCbs.forEach((fn) => fn())
      }
    }

    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }
  then(onFulfilled, onRejected) {
    // then 方法中可以 不接受参数 为空时候向下传递
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (val) => val
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (error) => {
            throw error
          }
    // then 中返回的可能依旧是个 promise 利用 setTimeout 宏任务获取当前 promise2 ，然后进行判断 then 中的是否是 promise ，在 promise2 中进行原先的逻辑处理
    let promise2 = new Promise((resolve, reject) => {
      // 异步时候可能状态依旧是 pending
      if (this.state === PENDING) {
        this.onResolvedCbs.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
        this.onRejectedCbs.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
      }
      //  同步
      if (this.state === RESOLVED) {
        setTimeout(() => {
          //状态未变更时候可能抛出错误
          try {
            let x = onFulfilled(this.value)
            // 抽离处理函数 ：promise2 x promise2的resolve reject
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      if (this.state === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      }
    })
    return promise2
  }
}

// 解决嵌套
Promise.defer = Promise.deferred = function () {
  let dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}
module.exports = Promise
