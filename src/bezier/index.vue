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
      p1: { x: 0, y: 100 },
      p2: { x: 100, y: 0 },
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
    this.init()
    this.preview = new Preview(this.$refs.cvs, this.lineStroke)
  },
  methods: {
    onanimationstart () {
      if (this.itv) {
        clearInterval(this.itv)
      }
      const { box, cvs } = this.$refs
      const sx = cvs.getBoundingClientRect().x
      this.preview.clear()
      this.preview.drawPoint(16)
      this.itv = setInterval(() => {
        const { x } = box.getBoundingClientRect()
        this.preview.drawPoint(x - sx)
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
    },
    init () {
      if (this.value) {
        // 获得例如 0,0,1,1 这样的序列后做匹配
        const res = this.value.match(/-?\d\.?\d?\d?/g).map(v => v.trim().replace('0.', '.')).join(',')
        const idx = presets.findIndex(item => item.value === res)
        if (idx > -1) {
          this.onselect(idx)
        } else {
          this.update(res)
        }
      } else {
        this.onselect()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.bezier {
  position: relative;
  width: 260px;
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
  box-shadow: 0 0 4px #ccc;
  background: #fff;
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
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAACLlBMVEX///////8AAAD////w8PD+/v7o6OhGRkbx8fH8/Pzr6+v29vbs7OwxMTEdHR2jo6MRERGTk5M6OjqWlpYDAwOqqqrc3Nzp6elycnL6+vpKSkr09PQEBAQLCwuZmZlfX1/5+fkgICDExMRjY2Pa2tqHh4cBAQEiIiLt7e2SkpLz8/NhYWEMDAxFRUW9vb0FBQUUFBTy8vLq6urCwsI7OzukpKQTExNzc3MhISHj4+PV1dXY2NiysrI2NjaXl5epqanT09MtLS2vr69PT08yMjJbW1tAQED19fUwMDC7u7sbGxtEREQSEhI4ODjOzs7u7u4/Pz8VFRWRkZH4+Ph8fHzk5OSsrKxeXl62trYICAiCgoKampqDg4OIiIj9/f1RUVHMzMxubm7v7+8QEBCVlZWMjIzLy8uEhIRMTEwYGBhUVFR1dXUsLCxOTk6BgYGYmJizs7M5OTmcnJzZ2dmgoKAaGhpSUlKOjo6bm5uJiYnf39/n5+d6enouLi5ra2tlZWVgYGAjIyNWVla4uLi+vr6/v78oKCgfHx+5ublaWlq0tLQJCQkkJCSNjY2rq6txcXE3Nzd7e3t+fn6Kiord3d1XV1fAwMB0dHTDw8MvLy8KCgq3t7ceHh7S0tJmZmbKysre3t61tbWioqKPj492dnbR0dG6urpvb28XFxfFxcXm5uaUlJSlpaX39/eGhoZ/f3/Q0NDX19f7+/toaGgzMzNHR0fi4uLIyMjPz8+tra398PFDAAAAAnRSTlPw4iwrr9EAAAMNSURBVHhe1dpVb1xLEARg35plNDMzMzOzg8zMzMzMcJGZmeHfJbtK4liWXCuVz0qpl3n8ND09T90xb8RYnWeEiUJiuKIbcyEO65Gk+NGpVIuRHxO7k8cG0y1FHJOfho7xU1Yicc7w8eYi47JFmoww4Dta3bRu5YCz8f2SQOf8Iq600PWvn9y1G9OpPRRRuY4fMZHm66JhAEg8fGLZF2OFDttSTwp/+MyE5G8ifvjvvwoAKLl0rN39ArVnRNTC/ghbePm6xQA2Bpe/yi78wT6Pn3HTRQAFq7zGzDamESnvDAOX415WZrahI4VvA1VXjZnDUBFbC7Ao3xBDQ5JWo7XfEENDvBVAgiGGiFQvhrONGCpyACgzxBAR9x7sayeGipT6sd9ODBX5rRmphhgq8i/wJTFkZBPQTwwZ+Q/oJIaM9Bbjf2LIyD+r0UMMHSlBkBg6MoFfiKEjDzFEDB3pRhcxdKQDd8uJoSOtuEYMHSlACzF0ZAX6iKEjdYloI4aObEQ2MXTkQ/iJoSP2WHxGDB35BMuIoSMf4yNm6Mgo3iOGjjxAOjN0JBYpxNCRJ3hMDB3xIJYZOpKDJGLoiAc3maEjK3GLGDpSj3vM0JEc3CGGjtRjnBk6UoAmYuhIKZqZoSObcZAYOlKHSmboyBpsZ4aOZCGXGDoSxAVm6EgezhJDR/KRzgwdacQCYujIGZxnho7kYBUxdMSFWmboyE4kMENHsjLdxNCRIPYyQ0cC8BFDRxpwhRk6MoVCYujIW3jEDB0ZQj4xdMSGPGboyLtYQQwdycUkM3SkCGuJoSMbaiqNlxgychpLjIMYKuKuyRrJ3WCsRdbgnHFbPMUeKS72WT7FrkCR5VPsXgRmTrGzLUBuoGHGgHm9c/6RJbj9XCursgpZgA+Whom08o6tO8LlWjvfSGksPg93mMex0GybY4qtIIP41Zi0LY4UV+gz9sT7LWjhCQyYnz0On9e6lZI//kaXyQhdgkRAfu/DXzbjJYCEtH0L/JlGABXJw3c/EUBHsu+7o7Kw9PojJgqJyjrcU2i8D8sMG4iDAAAAAElFTkSuQmCC");
  }

  .easein {
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAACK1BMVEX///////8AAAD///+NjY3i4uIICAi6urpLS0sSEhIdHR1BQUExMTH19fVKSkqIiIhubm7t7e0hISH+/v7u7u7m5ub29vabm5tDQ0PDw8Po6Oh8fHyoqKg5OTk9PT2lpaWYmJhISEje3t5gYGDw8PDr6+vp6en39/cwMDDj4+Ozs7N2dnYJCQkpKSlGRkb4+PjV1dWTk5NsbGzX19e0tLSvr6+VlZX8/Pzf39/ExMS/v7+7u7v09PQFBQWenp6EhIRVVVUiIiLW1tbs7Ow4ODiysrI6OjqZmZnh4eEMDAwnJyf7+/vFxcXY2NjQ0NAQEBAkJCS5ubnn5+fNzc0ZGRmBgYHz8/MODg5kZGRPT0/g4OAbGxvy8vJycnIyMjJvb2/KysoCAgKtra1dXV0LCwuJiYkcHBzc3NxERET9/f15eXmMjIzMzMwaGhqAgIBtbW2Ojo5MTEx6enoYGBiurq47OztHR0c2NjawsLBTU1OqqqpXV1eUlJQDAwNFRUXx8fGGhoakpKSPj4+ampra2tqXl5cKCgpRUVFUVFQNDQ2Li4unp6esrKzl5eUPDw+KiootLS1fX1/CwsJbW1upqanLy8v6+vpCQkK2trYqKip3d3efn59ra2s8PDzS0tLIyMiHh4cHBwcRERGhoaF0dHTv7++WlpZ1dXUrKyudnZ2cnJzR0dGDg4MBAQHZ2dlmZma9vb2xsbEgICAlJSUjIyPHx8d4eHhpaWkWFhajcrKwAAAAAnRSTlPw4iwrr9EAAAMGSURBVHhe1drDsiZoEIThM5k/cWzbttG2bdsc27Ztm5c3E/8yo1d98uuIeW/giaiqZeXclRO6/wiGjzmiBDGCIlXhkftWdiw/EBh54MEnT00fzAuKVCUPk+S+VSGRwb6sld/3v0eq9n2UHdfjIRF+lazfEA+8eH6HTR+GPuGmH2OtLWRIJJd78C0ZFCnkFnzDsEjhTv6Dn8IihW38G38xKFJSym1IURC7wSL8KYjbKOYONFMQu7EXu9YJYjeYwa8UxG5EsIeKuI0oYjNuRA1mcJ1uRI0InqYbUSOKnlw3ogYzuIduRI0I7qUbUSOKp9rdiBrMYAXdiBrPYYFuRI2leLbfjajBIvxCN6LGzzhEN6LGCHrpRtR4eBZNbkQNprGKbkSNx5CgG1FjKdaUGRE15HotiBpyvUZEjRq8QjeiRhPwohtRg2vRRTeixqvophtRYw61dCNqDCO2042oUZzCJM2IGnwG+XQjagwiQTeixiSujbsRNUqPYIBmRA324ijdiBpXUE03osZVJOhG1KjH5mI3osZ5YIJmRI3SGOI0I2q8tRbnaEbUYC0K6EbUeB0VdCNqvId3x92IGg3Y1UozosYIsJFmRI1K4B2aETW2ATU0I2psmEU5zYga0U2I0Iyo0bodO2hG1GjZjC9oRtQo+R0FNCNqLPtDDAOiRttvYhgQNbamxDAgauzdLoYBUWP9GnxNM6LGG8AnNCNqzAPv04yoMQTE6UXUyG1E8mN6ETU2LkFdG72IGs8DH5BeRI2zQAO9iBpP1OHCenoRNcaAYzO0ImpM3AQeJZ2IGmdOAI2dtCJqvJDC8TnSiagx9TZwqYVORI0VK4H0m9S6IpWLRkq2ZoXVl3uBuji1zoPLKzoS7YbFr67JA5CepsbcoiGy7O6HFoPs39JQXp33EoDeRwZ4i+Zrs9aS+CKQCgBAT/ri1Dpy/zKtkKfzs8j93YtARqvH6keHs4vvv1Vsbs4iN8pDPiwNfFpJ8uWTZSERfp7c/cPCZ68Ffu/6fndjwZe8ve7IO9y/TyPdlm3IXX8AAAAASUVORK5CYII=");
  }

  .easeout {
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAACE1BMVEX////////////8/Pzo6OhoaGg5OTkyMjI7Ozu1tbU2NjbBwcHc3NyLi4sAAACmpqaGhoYnJye2trYXFxf29vY+Pj6YmJhAQECcnJzw8PDx8fH9/f3+/v6srKx3d3dNTU1CQkIsLCweHh6ysrL39/fy8vKurq5XV1cQEBATExOzs7OHh4fIyMhycnISEhILCwtHR0eDg4PZ2dna2tri4uLb29u6uro/Pz8CAgJnZ2fCwsL5+fk8PDw9PT0wMDChoaHu7u7m5ubp6em3t7f7+/t/f386Ojq/v78aGhoRERGfn5/4+PhkZGR1dXX19fUcHBwqKirHx8d2dnbr6+sYGBi+vr7Dw8NKSkr09PSXl5d6enpqamqoqKjPz8/s7OwuLi40NDTt7e3T09NRUVEBAQGTk5OlpaWpqamwsLC4uLjNzc2np6fY2NgFBQWamprj4+ONjY2BgYF0dHRDQ0NfX19mZmZGRkaJiYmtra0NDQ3JycnR0dHk5OQEBAS9vb0pKSmWlpZPT09BQUGxsbEfHx/d3d0bGxu8vLyMjIx5eXljY2Pl5eUvLy+vr69wcHAzMzMhISFVVVWZmZne3t60tLRvb28MDAzW1tZLS0uPj49sbGwdHR3Ly8ttbW3Kysp8fHyUlJTq6uoDAwPz8/P6+vrX19egoKAgICBJSUkGBgbQ0NArKyuioqIoKCiCgoKbm5tTU1PecWCPAAAAAnRSTlPi8KdmrkoAAALmSURBVHgBvNMDY2xXAATgzdlnzFNs27adlLFtq45ts+bfrD31zu1c8zu02Zwsj81m/ofYnKw3nP4rYr9lPXL7zt179y1GHtx7+OgxnliKPH323f75C2crERfX7w9u7saD4+lljPcjH18//4DAIGuQYGNCQsPC8X0iIh1Aov6iuaJjYoG4+ISgxKRkhzs+5Q87PjUNSM/I/P48SzCEs+8zkQPk5v1Qv/wCb8cnYyHdSvQDXIqM+dkgxOEUlwClZYYNIRJajopKw4YQqaoGXnqZDSXy8BW8+pphQ4mUAK8bNpRIjRtq69iQIvWxaGhkQ4o0Ac2GDSnSArSyIUWq3FDbxoYUae9AZxcbUqT7BXrsbEiR+l7EGDakSBHQx4YWeQ70k+EwQsYAGQ4jZPiQ4SjCxiAbWmQIiGRDi2QCbIiRYWCEDS0yOoZxNrTIRDgm2dAi7eWYYkOL2J9hmg0xMoNZNsTIHN5gQ4y8iQA2xMhbeLudDS3yDvAuG1rkvXkssKFFvBexxIYYWUYMG2KkBCtsiJFVrNnZ0CKjwDobWsS+gU02xMgKttgQI9vYYUOMFCGADTFyC9hlQ4zsYZ8NMXIbB2yIkX4csiFGkpDezoYW8T5CKhti5BjNbIiRE9xjQ4ycYsyTDTGyiDM2xMg55tgQIws4YkOMOF/gkg0xcoVrNsTICVbY0CA0etkQIDR62ZAh05hjQ4y0YYMNNbKGaDbESAxu2BAjw9hgQ428j2g2xMg5btgQIx9ggw0JQo0lNQj5EDdqg5CPsCE3CAlEtNog5GNUqw1C1hHurTYI2cN9tUHIJ1g2nlqDkE/x2edfiA1CZpBnbmkNQgaRYzy9jLVIBb40xcZCxPPkqzkcGG9jIdL3zZavaORbSdvFMdmgQY1VLcq0tERm9TIQa81qGRpakpggCWJJJiTS0BLvtXPAVeJab1rGSd9ycGOrj7arogzWrlu31oCWqQtErt+wYT0TDQFdlsMBAEzT525P2ODUAAAAAElFTkSuQmCC");
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