<template lang="pug">
aside.global-side-nav(:class='{ hidden: !sideNavStore.isOpen }')
  .backdrop(@click='closeSideNav')
  .inner
    .group
      .search-area
        search-box

    .list
      .group
        .title 导航
        ul
          list-link(icon='home', link='/', text='首页')
          //- list-link.not-allowed(icon='image', link='', text='插画')
          //- list-link(icon='user', link='', text='用户')
          list-link(icon='crown', link='/ranking', text='排行榜')

      //- .group
      //-   .title Pixiv 令牌
      //-   ul
      //-     list-link(
      //-       icon='fingerprint',
      //-       link='/login',
      //-       :text='userStore.isLoggedIn ? "查看令牌" : "设置令牌"'
      //-     )

      .group
        .title PixivNow
        ul
          list-link(
            icon='external-link-alt',
            externalLink='https://www.pixiv.net/',
            text='Pixiv.net'
          )
          list-link(
            icon='external-link-alt',
            externalLink='https://pixiv.js.org/',
            text='原版网站'
          )
          list-link(icon='heart', link='/about', text='关于')
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSideNavStore, useUserStore } from '../../states'

import SearchBox from '../SearchBox.vue'
import ListLink from './ListLink.vue'

const sideNavStore = useSideNavStore()
const userStore = useUserStore()
const router = useRouter()
router.afterEach(() => (sideNavStore.open = false))

sideNavStore.$subscribe((_mutation, state): void => {
  if (state.open) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'visible'
  }
})

function closeSideNav() {
  sideNavStore.open = false
}

onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSideNav()
  })
})
</script>

<style scoped lang="sass">

.global-side-nav
  z-index: 90

.backdrop
  position: fixed
  top: 0
  left: 0
  width: 100vw
  height: 100vh
  background-color: rgba(0, 0, 0, 0.1)
  z-index: 90

.inner
  position: fixed
  top: 0
  left: 0
  width: 240px
  max-width: 80vw
  padding-top: 50px
  height: 100vh
  background-color: #fff
  z-index: 95
  transition: all 0.5s

.side-nav-toggle
  font-size: 1.2rem
  text-align: center
  margin: auto 0.5rem
  color: var(--theme-border-color)
  cursor: pointer
  width: 2.4rem
  height: 2.4rem
  border-radius: 50%
  display: flex
  align-items: center
  background-color: rgba(0,0,0,0.05)

  [data-icon]
    margin: 0 auto

.list
  max-height: calc(100vh - 56px)
  overflow-x: auto

.group
  margin: 0.5rem 0

  .title
    user-select: none
    padding: 0 1.6rem
    margin: 1.6rem 0 0.4rem 0
    font-weight: 600
    font-size: 0.8rem
    color: #aaa

  ul
    margin: 0
    list-style: none
    padding-left: 0

// Top banner
.banner
  height: 50px
  padding: 0.4rem
  display: flex
  align-items: center

.siteLogo
  height: 2.2rem

// Hidden state
.hidden
  .inner
    left: -300px
  .backdrop
    display: none

.search-area
  display: block
  padding: 0 1.6rem
  .search-box
    box-shadow: 0 0 8px #ddd
    border-radius: 2em

@media screen and (min-width: 450px)
  .search-area
    display: none !important
</style>
