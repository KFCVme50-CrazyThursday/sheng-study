# EventEmitter.js 事件的订阅和发布，支持链式调用

- 使用 es6 实现的事件的订阅发布
- 文件尚未导出 如需使用请使用 export 导出下
- 使用如下：

```javascript
import eventEmitter from 'path/eventEmitter.js'
var emitter = new EventEmitter()
```

## 核心 api

### on

添加一个监听器

```javascript
emitter.on(eventName, listener)
```

### once

添加一个只能触发一次的监听器

```javascript
emitter.once(eventName, listener)
```

### off

删除一个监听器

```javascript
emitter.off(eventName, listener)
```

### emit

触发事件

```js
// eventName 事件名  args为数组形式，传入事件监听器的参数
emitter.emit(eventName, args)
```

### allOff

删除某个事件或者所有事件

```js
//eventName 事件名称 如果不传，则删除所有事件
emitter.allOff(eventName)
```
