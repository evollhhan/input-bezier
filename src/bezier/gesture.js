class Gesture {
  sx = 0
  sy = 0
  onupdate = null
  onend = null

  constructor () {
    window.addEventListener('mousedown', e => {
      const { x, y } = e
      this.sx = x
      this.sy = y
    })
    window.addEventListener('mousemove', e => {
      if (this.onupdate) {
        const { x, y } = e
        this.onupdate(x - this.sx, y - this.sy)
      }
    })
    window.addEventListener('mouseup', () => this.end())
    window.addEventListener('mouseleave', () => this.end())
  }

  end () {
    this.onend && this.onend()
    this.onupdate = null
    this.onend = null
  }
}

export default new Gesture()
