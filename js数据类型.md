
# 数据类型：基本类型（原始类型） 和 引用类型（对象类型）

### 基本类型 

- null: null
- undefined: undefined
- boolean: true or false
- string: string
- number: 整数或浮点数，正负无穷大，NaN
- symbol: 表示唯一切无法改变的值
- bigInt

### 引用类型
- object：object、array、function regex 等


### 基本类型与引用类型的区别
 
1、基本类型无法改变切没有方法可调用。js中基本类型是按值存储在栈内存的
```
undefined.toString() 
// Uncaught TypeError: Cannot read property 'toString' of undefined
'1'.toString()
//可以调用该方法的  其实原因是这个时候的 字符串 '1' 已经被强制转换成了 String对象的了
<!-- 主要放生了一下过程 -->
// 创建一个 String 类型实例
// 在实例上调用 toString 方法
// 销毁实例

var str = 'sq';
sq.slice(1)
console.log(str)  // sq
// 这个时候的 str 调用了slice方法后 ，然后它的值并没有改变

var str1 = 'sq'
str1 = str1 + 6
console.log(str1) // sq6

这个时候的 str1 变化了，但其实是执行了以下操作：
执行 str1 = str1 + 6 时 ，实际上是在栈中开辟了一个新的内存空间来保存 sq6 ，然后将变量重新指向这个空间。
```
2、引用类型是保存在内存中的对象，存储在堆内存中，它在栈中只存储了一个固定长度的地址，这个地址指向堆内存中的值。js不允许直接访问内存中的位置。在操作对象时，实际上是在操作对象的引用而不是实际的对象。
```
var obj = {
  name: 'sq',
  age:24
}
var obj1 = obj
obj1.name = 'ax'
console.log(obj.name)  // 'ax'
```
因为引用类型操作的是指针，所以会导致当把obj赋值给obj1的时候，其实是把obj1的指针copy了一份，因为指针指向同一个值，就会导致其中一个变化另一个也跟着变化。鉴于这种原因，这也是深浅拷贝的出现的原因。

##### 浅拷贝：只拷贝一层
  * arr.slice()
  * arr.concat()
  * Object.assign()
  * 展开运算符 ...
  ```
  let arr = [1,2,3]
  let arr1 = arr.slice()
  arr1[0] = 8
  console.log(arr,arr1)

  let a = {
      age: 1
  }
  let b = { ...a }
  a.age = 2
  console.log(b.age) // 1

  let people = {
    name: 'sq',
    haveGirlFriend: {
      number: 0
    }
  }
  let people1 = Object.assign({}, people);
  people1.haveGirl.number = 1
  console.log(people)
  ```
  浅拷贝如何实现：
  ```
    var shallowCopy = function(obj) {
      // 只拷贝对象
      if (typeof obj !== 'object') return;
      // 根据obj的类型判断是新建一个数组还是对象
      var newObj = obj instanceof Array ? [] : {};
      // 遍历obj，并且判断是obj的属性才拷贝
      for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
              newObj[key] = obj[key];
          }
      }
      return newObj;
    }
  ```
##### 深拷贝  JSON.parse(JSON.stringify(object))
  该方法的局限性
  * 会忽略 undefined
  * 会忽略 symbol
  * 不能序列化函数
  * 不能解决循环引用的对象
简易版深拷贝
```
function deepClone(obj) {
  function isObject(o) {
    return (typeof o === 'object' || typeof o === 'function') && o !== null
  }

  if (!isObject(obj)) {
    throw new Error('非对象')
  }

  let isArray = Array.isArray(obj)
  let newObj = isArray ? [...obj] : { ...obj }
  Reflect.ownKeys(newObj).forEach(key => {
    newObj[key] = isObject(obj[key]) ? deepClone(obj[key]) : obj[key]
  })

  return newObj
}
```

**因为这个原因，在数据比较上也会出现不同。** 基本类型比较的直接是值，只要两者相等，既返回true。引用类型，比较的时候则会比较他们的指针，即便两个属性的值一样两个变量也是不相等的。

```
var str = '111'
var str1 = '111'
console.log(str === str1)  // true

var obj = { name: 'sq' }
var obj1 = { name: 'sq' }
console.log(obj === obj1)  // false
```

3、参数的传递：访问变量有按值和按引用两种方式，而参数只能按值传递。
```
// 1
function person(name) {
  return name = 'ax'
}
var name = 'sq'
person(name)
console.log(name)  // sq

// 2
function person(obj) {
  obj.name = 'ax'
}
var obj1 = { name: 'sq' }
person(obj1)
console.log(obj1) // {name: "ax"}

//3
function person(obj) {
  obj.name = 'ax'
  obj = { name: 'sj' }
}
var obj1 = { name: 'sq' }
person(obj1)
console.log(obj1) // {name: "ax"}

```
2 与 3 可见  函数并不是按引用传递的，而是变量拷贝的副本，当变量是原始类型时，这个副本就是值本身，当变量是引用类型时，这个副本是指向堆内存的地址。


### 类型的判断： typeof vs instanceof
1、typeof 是操作符不是函数，类似于加减乘那样的操作符

```
const name = 'sq'
console.log( !typeof name === 'object' )
console.log( !typeof name === 'string' )
// 全为false，因为是操作符，会先 typeof进行判断，然后取反，最后比较。
```
typeof 对于原始类型，除了 null 都可以正确判断

```
typeof 1 // 'number'
typeof '1' // 'string'
typeof undefined // 'undefined'
typeof true // 'boolean'
typeof Symbol() // 'symbol'
```
typeof对于引用类型，除了函数都会返回object
```
typeof function(){}  // function
typeof [] // object
typeof {} // object
typeof new Date() // object
typeof /^\d*$/; // object
```

2、instanceof：内部机制通过原型链判断。但不能用来判断基本类型
```
[] instanceof Array // true
new Date() instanceof Date // true
new RegExp() instanceof RegExp // true

var str = 'hello world'
str instanceof String // false

var str1 = new String('hello world')
str1 instanceof String // true

var person = function() {}
person  instanceof Object // true
```
3、Object.prototype.toString.call()
每一个引用类型都有 toString 方法，默认情况下，toString 方法被每个 Object 对象继承。如果此方法在自定义对象中未被覆盖，toString 返回 "[object type]"，其中type是对象的类型。
```
var people = {name: 'sq'}
people.toString() // [object Object]
```
实际中大部分的引用类型都重写了 toString 方法，我们可以通过 call 来改变 this 进而调用违背改变的

```
Object.prototype.toString.call('sq')
Object.prototype.toString.call(18)
Object.prototype.toString.call(null)
Object.prototype.toString.call(undefined)
Object.prototype.toString.call({})
Object.prototype.toString.call([])
```
# 类型转换
  会调用内置的 [[ToPrimitive]] 函数
  从引用类型到基本类型的转换：
  引用类型转换为Number类型，先调用valueOf，再调用toString
  引用类型转换为String类型，先调用toString，再调用valueOf
  若valueOf和toString都不存在，或者没有返回基本类型，则抛出TypeError异常。
 * 记不住 卒