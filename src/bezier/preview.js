export default class Preview {
  /**
   * @param {HTMLCanvasElement} cvs
   * @param {string} color
   */
  constructor (cvs, color) {
    this.cvs = cvs
    this.ctx = cvs.getContext('2d')
    this.color = color
  }

  clear () {
    const { ctx, cvs } = this
    ctx.fillStyle = 'rgba(255,255,255,1)'
    ctx.fillRect(0, 0, cvs.width, cvs.height)
  }

  /**
   * @param {number} x 
   */
  drawPoint (x) {
    const { ctx } = this
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, 18, 8, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.globalAlpha = '.2'
    ctx.fill()
    ctx.restore()
  }
}
