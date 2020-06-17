<template lang="pug">
  div#app
    input-bezier
</template>

<script>
import InputBezier from './bezier'

export default {
  name: 'App',
  components: {
    InputBezier
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
