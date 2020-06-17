<template lang="pug">
  div#app
    input-bezier(
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
