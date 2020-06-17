# Input Bezier

A vue component to generate cubic bezier value.

![](https://ftp.bmp.ovh/imgs/2020/06/61a58378f44e212d.gif)

## usage

```html
<!-- the value will be 'cubic-bezier(0, 0, 1, 1)' -->
<input-bezier
  v-model="value"
  :lineStroke="'#f33'"
  :ballStroke="'#f33'"
  :ballFill="'#f33"
>
```

## option

```typescript
interface InputBezierOption {
  lineStroke: string;
  ballStroke: string;
  ballFill: string;
}
```