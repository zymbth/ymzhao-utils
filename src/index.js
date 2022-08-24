/**
 * 节流函数
 * @param {function} fn 执行函数
 * @param {number} delay 延时，单位：ms
 * @returns 
 */
export function throttle(fn, delay) {
  let prev = +new Date()
  return function(...args) {
    let curr = +new Date()
    if(curr - prev < delay) return
    setTimeout(() => {
      fn(...args)
      prev = curr
    }, delay)
  }
}