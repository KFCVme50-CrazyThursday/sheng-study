/**
 * 测试用例
 */

const Promise = require('./promise')
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

/**
 * allSettled 
 */
const promise1 = Promise.resolve(3)
const promise2 = new Promise((resolve, reject) =>
  setTimeout(reject, 100, 'foo')
)
const promises = [promise1, promise2]

Promise.allSettled(promises).then((results) =>
  results.forEach((result) => console.log(result))
)
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
