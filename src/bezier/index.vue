<template lang="pug">
  div.bezier
    div.preview
      div.box(
        ref="box"
        :class="{ animated }"
        :style="{ animationTimingFunction: `${bezier}`, background: lineStroke }"
        @animationstart="onanimationstart"
        @animationend="onanimationend"
      )
      canvas(ref="cvs" width="258" height="36")
    div.example
      div(
        v-for="(item, idx) in examples"
        :key="idx"
        :class="[item]"
        @click="onselect(idx + 1)"
      )
    svg.panel(
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-80 -50 200 200"
    )
      //- 底色
      rect(x="0" y="-50" width="100" height="200" fill="#fff" @click="onclickrect")
      //- 曲线
      path(
        :d="d"
        :stroke="lineStroke"
        fill="none" stroke-width="2" stroke-linecap="round" style="pointer-events: none;"
      )
      //- 对角辅助线
      line(
        :stroke="lineStroke"
        x1="0" y1="100" x2="100" y2="0" opacity=".1"
      )
      //- 辅助线P1
      line(
        :stroke="ballStroke"
        x1="0" y1="100" :x2="p1.x" :y2="p1.y" opacity=".1"
      )
      //- 辅助线P2
      line(
        :stroke="ballStroke"
        :x1="p2.x" :y1="p2.y" x2="100" y2="0" opacity=".1"
      )
      //- 控制点P1
      circle(
        :cx="p1.x"
        :cy="p1.y"
        :fill="ballFill"
        :stroke="ballStroke"
        r="4"
        @mousedown="onmousedown(p1)"
      )
      //- 控制点P2
      circle(
        :cx="p2.x"
        :cy="p2.y"
        :fill="ballFill"
        :stroke="ballStroke"
        r="4"
        @mousedown="onmousedown(p2)"
      )
    div.selector(
      v-if="name"
    )
      button.arrow(@click="idx-=1,onselect()")
      div.name(v-text="name")
      button.arrow.reverse(@click="idx+=1,onselect()")
    div.bez-text(
      v-text="bezier"
      v-else
    )
</template>

<script>
import gesture from './gesture'
import presets from './preset.json'
import Preview from './preview'
import {
  range,
  distance
} from './math'

export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      validator: () => true
    },
    lineStroke: {
      type: String,
      default: 'rgba(0, 0, 0, 1)'
    },
    ballStroke: {
      type: String,
      default: 'rgba(0, 0, 0, 1)'
    },
    ballFill: {
      type: String,
      default: 'rgba(255, 255, 255, 1)'
    }
  },
  data () {
    return {
      p1: { x: 0, y: 20 },
      p2: { x: 40, y: 20 },
      animated: false,
      examples: [
        'easeout',
        'ease',
        'easein'
      ],
      idx: 0,
      name: '',
      itv: null,
      preview: null
    }
  },
  computed: {
    d () {
      return `M 0 100 C ${this.p1.x} ${this.p1.y}, ${this.p2.x} ${this.p2.y}, 100 0`
    },
    bezier () {
      var x1 = Number((this.p1.x / 100).toFixed(2))
      var y1 = Number(((100 - this.p1.y) / 100).toFixed(2))
      var x2 = Number((this.p2.x / 100).toFixed(2))
      var y2 = Number(((100 - this.p2.y) / 100).toFixed(2))
      return `cubic-bezier(${x1}, ${y1}, ${x2},${y2})`
    }
  },
  watch: {
    d () {
      this.animated = false
      setTimeout(() => {
        this.animated = true
      }, 800)
    },
    bezier (val) {
      this.$emit('change', val)
    }
  },
  mounted () {
    this.onselect()
    this.preview = new Preview(this.$refs.cvs, this.lineStroke)
  },
  methods: {
    onanimationstart () {
      if (this.itv) {
        clearInterval(this.itv)
      }
      const { box } = this.$refs
      this.preview.clear()
      this.preview.drawPoint(16)
      this.itv = setInterval(() => {
        const { x } = box.getBoundingClientRect()
        this.preview.drawPoint(x)
      }, 64)
    },
    onanimationend () {
      clearInterval(this.itv)
    },
    onmousedown (target) {
      this.name = ''
      const { x, y } = target
      gesture.onupdate = (dx, dy) => {
        target.x = range(Number((x + dx * 2 / 3).toFixed(2)), 0, 100)
        target.y = Number((y + dy * 2 / 3).toFixed(2))
      }
    },
    onclickrect (e) {
      const { x, y } = e.target.getBoundingClientRect()
      const { clientX, clientY } = e
      const point = {
        x: (clientX - x) * 10 / 13,
        y: (clientY - y - 70) * 10 / 13 + 4
      }
      const d1 = distance(this.p1, point)
      const d2 = distance(this.p2, point)
      if (d1 > d2) {
        this.p2 = { ...point }
      } else {
        this.p1 = { ...point }
      }
    },
    onselect (idx) {
      if (idx !== undefined) {
        this.idx = idx
      }

      const maxlen = presets.length - 1
      if (this.idx < 0) {
        this.idx = maxlen
      } else if (this.idx > maxlen) {
        this.idx = 0
      }

      const item = presets[this.idx]
      this.name = item.name
      this.update(item.value)
    },
    update (value) {
      const [x1, y1, x2, y2] = value.split(',')
      this.p1.x = x1 * 100
      this.p1.y = 100 - y1 * 100
      this.p2.x = x2 * 100
      this.p2.y = 100 - y2 * 100
    }
  }
}
</script>

<style lang="scss" scoped>
.bezier {
  position: relative;
  width: 260px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
  font-size: 15px;
  color: #444;
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
  font-weight: 500;
  transition: ease;
  user-select: none;
  box-sizing: border-box;
}

.preview {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 10px;
  box-sizing: content-box;
  overflow: hidden;
  height: 12px;

  canvas {
    position: absolute;
    top: 0;
    left: 0;
  }

  .box {
    position: relative;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #000;
    animation: 1.2s linear forwards;
    opacity: .1;
    z-index: 1;

    &.animated {
      animation-name: move;
    }
  }
}

@keyframes move {
  0% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
  98% {
    transform: translate3d(220px, 0 , 0);
    opacity: 1;
  }
  100% {
    transform: translate3d(220px, 0, 0);
    opacity: .1;
  }
}

.example {
  position: absolute;
  top: 90px;
  left: 16px;
  text-align: left;
  font-size: 13px;
  color: #ccc;

  > div {
    margin-bottom: 12px;
    width: 40px;
    height: 40px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-size: contain;
    background-repeat: no-repeat;
  }

  .ease {
    background-image: url("data:image/png;base64,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92wAAHADaASAGABgtwMcaQew9ANQWwEQDQBxfoA6Oyuff0ZBurPTuBdFAoD/pFC8MwQgtgF8kygUYzsVim91ANg9gPb88d0dAICgAdDI7BGuyeuvoK+Af4l/ALMLExta89+0AAAACXBIWXMAABYlAAAWJQFJUiTwAAAFTGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIzMDAiIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSIzMDAiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTA2LTE2VDIwOjM2OjA4KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0wNi0xNlQyMDozNzoyMiswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0wNi0xNlQyMDozNzoyMiswODowMCIgZGM6Zm9ybWF0PSJpbWFn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");
  }

  .easein {
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAKwmlDQ1BEaXNwbGF5AABIiZWWd1RTeRbH73svjZDQEhCQEmoognQCSA0tFEE62AhJgFBCCAkqdkUcwbEgIoJlREZFFBwLIDZEFAuDYMHuBBlU1HGwYEPN/sESZnb37J6957zzPuf77u977/2d98cFoHziisU5qAZArkgqiQkJYCQlpzCIvwMCZNAAO2BxeQVi/+joCACAifff40M/IAAAN+24YnHOv3//r6HJFxTwAJBoAEjjF/ByAZDjAIicJ5ZIAbAKADBbIBVLAbBWAKBLkpJTALBuAKBnjLMcAOhp4/weAOiSuBg2AI4EQKJwuZIMAAodABiFvAwpAMUFABxEfKEIgMIHAB9eJpcPQKkDgGm5uXl8AEovAFil/cUn42+eaUpPLjdDyeOzAAAAKVBYIM7hLvo/r+N/R26ObKKGJQBQMiWhMQBAAkDuZueFK1mUNjNqgoX88Z4AkLuZstD4CeYVsFMmmM8NDFeezZkZMcHpwmCO0kfKiZtgQUFQ7ARL8mKUtdIlbP8J5kom68qy45V6poCj9C/KjEuc4EJhwswJLsiODZ/MYSt1iSxG2b9AFBIwWTdYOXtuwV/mFXKUZ6WZcaHK2bmT/QtE/pOeBUnK3viCwKDJnHhlvlgaoKwlzolW5gtyQpR6QWGs8qxUEjeZL41W3mEWNyx6gkEIkcAFnlSwUAoAwM4TL5IIMzKlDH+xOEfA4Ih49tMYTg5ODgBJySmM8V/gnQ4gAIDoXJ3UVj8B8L6lUChOTWrhXgBH5wGQOyc1ZiuAeg/A5cM8maRwXMMBAOCBDOpABz0wAjOwAjtwAjfwAj8IgjCIgjhIhnnAg0zIBQksgCWwEkqgDDbBVqiG3bAXDsBhOAotcBrOwyW4Br1wGx6AHIbgJYzABxhDEISIUBEaoocYIxaILeKEsBAfJAiJQGKQZCQVyUBEiAxZgqxGypBypBrZg9QjvyAnkfPIFaQPuYcMIMPIW+QLiqEUlI4aopbodJSF+qPhaBw6F81A89EitBjdgFahteghtBk9j15Db6Ny9CU6igGmiulgJpgdxsLYWBSWgqVjEmwZVopVYrVYI9aGdWE3MTn2CvuMI+BoOAbODueFC8XF43i4fNwy3HpcNe4ArhnXibuJG8CN4L7jqXgDvC3eE8/BJ+Ez8AvwJfhK/D78CfxF/G38EP4DgUDQITAJ7oRQQjIhi7CYsJ6wk9BEaCf0EQYJo0QiUY9oS/QmRhG5RCmxhLideIh4jniDOET8RFIlGZOcSMGkFJKItIpUSTpIOku6QXpGGlPRULFQ8VSJUuGrLFLZqFKn0qZyXWVIZYysSWaSvclx5CzySnIVuZF8kfyQ/E5VVdVU1UN1lqpQdYVqleoR1cuqA6qfKVoUGwqbMocio2yg7Ke0U+5R3lGpVEuqHzWFKqVuoNZTL1AfUz+p0dTs1ThqfLXlajVqzWo31F6rq6hbqPurz1MvUq9UP6Z+Xf2VhoqGpQZbg6uxTKNG46TGHY1RTZqmo2aUZq7mes2Dmlc0n2sRtSy1grT4WsVae7UuaA3SMJoZjU3j0VbT6mgXaUN0Ap1J59Cz6GX0w/Qe+oi2lraLdoL2Qu0a7TPach1Mx1KHo5Ojs1HnqE6/zpcphlP8pwimrJvSOOXGlI+6U3X9dAW6pbpNurd1v+gx9IL0svU267XoPdLH6dvoz9JfoL9L/6L+q6n0qV5TeVNLpx6det8ANbAxiDFYbLDXoNtg1NDIMMRQbLjd8ILhKyMdIz+jLKMKo7NGw8Y0Yx9joXGF8TnjFwxthj8jh1HF6GSMmBiYhJrITPaY9JiMmTJN401XmTaZPjIjm7HM0s0qzDrMRsyNzSPNl5g3mN+3ULFgWWRabLPosvhoybRMtFxr2WL5nKnL5DCLmA3Mh1ZUK1+rfKtaq1vWBGuWdbb1TuteG9TG1SbTpsbmui1q62YrtN1p2zcNP81jmmha7bQ7dhQ7f7tCuwa7AXsd+wj7VfYt9q+nm09Pmb55etf07w6uDjkOdQ4PHLUcwxxXObY5vnWyceI51TjdcqY6Bzsvd251fuNi6yJw2eVy15XmGum61rXD9Zubu5vErdFt2N3cPdV9h/sdFp0VzVrPuuyB9wjwWO5x2uOzp5un1POo559edl7ZXge9ns9gzhDMqJsx6G3qzfXe4y33Yfik+vzkI/c18eX61vo+8TPz4/vt83vmb+2f5X/I/3WAQ4Ak4ETAR7Yneym7PRALDAksDewJ0gqKD6oOehxsGpwR3BA8EuIasjikPRQfGh66OfQOx5DD49RzRsLcw5aGdYZTwmPDq8OfRNhESCLaItHIsMgtkQ9nWswUzWyJgihO1JaoR9HM6PzoU7MIs6Jn1cx6GuMYsySmK5YWOz/2YOyHuIC4jXEP4q3iZfEdCeoJcxLqEz4mBiaWJ8qTpictTbqWrJ8sTG5NIaYkpOxLGZ0dNHvr7KE5rnNK5vTPZc5dOPfKPP15OfPOzFefz51/LBWfmph6MPUrN4pbyx1N46TtSBvhsXnbeC/5fvwK/rDAW1AueJbunV6e/jzDO2NLxnCmb2Zl5ishW1gtfJMVmrU762N2VPb+bEVOYk5TLik3NfekSEuULerMM8pbmNcnthWXiOX5nvlb80ck4ZJ9BUjB3IJWKV0qlnbLrGRrZAOFPoU1hZ8WJCw4tlBzoWhh9yKbResWPSsKLvp5MW4xb3HHEpMlK5cMLPVfumcZsixtWcdys+XFy4dWhKw4sJK8Mnvlr6scVpWver86cXVbsWHxiuLBNSFrGkrUSiQld9Z6rd39A+4H4Q8965zXbV/3vZRferXMoayy7Ot63vqrPzr+WPWjYkP6hp6Nbht3bSJsEm3q3+y7+UC5ZnlR+eCWyC3NFYyK0or3W+dvvVLpUrl7G3mbbJu8KqKqdbv59k3bv1ZnVt+uCahp2mGwY92Ojzv5O2/s8tvVuNtwd9nuLz8Jf7q7J2RPc61lbeVewt7CvU/rEuq6fmb9XL9Pf1/Zvm/7RfvlB2IOdNa719cfNDi4sQFtkDUMH5pzqPdw4OHWRrvGPU06TWVH4IjsyItfUn/pPxp+tOMY61jjcYvjO07QTpQ2I82LmkdaMlvkrcmtfSfDTna0ebWdOGV/av9pk9M1Z7TPbDxLPlt8VnGu6Nxou7j91fmM84Md8zseXEi6cKtzVmfPxfCLly8FX7rQ5d917rL35dNXPK+cvMq62nLN7Vpzt2v3iV9dfz3R49bTfN39emuvR29b34y+szd8b5y/GXjz0i3OrWu3Z97u64/vv3tnzh35Xf7d5/dy7r25X3h/7MGKh/iHpY80HlU+Nnhc+5v1b01yN/mZgcCB7iexTx4M8gZf/l7w+9eh4qfUp5XPjJ/VP3d6fno4eLj3xewXQy/FL8delfyh+ceO11avj//p92f3SNLI0BvJG8Xb9e/03u1/7/K+YzR69PGH3A9jH0s/6X068Jn1uetL4pdnYwu+Er9WfbP+1vY9/PtDRa5CIeZKuAAAgAEAmp4O8HY/ADUZgNYLQJ49vkMDAAAyvvcDjO8g/5nH92wAAHADaASAGABgtwMcaQew9ANQWwEQDQBxfoA6Oyuff0ZBurPTuBdFAoD/pFC8MwQgtgF8kygUYzsVim91ANg9gPb88d0dAICgAdDI7BGuyeuvoK+Af4l/ALMLExta89+0AAAACXBIWXMAABYlAAAWJQFJUiTwAAAFTGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIzMDAiIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSIzMDAiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTA2LTE2VDIwOjM0OjM5KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0wNi0xNlQyMDozNzoxNSswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0wNi0xNlQyMDozNzoxNSswODowMCIgZGM6Zm9ybWF0PSJpbWFn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");
  }

  .easeout {
    background-image: url("data:image/png;base64,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92wAAHADaASAGABgtwMcaQew9ANQWwEQDQBxfoA6Oyuff0ZBurPTuBdFAoD/pFC8MwQgtgF8kygUYzsVim91ANg9gPb88d0dAICgAdDI7BGuyeuvoK+Af4l/ALMLExta89+0AAAACXBIWXMAABYlAAAWJQFJUiTwAAAFTGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIzMDAiIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSIzMDAiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTA2LTE2VDIwOjM0OjI2KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0wNi0xNlQyMDozNzowNyswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0wNi0xNlQyMDozNzowNyswODowMCIgZGM6Zm9ybWF0PSJpbWFn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");
  }
}

.panel {
  width: 260px;
  height: 260px;
}

.selector {
  padding: 0 18px 12px;
  display: flex;
  height: 40px;
  justify-content: space-between;
  box-sizing: border-box;
  align-items: center;
}

.bez-text {
  height: 40px;
  line-height: 28px;
  user-select: text;
  box-sizing: border-box;
  white-space: nowrap;
}

.arrow {
  position: relative;
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;

  &:active {
    background: #999;
    &::before,
    &::after {
      background: #fff;
    }
  }

  &.reverse {
    transform: scaleX(-1);
  }

  &::before,
  &::after {
    position: absolute;
    top: 0;
    left: 0;
    content: '';
    display: block;
    width: 8px;
    height: 2px;
    background: #000;
  }

  &::before {
    transform: translate(5px, 7px) rotate(-45deg);
  }

  &::after {
    transform: translate(5px, 11px) rotate(45deg);
  }
}
</style>