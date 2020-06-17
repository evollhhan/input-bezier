<template lang="pug">
  div#app
    input-bezier.component(
      lineStroke="#3F51B5"
      v-model="value"
    )
    p {{ value }}
</template>

<script>
import InputBezier from './bezier'

export default {
  name: 'App',
  components: {
    InputBezier
  },
  data () {
    return {
      value: ''
    }
  }
}
</script>

<style>
body,
html {
  margin: 0;
  background: #eee;
  overflow: hidden;
}

#app {
  margin-top: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.component {
  margin-bottom: 40px;
}
</style>
