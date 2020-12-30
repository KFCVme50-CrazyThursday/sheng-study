# 逐步实现一个符合 Promise A+ 规范的 promise

[Promise A+ 规范](https://promisesaplus.com/#point-57)

## 平时 promise 的基本用法

```javascript
new Promise((resolve, reject) => {
  console.log('这里立即执行')
  // resolve 与 reject 只能有一个
  resolve('成功了 ，这里会传递到 then 的成功回调 res 里')
  // reject('失败了 ，这里会传递到 then 的失败回调 err 里')
}).then(
  (res) => {
    console.log(res) // 打印上面 resolve 的值
  },
  (err) => {
    console.log(err) // reject时候 打印上面 reject 的值
  }
)
```

分析以上代码：

1. `new` 了个 `promise` , `promise` 中接受一个执行器函数 `executor`(接受 `resolve` `reject` 这两个函数作为参数)
2. `promise` 内部是立即执行的 →
3. `promise` 有三种状态： `pending`(等待) `fulfilled`(成功) `rejected`(失败)，初始状态为 `pending` ，当执行成功时候状态会由 `pending` 变为 `fulfilled` ，失败则变为 `rejected`
   - 状态只能由 `pending` → `fulfilled` 或 `pending` → `rejected` ， 切一旦变更不可改变
   - 状态的变更分别对应 `then` 中的两个回调函数
4. `then` 中接受两个回调函数: 成功 失败
   - `res` 成功回调： 该函数将在 `promise resolved`后运行并接收结果。
   - `err` 失败回调： 该函数将在 `promise rejected` 后运行并接收 `error`

```javascript
const PENDING = 'PENDING'
const RESOLVED = 'RESOLVED'
const REJECTED = 'REJECTED'

class Promise {
  constructor(executor) {
    this.state = PENDING // 初始状态为 pending
    this.reason = undefined // 失败回调时候的原因  即为reject()传递的值
    this.value = undefined // 成功回调的值  即为 resolve() 传递的值

    // executor中接受两个函数 resolve reject
    let resolve = (value) => {
      // 状态由 pending 变成成功 resolve
      if (this.state === PENDING) {
        this.state = RESOLVED
        this.value = value
      }
    }
    let reject = (reason) => {
      // 状态由 pending 变成成功 resolve
      if (this.state === PENDING) {
        this.state = REJECTED
        this.reason = reason
      }
    }
    // executor调用
    try {
      executor(resolve, reject)
    } catch (error) {
      // 报错直接抛出
      reject(error)
    }
  }
  // then 方法 then 中有两个值 成功的回调与失败的回调 这两值也阔以不穿
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (val) => val
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (err) => {
            throw err
          }
    // 如果是成功就执行成功的回调用  失败就执行失败的回调
    if (this.state === REJECTED) {
      onFulfilled(this.value)
    }
    if (this.state === REJECTED) {
      onRejected(this.reason)
    }
  }
}
```

一个基本的 promise 基本完成

## 当 promise 的 then 中状态未发生变化时候

```javascript
new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(111111111)
  }, 0)
}).then(
  (res) => {
    console.log('res', res)
  },
  (err) => {
    console.log('err', err)
  }
)
```

- 有的时候 `then` 中不一定就是 成功 或者 失败 状态可能还是 pending ,
- 比如下方的代码使用上面的调用会得不到预期的值 正常来说 `resolve(111111)` 会出现在 `console.log('res', res)`，
- 但是 因为 `setTimeout` 异步 宏任务会比微任务晚执行 导致 `state` 状态并未由 `pending` 变成 `resolve`, 同理 `reject` 时候亦如此
- 可以初始化两个 存储 `resolve()` `reject()` 的数组 用于该情况时候进行存储
  - 有点发布订阅模式那味了。then 中进行订阅(存储异步函数) executor 中进行发布(执行)

```javascript
// 修改上方代码 初始化连个数组 添加到 constructor 中
...

this.onResolvedCbs = [] // the successful callbacks
this.onRejectedCbs = [] // the failed callbacks

...
// then 方法中添加是 pending 状态时候的逻辑
if (this.state === PENDING) {
  this.onResolvedCbs.push(() => {
    onFulfilled(this.value)
  })

  this.onRejectedCbs.push(() => {
    onRejected(this.reason)
  })
}
...

...
// resolve reject 中分别循环数组 onResolvedCbs onRejectedCbs 执行
this.onResolvedCbs.forEach((fn) => fn()) // resolve 中
this.onRejectedCbs.forEach((fn) => fn()) // reject 中
...
```

**<font color=pink size=6>到此一个初版 的 promise 完成</font>**

```javascript
const PENDING = 'pending' //默认状态
const RESOLVED = 'resolved' // 成功
const REJECTED = 'rejected' // 失败
class Promise {
  constructor(executor) {
    this.state = PENDING // 默认状态
    this.reason = undefined // 失败时候的默认值
    this.value = undefined // 成功时候的默认值
    this.onResolvedCbs = [] // 成功时候的回调
    this.onRejectedCbs = [] // 失败时候的回调
    // 成功时候的回调
    let resolve = (value) => {
      if (this.state === PENDING) {
        this.state = RESOLVED
        this.value = value
        this.onRejectedCbs.forEach((fn) => fn()) // emit  执行
      }
    }

    let reject = (reason) => {
      if (this.state === PENDING) {
        this.state = REJECTED
        this.reason = reason
        this.onRejectedCbs.forEach((fn) => fn())
      }
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (val) => val
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (error) => {
            throw error
          }

    // 异步时候状态尚未由 peding 转变
    if (this.state === PENDING) {
      this.onResolvedCbs.push(() => {
        onFulfilled(this.value)
      })

      this.onRejectedCbs.push(() => {
        onRejected(this.reason)
      })
    }
    // 同步时候直接执行
    if (this.state === RESOLVED) {
      onFulfilled(this.value)
    }
    if (this.state === REJECTED) {
      onRejected(this.reason)
    }
  }
}
module.exports = Promise
```

## **<font color=red size=6>然而上面依旧存在很多问题 下面进行完善</font>**

## 链式调用问题

```javascript
new Promise((resolve, reject) => {
  resolve(111111)
})
  .then(
    (res) => {
      console.log(res)
    },
    (err) => {}
  )
  .then(
    (res) => {
      console.log(res)
    },
    (err) => {}
  )
```

**我们在 `then` 中可以像如上代码那样进行链式调用，接下来进行实现。**

- then 函数是可以链式调用的 必然是返回了一个新的 promise
- 而 `then` 中的 **回调函数** 返回的 也可能是个 `promise` ，当是个 `promise` 时候会以该 `promise` 的状态向外传递
- 假设返回的是个 promise，记为 **promise2**，则需要先拿到当前的 `promise` ，对当前 `promise` 的 `resolve` `reject` 回调函数委托到外层 `promise2` 上进行处理，使用 `setTimeout` 拿到 `promise2`,抽离出 `resolvePromise`函数，而该函数恰是链式调用的关键所在

```javascript
...
then(onFulfilled, onRejected){
  ...
  let promise2 = new Promise((resolve, reject) => {
    if (this.state === RESOLVED) {
      setTimeout(() => {
        //状态未变更时候可能抛出错误
        try {
          let x = onFulfilled(this.value) // 保存当前回调函数
          // 将
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      }, 0)
    }
  }
  // 另外两种状态进行相同逻辑处理
  ...
  return promise2
}

```

`resolvePromise` 的实现遵循 Promise A+ 规范

![处理描述](../images/resolvePromise.png)

翻译过啦就是(百度抄来的)

- 2.3.1. 如果 promise 和 x 指向同一个对象，promise 将拒绝执行且抛出一个 TypeError 作为拒因。
- 2.3.2. 如果 x 是一个 promise 对象。接收它的状态：
  - 2.3.2.1. 如果 x 处于 pending 状态，则必须保留其 pending 状态至 x 变为 fulfilled 或者 rejected。
  - 2.3.2.2. 如果 x 是 fulfilled 状态，则以 x 的值；来执行 promise。
  - 2.3.2.3. 如果 x 是 rejected 状态，则以 x 的拒因来拒绝执行 promise。
- 2.3.3. 否则，如果 x 是一个对象或者函数，
  - 2.3.3.1. 定义一个 then 变量将 x.then 赋值给变量 then。
  - 2.3.3.2. 如果 x.then 取值时抛出异常 e，则拒绝执行 promise 并以 e 作为拒因。
  - 2.3.3.3. 如果 then 是一个函数，用 x 代替 this 来调用它，resolvePromise 作为第一个参数， rejectPromise 作为第二个参数。
  - 2.3.3.3.1. 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)。
  - 2.3.3.3.2.如果 rejectPromise 以拒因 r 为参数被调用，则以 r 为拒因拒绝执行 promise。
  - 2.3.3.3.3. 如果 resolvePromise 和 rejectPromise 都被调用，或者以相同的参数被调用多次，**则只执行第一次调用，其他调用被忽略。**
  - 2.3.3.3.4. 如果调动 then 方法抛出异常 e，
    - 2.3.3.3.4.1. 忽略 resolvePromise 或者 rejectPromise 的调用。
    - 2.3.3.3.4.2. 除此之外，拒绝执行 promise 并以 e 作为拒因
  - 2.3.3.4. 如果 then 不是一个函数，则以 x 为值执行 promise
- 2.3.4. 如果 x 不是一个对象或者函数，，则以 x 为值执行 promise

上方翻译成人话就是说：

1. 当 x 与 promise 相等时候 抛出一个错误
2. 当 x 是一个对象或者函数的时候。并且当 x 是一个函数时候必然存在 then 方法，then 方法可能会被 Object.defineProperty 定义 ，需要进行容错处理，如果报错直接 以当前错误原因作为 reject 抛出
3. 当 x 存在 then 的时候，直接调用 then 并以 当前调用成功的 resolve 作为 resolve 抛出，如果失败 则 以当前失败的 reject 作为 promise 失败的原因
4. x.then 中可能还存在以上情况，递归
5. 当 取反 2 时候，x 既是一个普通值 直接 resolve

```javascript
const resolvePromise = (promise2, x, resolve, reject) => {
  // x 与 promise 是同一个对象时候 抛出错误
  if (x === promise2) {
    // 2.3.1.
    return reject(
      new TypeError('Chaining cycle detected for promise #<Promise>')
    )
  }
  // 当 x 是一个对象或者函数时候
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    let called // 防止重复 resolve reject  对应上方2.3.3.3.3.
    try {
      //防止then可能是通过 Object.defineProperty 定义的方法，进行 错误处理
      let then = x.then
      if (typeof then === 'function') {
        // 当是一个promise时候必然具有 then 方法
        then.call(
          x,
          (y) => {
            if (called) {
              return
            }
            called = true
            // 依然可能是 promise 递归调用
            resolvePromise(promise2, y, resolve, reject)
          },
          (r) => {
            // 失败时候直接 reject
            if (called) {
              return
            }
            called = true
            reject(r)
          }
        )
      } else {
        resolve(x)
      }
    } catch (error) {
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
```

## 嵌套问题优化

在 `promise` 使用中经常用于封装异步请求时候会有以下代码师范

```javascript
getData() {
  return new Promise((resolve,reject)=>{
    this.api.getList({data}).then(res=>{
      if(!成功) {
        reject(res)
      }
      resolve(res)
    })
  })
}
```

以上代码中`promise`形成嵌套，可将 `promise` `resolve reject` 进行中间缓存来解决嵌套 添加 `defer` 方法

```javascript
Promise.defer = Promise.deferred = function () {
  let dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}
```

以上案例代码使用改版后的 promise 如下：

```javascript
getData() {
  let dfd = Promise.defer()
  this.api.getList(data).then(res=>{
    if(!成功) {
      dfd.reject(res)
    }
    dfd.resolve(res)
  })
  return dfd.promise;
}

```

至此 一个 符合 promise A+ 规范的 promise 基本完成，进行导出 `module.export = Promise`

```javascript
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
    this.state = PENDING // default state
    this.value = undefined // successful value
    this.reason = undefined // failed value
    this.onResolvedCbs = [] // the successful callbacks
    this.onRejectedCbs = [] // the failed callbacks

    let resolve = (value) => {
      if (this.state === PENDING) {
        this.value = value
        this.state = RESOLVED
        this.onResolvedCbs.forEach((fn) => fn())
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
// 到此一个 符合 Promise A+ 规范的基本完成

// 扩充 api
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
```

## 规范测试

- 全局安装 `promises-aplus-tests` 进行规范测试， `npm i promises-aplus-tests -g`
- 终端到达文件夹后运行`promises-aplus-tests promise.js`

## 测试结果

![规范测试](../images/success.png)

## 扩展 5 个静态方法 2 个实例方法

### 静态方法 reject resolve all allSettled race

#### reject resolve

reject 其实就是 用 error 创建一个 rejected 的 promise。
resolve 其实就是 用结果 value 创建一个 resolved 的 promise。

```javascript
Promise.reject = function (value) {
  return new Promise((resolve, reject) => {
    reject(value)
  })
}
```

但是 resolve 中可能还是个 promise 相比 reject 不能直接返回，创建一个判断 peomise 的函数

```javascript
const isPromise = (value) => {
  if (
    (typeof value === 'object' && value !== null) ||
    typeof value === 'function'
  ) {
    if (typeof value.then === 'function') {
      return true
    }
  } else {
    return false
  }
}
```

当是一个 promise 时候需要调用 then 方法进行一个 promise 返回

```javascript
Promise.resolve = function (value) {
  if (isPromise(value)) {
    try {
      let then = value.then
      return new Promise(then.bind(value))
    } catch (error) {
      return new Promise((resolve, reject) => {
        reject(error)
      })
    }
  } else {
    return new Promise((resolve, reject) => {
      resolve(value)
    })
  }
}
```

#### all allSettled

all: 异步并发 同步处理结果，只有都满足 resolve 时候才会 resolve，一旦有一个 reject 则将该 reject 作为结果返回

```javascript
/**
 * @param {values} 可迭代数组 每一项都是一个 promise
 *  接受一个 promise 数组作为参数（从技术上讲，它可以是任何可迭代的，但通常是一个数组）并返回一个新的 promise。
 * 所有的 resolve 才会 resolve,任何一个 reject 就会 reject
 * !更适合彼此相互依赖或者在其中任何一个 reject 时立即结束。
 */
Promise.all = function (values) {
  return new Promise((resolve, reject) => {
    let arr = [] // 处理结果存储到 数组中
    let index = 0
    function processData(key, value) {
      arr[key] = value
      if (++index === values.length) {
        resolve(arr)
      }
    }
    for (let i = 0; i < values.length; i++) {
      let current = values[i] // 当前结果可能是个 promise
      if (isPromise(current)) {
        current.then((data) => {
          processData(i, data)
        }, reject)
      } else {
        processData(i, current)
      }
    }
  })
}
```

allSettled : 返回所有的项，不论成功失败

```javascript
/**
 * 返回一个在所有给定的promise都已经 resolved 或 rejected 后的promise，结果里每一项都是一个对象数组，每个对象表示对应的promise结果。
 * !当您有多个彼此不依赖的异步任务成功完成时，或者您总是想知道每个promise的结果时，通常使用它。
 * {status:"fulfilled", value:result} 对于成功的响应，
 * {status:"rejected", reason:error} 对于 error。
 */
Promise.allSettled = function (values) {
  const rejectHandler = (reason) => ({ status: 'rejected', reason })
  const resolveHandler = (value) => ({ status: 'fulfilled', value })
  const convertedPromises = values.map((p) =>
    Promise.resolve(p).then(resolveHandler, rejectHandler)
  )
  return Promise.all(convertedPromises)
}
```

#### race

race: 只要有个一个状态发生变化 立即返回 不论成功事变

```javascript
Promise.race = function (values) {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < values.length; i++) {
      let current = values[i]
      Promise.resolve(current).then(resolve, reject)
    }
  })
}
```

### 实例方法: catch finally

catch : 错误统一处理，直接链式调用 then 方法的回调函数中的 reject ，并返回一个 promise

```javascript
catch(cb) {
    return this.then(null, cb)
  }
```

finally: 当 promise 被 resolve 或 reject 时调用，并返回一个 promise

```javascript
finally(cb) {
  return this.then(
    (data) => {
      return Promise.resolve(cb()).then(() => data)
    },
    (err) => {
      return Promise.resolve(cb()).then(() => {
        throw err
      })
    }
  )
}
```
