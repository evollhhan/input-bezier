# Input Bezier

A Chrome-like vue component to generate cubic bezier value.

![](https://ftp.bmp.ovh/imgs/2020/06/61a58378f44e212d.gif)

## usage

```
npm i --save input-bezier
```

```html
<!-- the value will be 'cubic-bezier(0, 0, 1, 1)' -->
<template>
  <input-bezier
    v-model="value"
    :lineStroke="'#f33'"
    :ballStroke="'#f33'"
    :ballFill="'#f33"
  >
</template>

<script>
import inputBezier from 'input-bezier'
export default {
  components: {
    inputBezier
  },
  data () {
    return {
      value: ''
    }
  }
}
</script>
```

## option

```typescript
interface InputBezierOption {
  lineStroke: string;
  ballStroke: string;
  ballFill: string;
}
```