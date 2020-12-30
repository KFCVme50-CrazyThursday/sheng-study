/**
 * 测试用例
 */
const Promise = require('./Promise')
/**
 * all
 */

new Promise((resolve, reject) => {
  console.log('这里立即执行')
  // resolve 与 reject 只能有一个
  // resolve('成功了 ，这里会传递到 then 的成功回调 res 里')
  reject('失败了 ，这里会传递到 then 的失败回调 err 里')
}).then(
  (res) => {
    console.log(res) // 打印上面 resolve 的值
  },
  (err) => {
    console.log(err) // reject时候 打印上面 reject 的值
  }
)

Promise.allSettled([
  new Promise((resolve, reject) => setTimeout(() => resolve(1), 2000)),
  new Promise((resolve, reject) =>
    setTimeout(() => resolve(new Error('Whoops!')), 1000)
  ),
  Promise.reject(666666666666),
  new Promise((resolve, reject) => setTimeout(() => resolve(3), 1500)),
]).then(
  (res) => {
    console.log('res', res)
  },
  (err) => {
    console.log('err', err)
  }
)
console.log('=============================')
// Promise.all([
//   new Promise((resolve) => setTimeout(() => resolve(11111111), 3000)), // 1
//   Promise.reject(666666666666),
//   99999999999999, // 3
// ])
//   .then((res) => {
//     console.log('res========', res)
//   })
//   .catch((e) => {
//     console.log('e', e)
//   })
console.log('================================================')

Promise.reject(
  new Promise((resolve, reject) => {
    throw new Error(11111111111)
  })
).then(
  (res) => {
    console.log('res', res)
  },
  (err) => {
    console.log('err', err)
  }
)

/**
 * catch resolve reject
 */

/**
let promise = new Promise((resolve, reject) => {
  reject('Whoops!')
})

// .catch(f) 与 promise.then(null, f) 一样
promise.catch((err) => {
  console.log('err', err)
})
Promise.resolve(11111).then(
  (res) => {
    console.log('res', res)
  },
  (err) => {
    console.log('err', err)
  }
)
Promise.reject(22222222222).then(null, (err) => {
  console.log('err', err)
})
*/

/**
 * allSettled
 */

// const promise1 = Promise.resolve(3)
// const promise2 = new Promise((resolve, reject) =>
//   setTimeout(reject, 100, 'foo')
// )
// const promises = [promise1, promise2]

// Promise.allSettled(promises).then((results) =>
//   results.forEach((result) => console.log(result))
// )

/**
 * race
 */
/**
const promise1 = new Promise((resolve, reject) => {
  setTimeout(resolve, 500, 'one')
})

const promise2 = new Promise((resolve, reject) => {
  setTimeout(reject, 100, 'two')
})

Promise.race([promise1, promise2]).then((value) => {
  console.log(value)
  // Both resolve, but promise2 is faster
})
* 
 */

/**
 * 打印结果如下
 {
  status: 'fulfilled'
  value: 3
}
{
  reason: 'foo'
  status: 'rejected'
}
 */

/**
 * 
Promise.resolve(
  new Promise((resolve, reject) => {
    resolve(11111111)
  })
).then(
  (res) => {
    console.log('res1', res)
  },
  (err) => {
    console.log('err1', err)
  }
)

Promise.resolve(22222222222).then((res) => {
  console.log('res2', res)
})

Promise.resolve(new Error(33333)).then(
  (res) => {
    console.log('res3', res)
  },
  (err) => {
    console.log('err3', err)
  }
)
 * 
 */

/**
 * finnaly 测试用例
 */

/** 
let p = new Promise((resolve, reject) => {
  resolve(11111111)
}).then(
  (res) => {
    console.log('res', res)
  },
  (err) => {
    console.log('err', err)
  }
)
p.finally(() => {
  return new Promise((resolve, reject) => {
    resolve(33333333333)
    // throw new Error(55555555)
  }).then((res) => {
    console.log('res p', res)
  })
})
  .then(
    (res) => {
      console.log('res', res)
    },
    (err) => {
      console.log('err', err)
    }
  )
  .catch((e) => {
    // 如果 err 回调存在 catch 就不会被调用
    console.log('e', e)
  })
*/

/**
 * finally 必须接受一个函数 该测试用例使用 promise 未能得出与官方 promise 一致的结果
 * !暂时未做处理
 */
/** 
p.finally(
  new Promise((resolve, reject) => {
    resolve(6666666)
  })
).then(
  (res) => {
    console.log('res6', res)
  },
  (err) => {
    console.log('err6', err)
  }
)
*/
