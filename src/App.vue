<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <router-view />
  </div>
</template>

<script>
export default {
  data() {
    return {
      isDarkMode: false
    }
  },
  mounted() {
    // 检查深色模式设置
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      this.isDarkMode = true
    } else if (!savedTheme) {
      // 跟随系统
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }
}
</script>

<style>
/* App level styles are in global.css */
</style>
