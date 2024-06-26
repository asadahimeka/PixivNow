<template lang="pug">
#home-view
  .top-slider.align-center(
    :style='{ "background-image": `url(${resolveSrc(randomBg.url)})` }'
  )
    section.search-area.flex-1
      search-box.big.search

    .site-logo
      img(:src='LogoH')
    .description Now, everyone can enjoy Pixiv!

    .bg-info
      a.pointer(
        style='margin-right: 0.5em',
        title='换一个~',
        @click='async () => await setRandomBgNoCache()'
      )
        fa(icon='random')
      a.pointer(
        v-if='randomBg.info.id',
        title='关于背景',
        @click='showBgInfo = true'
      )
        fa(icon='question-circle')

  modal.bg-info-modal(v-model:show='showBgInfo')
    h3 背景图片：{{ randomBg.info.title }}
    .align-center
      router-link.thumb(:to='"/artworks/" + randomBg.info.id')
        img(:src='resolveSrc(randomBg.url)' lazyload)
      .desc
        strong {{ randomBg.info.title }}
        | &ensp;&mdash;&ensp;
        router-link(:to='"/users/" + randomBg.info.userId') {{ randomBg.info.userName }}
        | 的作品 (ID: {{ randomBg.info.id }})

  //- .body-inner
  //-   section.discover
  //-     h2 探索发现
  //-     .align-center
  //-       a.button(@click='discoveryList.length ? (async () => await setDiscoveryNoCache())() : void 0')
  //-         | {{ discoveryList.length ? "换一批" : "加载中" }}
  //-         |
  //-         fa(
  //-           :icon='discoveryList.length ? "random" : "spinner"',
  //-           :spin='!discoveryList.length'
  //-         )
  //-     .align-center(v-if='!discoveryList.length')
  //-       placeholder
  //-     artwork-list(:list='discoveryList')
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import formatInTimeZone from 'date-fns-tz/formatInTimeZone'
import { API_BASE, resolveSrc } from '../config'
import { getCache, setCache } from '../utils/siteCache'

// import ArtworkList from '../components/ArtworksList/ArtworkList.vue'
import Modal from '../components/Modal.vue'
import SearchBox from '../components/SearchBox.vue'
// import Placeholder from '../components/Placeholder.vue'
import LogoH from '../assets/LogoH.png'
import type { ArtworkInfo, ArtworkInfoOrAd } from '../types'
import { getJSON } from '../utils/fetch'

const showBgInfo = ref(false)
const discoveryList = ref<ArtworkInfo[]>([])
const randomBg = ref<{
  url: string
  info: ArtworkInfo
}>({
  url: 'https://upload-bbs.miyoushe.com/upload/2023/03/04/190122060/c892850d22d95554d49ca4838ee7ef63_4567335272864834588.jpg',
  info: {} as ArtworkInfo,
})

async function setRandomBgNoCache(): Promise<void> {
  try {
    const data: { illusts: ArtworkInfo[] } = await getJSON(
      `${API_BASE}/ajax/illust/discovery?mode=safe&max=1`
      )
    const info = data.illusts.find((item) => item.id) as ArtworkInfo
    const middle = `img/${formatInTimeZone(
      info.updateDate,
      'Asia/Tokyo',
      'yyyy/MM/dd/HH/mm/ss'
    )}/${info.id}`
    const url = `/-/img-master/${middle}_p0_master1200.jpg`
    let img: HTMLImageElement | null = new Image()
    img.onload = () => {
      setTimeout(() => {
        randomBg.value.info = info
        randomBg.value.url = url
        img = null
      }, 200)
    }
    img.src = url
    setCache('home.randomBg', { info, url }, 3600)
  } catch (err) {
    console.log('err: ', err)
    randomBg.value.url = 'https://upload-bbs.miyoushe.com/upload/2023/03/04/190122060/c892850d22d95554d49ca4838ee7ef63_4567335272864834588.jpg'
  }
}

async function setRandomBgFromCache(): Promise<void> {
  const cache = await getCache('home.randomBg')
  if (cache) {
    randomBg.value = cache
  } else {
    await setRandomBgNoCache()
  }
}

async function setDiscoveryNoCache(): Promise<void> {
  try {
    discoveryList.value = []
    const data: { illusts: ArtworkInfoOrAd[] } = await getJSON(
      `${API_BASE}/ajax/illust/discovery?mode=all&max=8&_vercel_no_cache=1`
    )
    const illusts = data.illusts.filter((item) =>
      Object.keys(item).includes('id')
    ) as ArtworkInfo[]
    discoveryList.value = illusts
    setCache('home.discoveryList', illusts, 3600)
  } catch (err) {
    console.error('获取探索发现失败')
  }
}

async function setDiscoveryFromCache(): Promise<void> {
  const cache = await getCache('home.discoveryList')
  if (cache) {
    discoveryList.value = cache
  } else {
    await setDiscoveryNoCache()
  }
}

onMounted(async () => {
  document.title = 'PixivNow'
  // await setRandomBgFromCache()
  // await setDiscoveryFromCache()
})
</script>

<style lang="sass">

[data-route="home"]
  .top-slider
    min-height: calc(100vh + 1rem)
    margin-top: calc(-50px - 1rem)
    padding: 30px 10%
    background-position: center
    background-repeat: no-repeat
    background-size: cover
    background-attachment: fixed
    position: relative
    color: #fff
    text-shadow: 0 0 2px #222
    display: flex
    flex-direction: column

    .site-logo, .description
      transform: translateY(-1rem)

    &::before
      content: ''
      display: block
      position: absolute
      top: 0
      left: 0
      width: 100%
      height: 100%
      background-color: rgba(0, 0, 0, 0.2)
      pointer-events: none
      z-index: 0

    > *
      position: relative
      z-index: 1

    .bg-info
      position: absolute
      right: 1.5rem
      bottom: 1rem

      a
        --color: #fff

  .site-logo
    img
      height: 4rem
      width: auto

  .description
    font-size: 1.2rem

  .search-area
    display: flex
    align-items: center

    > *
      width: 100%

  .global-navbar
    background: none
    .search-area
      opacity: 0
      transition: opacity 0.4s ease
      pointer-events: none

    &.not-at-top
      background-color: var(--theme-accent-color)
      .search-area
        opacity: 1
        pointer-events: all

  .bg-info-modal
    h3
      margin-top: 0
    .thumb
      > *
        width: auto
        height: auto
        max-width: 100%
        max-height: 60vh
        border-radius: 8px
    .desc
      margin-top: 1rem
      font-size: 0.75rem
      font-style: italic
</style>
