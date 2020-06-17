/**
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 */
export function range (value, min, max) {
  return Math.min(max, Math.max(value, min))
}

/**
 * 计算两点距离
 * @param {{x: number; y: number}} p1 
 * @param {{x: number; y: number}} p2 
 */
export function distance (p1, p2) {
  return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
}
