/**
 * javascript common methods
 * @author ymzhao
 */


/**
 * typeof 获取数据类型
 * @link https://juejin.cn/post/7000300249235357709#heading-3
 * @param {any} value 
 * @returns 
 */
export function mTypeof(value) {
  return value instanceof Element ? "element" :
    Object.prototype.toString.call(value).replace(/\[object\s(.+)\]/, "$1").toLowerCase()
}

/**
 * 获取数据类型
 * @param {any} value 
 * @returns 
 */
 export function getType(value) {
  const match = Object.prototype.toString.call(value).match(/ (\w+)/)
  return match[1].toLocaleLowerCase()
}

/**
 * 节流函数
 * @param {function} fn 执行函数
 * @param {number} interval 间隔时间，单位：ms
 * @param {object} _this context
 * @return {function} throttle func
 * @example 
 * const count = () => { console.log('counted') }
 * window.addEventListener('resize', throttle(count, 500))
 */
export function throttle(fn, interval = 300, _this) {
  let prev = + new Date() // 开始时间 ms
  return function(...args) {
    let curr = + new Date() // 当前时间 ms
    if(curr - prev > interval) { // 超出间隔，执行
      prev = curr
      _this ? fn.call(_this, ...args) : fn(...args)
    }
  }
}

/**
 * 防抖函数，去弹跳
 * @param {function} fn 执行函数
 * @param {number} delay 延时，单位：ms
 * @param {object} _this context
 * @return {function} debounce func
 * @example 
 * const count = () => { console.log('counted') }
 * window.addEventListener('resize', debounce(count, 500))
 */
export function debounce(fn, delay = 300, _this) {
  let timer // 计时器
  return function(...args) {
    timer && clearTimeout(timer) // 清除delay延时内存在的计时器
    // 延时执行fn
    timer = setTimeout(() => {
      _this ? fn.call(_this, ...args) : fn(...args)
    }, delay)
  }
}

/**
 * 简单的对象深拷贝
 * 值为undefined的会被忽视
 * @param {object} obj 
 * @returns 
 */
 export function simpleDeepCopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * 对象深拷贝
 * @link https://www.cnblogs.com/wangyong1997/p/13577725.html
 * @param {any} val 
 * @returns 
 */
export function deepCopy(val) {
  switch (mTypeof(val)) {
    case 'array':
      return val.map(v => deepCopy(v))
    case 'object':
      return Object.keys(val)?.reduce((prev, curr) => {
        prev[curr] = deepCopy(val[curr])
        return prev
      }, {})
    case 'map':
      let tmpMap = new Map()
      val.forEach((v, k) => tmpMap.set(k, deepCopy(v)))
      return tmpMap
    case 'set':
      let tmpSet = new Set()
      for (let v of val.values()) tmpSet.add(deepCopy(v))
      return tmpSet
    case 'regexp':
      return new RegExp(val)
    case 'date':
      return new Date(val.valueOf())
    case 'function':
    // return new Function('return ' + val.toString()).call(this)
    case 'string':
    case 'number':
    case 'boolean':
    case 'null':
    case 'undefined':
    default:
      return val
  }
}

/**
 * 深拷贝一个对象
 * @param {any} obj 
 * @param {*} hash 
 * @returns 
 */
 export function deepCopy1(obj, hash = new WeakMap()) {
  if (obj instanceof Date) {
    return new Date(obj)
  }
  if (obj instanceof RegExp) {
    return new RegExp(obj)
  }
  if (hash.has(obj)) {
    return hash.get(obj)
  }
  let allDesc = Object.getOwnPropertyDescriptors(obj)
  let cloneObj = Object.create(Object.getPrototypeOf(obj), allDesc)
  hash.set(obj, cloneObj)
  for (let key of Reflect.ownKeys(obj)) {
    if (obj[key] && typeof obj[key] === "object") {
      cloneObj[key] = deepCopy1(obj[key], hash)
    } else {
      cloneObj[key] = obj[key]
    }
  }
  return cloneObj
}

/**
 * 自用 - 判断俩值是否相等
 * @param {any} obj1 
 * @param {any} obj2 
 * @param {array} excludes 排除项，不对比
 * @returns 
 */
 function isObjectEqual(obj1, obj2, excludes = ['key']) {
  let type1 = mTypeof(obj1), type2 = mTypeof(obj2)
  if (type1 !== type2) return false
  switch(type1) {
    case 'array':
      if (obj1.length != obj2.length) return false
      return obj1.every((v, idx) => isObjectEqual(v, obj2[idx], excludes))
    case 'object':
      let keys1 = Object.keys(obj1),
        keys2 = Object.keys(obj2)
      if (keys1.length != keys2.length) return false
      return keys1.every(k => {
        if(excludes && excludes.includes(k)) return true // 排除项不检查
        return isObjectEqual(obj1[k], obj2[k], excludes)
      })
    case 'string':
    case 'number':
    case 'boolean':
      return obj1 === obj2
    case 'date':
      return obj1.getTime() === obj2.getTime()
    case 'function':
      return obj1 === obj2
    case 'map':
    case 'set':
      if(obj1.size !== obj2.size) return false
      const iterator1 = obj1.entries(), iterator2 = obj2.entries()
      let tmpVal1 = iterator1.next().value, tmpVal2 = iterator2.next().value, ck = true
      while(tmpVal1 && tmpVal2) {
        if(tmpVal1[0] !== tmpVal2[0] || tmpVal1[1] !== tmpVal2[1]) {
          ck = false
          break
        }
        tmpVal1 = iterator1.next().value
        tmpVal2 = iterator2.next().value
      }
      return ck
    case 'regexp':
      return obj1.toString() === obj2.toString()
    case 'null':
    case 'undefined':
    default:
      return true
  }
}

/**
 * 数组去重
 * @param {array} arr 
 * @returns 
 */
export function distinctArray(arr) {
  if(!arr || !(arr instanceof Array)) return arr
  return [...new Set(arr)]
}

/**
 * async...await...全局异常捕捉
 * @param {function} fn 异步请求函数
 * @param {...any} args fn arguments
 * @return {object} { resp: 响应, err: 错误 }
 * @example 
 * async function test(val) {
 *   const { resp, err } = await asyncFuncWrap(func, val)
 * }
 */
export async function asyncFuncWrap(fn, ...args) {
  try {
    const resp = await fn(...args)
    return({ resp })
  } catch (err) {
    return { err }
  }
}

/**
 * 滚动到页面顶部
 */
export function scrollToTop() {
  window?.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
}

/**
 * 滚动到页面底部
 */
export function scrollToBottom() {
  window?.scrollTo({
    top: document.documentElement.offsetHeight,
    left: 0,
    behavior: 'smooth'
  })
}

/**
 * 全屏显示元素
 * @param {element} element 
 * @example
 * let ele = document.getElementById('test')
 * goToFullScreen(ele)
 */
export function goToFullScreen(element) {
  element = element || document.body
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen()
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen()
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen()
  }
}

/**
 * 退出浏览器全屏状态
 */
export function goExitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

/**
 * 停止冒泡事件
 * @param {event} event 
 */
export function stopPropagation(event) {
  event = event || window.event
  if(event.stopPropagation) {
    event.stopPropagation()
  } else {
    event.cancelBubble = true
  }
}

/**
 * 确定设备类型
 */
export const isMobile = () => {
  return !!navigator.userAgent.match(
    /(iPhone|iPod|Android|ios|iOS|iPad|Backerry|WebOS|Symbian|Windows Phone|Phone)/i
  )
}

/**
 * 判断设备是安卓
 */
export const isAndroid = () => {
  return /android/i.test(navigator.userAgent.toLowerCase())
}

/**
 * 判断设备是IOS
 */
export const isIOS = () => {
  let reg = /iPhone|iPad|iPod|iOS|Macintosh/i
  return reg.test(navigator.userAgent.toLowerCase())
}

/**
 * 生成随机字符串
 * @param {number} len 字符串位数
 * @return {string} 随机字符串
 */
export const randomString = (len) => {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz123456789'
  const strLen = chars.length
  let randomStr = ''
  for (let i = 0; i < len; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * strLen))
  }
  return randomStr
}

/**
 * 字符串首字母大写
 * @param {string} str 
 * @returns 
 */
export const firstLetterUpper = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 生成指定范围内的随机数 [min,max]
 * @param {number} min 
 * @param {number} max 
 * @returns 
 */
export const randomNum = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 打乱数组顺序
 * @param {array} arr 
 * @returns 
 */
export const shuffleArray = (arr) => {
  return arr.sort(() => 0.5 - Math.random())
}

/**
 * 格式化货币，千分位数字
 * @param {number} money 
 * @return {string}
 * @example
 * formatMoney(123456789.123) // '123,456,789.123'
 */
export const formatMoney = (money) => {
  return money.toLocaleString()
}

/**
 * 格式化货币，千分位数字，正则表达式实现
 * @param {number} money 
 * @return {string}
 * @example
 * formatMoneyReg(123456789.123) // '123,456,789.123'
 */
export const formatMoneyReg = (money) => {
  return money.replace(new RegExp(`(?!^)(?=(\\d{3})+${money.includes('.') ? '\\.' : '$'})`, 'g'), ',')  
}

/**
 * 手动延时
 * @param {any} val 输入值
 * @param {number} delay 延时
 * @return {promise}
 */
export function manualDelay(val, delay = 2000) {
  return new Promise((resolve, reject) => {
    if(val) {
      setTimeout(() => {
        resolve(val)
      }, delay)
    } else {
      reject(new Error(`Manual error: ${val}`))
    }
  })  
}