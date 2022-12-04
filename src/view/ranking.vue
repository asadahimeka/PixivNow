<template lang="pug">
mixin selects()
  .sels
    input.sel-date(:value="fmtInputDate(list?.date)" type="date" @change="onDateChange")

    select.sel-mode(@change="onModeChange")
      option(
        v-for="mode in modes"
        :selected="mode == route.query.mode"
        :key="mode"
        :value="mode") {{ mode }}

#ranking-view
  .body-inner
    //- Error
    section(v-if='error')
      h1
       span 排行榜加载失败
       +selects()
      error-page(title='出大问题', :description='error')

    //- Loading
    section(v-else-if='loading')
      h1 排行榜加载中……
      .loading
        placeholder

    template(v-else)
      //- Result
      section(v-if='list?.contents.length')
        h1.rank-title
          span {{ rankDateText(list?.date) }}排行榜
          +selects()
        artwork-large-list(:rank-list='list.contents')
      section(v-else)
        h1
          span {{ rankDateText(list?.date) }}
          +selects()
        error-page(title='暂无数据', description='')

      show-more(
        v-if='list?.contents.length',
        :text='loading ? "加载中" : "下一页"',
        :method='loadMore',
        :loading='loading'
      )

</template>

<script lang="ts" setup>
import { API_BASE } from '../config'

import ArtworkLargeList from '../components/ArtworksList/ArtworkLargeList.vue'
import ErrorPage from '../components/ErrorPage.vue'
import Placeholder from '../components/Placeholder.vue'
import ShowMore from '../components/ShowMore.vue';
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ArtworkRank } from '../types'
import { getCache, setCache } from '../utils/siteCache'
import { getJSON } from '../utils/fetch'
import subDays from 'date-fns/subDays'
import formatDate from 'date-fns/format'
import parseDate from 'date-fns/parse'
import debounce from 'lodash/debounce'

const defQueryDate = subDays(new Date(), new Date().getHours() > 14 ? 1 : 2)
const defQueryDateString = formatDate(defQueryDate, 'yyyyMMdd')
const error = ref('')
const loading = ref(true)
const list = ref<{
  date: Date
  contents: ArtworkRank[]
}>({
  date: defQueryDate,
  contents: []
})
const route = useRoute()
const router = useRouter()

function rankDateText(date: Date | string) {
  if (!(date instanceof Date)) date = new Date(date)
  try {
    return formatDate(date, 'yyyy年MM月dd日')
  } catch (error) {
    return ''
  }
}

function fmtInputDate(date: Date | string) {
  if (!(date instanceof Date)) date = new Date(date)
  try {
    return formatDate(date, 'yyyy-MM-dd')
  } catch (error) {
    return ''
  }
}

function pushRoute(query: Record<string, any>) {
  router.push({
    name: 'ranking',
    query: {
      ...route.query,
      ...query
    }
  })
}

function loadMore() {
  const { p = '1' } = route.query
  pushRoute({ p: Number(p) + 1 })
}

const onDateChange = debounce(function (ev: Event) {
  const { value } = ev.target as HTMLInputElement
  const date = formatDate(new Date(value), 'yyyyMMdd')
  pushRoute({ date, p: 1 })
}, 500)

const modes = ref([
  'daily',
  'weekly',
  'monthly',
  'rookie',
  'male',
  'female',
  'daily_ai',
])

function onModeChange(ev: Event) {
  let { value: mode } = ev.target as HTMLSelectElement
  if (!mode) mode = 'daily'
  pushRoute({ mode, p: 1 })
}

watch(() => route.query, () => {
  if (route.name !== 'ranking') return
  init()
})

async function init(): Promise<void> {
  try {
    loading.value = true
    error.value = ''
    const { p = '1', mode = 'daily', date = defQueryDateString } = route.query
    const dbKey = `ranking.${mode}.${date}.${p}`
    const cacheData = await getCache(dbKey)
    if (cacheData) {
      list.value = cacheData
      loading.value = false
      return
    }
    const searchParams = new URLSearchParams()
    if (p && typeof p === 'string') searchParams.append('p', p)
    if (mode && typeof mode === 'string') searchParams.append('mode', mode)
    if (date && typeof date === 'string') searchParams.append('date', date)
    searchParams.append('format', 'json')
    const data: {
      date: string
      contents: ArtworkRank[]
    } = await getJSON(`${API_BASE}/ranking.php?${searchParams.toString()}`)

    if (data?.contents?.length) {
      const listValue = {
        date: parseDate(data.date, 'yyyyMMdd', new Date()),
        contents: data.contents,
      }
      list.value = listValue
      loading.value = false
      setCache(dbKey, listValue)
    } else {
      list.value = {
        date: parseDate(date as string, 'yyyyMMdd', new Date()),
        contents: []
      }
      loading.value = false
    }
  } catch (err) {
    loading.value = false
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = '哎呀，出错了！'
    }
  }
}

onMounted(async () => {
  document.title = 'Ranking | PixvNow'
  await init()
})
</script>

<style scoped lang="sass">

.loading
  text-align: center

h1
  position: relative

.sels
  position: absolute
  right: 0
  top: 50%
  transform: translateY(-50%)
  display: flex
  justify-content: center
  align-items: center
.sel-date,.sel-mode
  height: 32px
  padding: 5px 10px
  font-size: 13px
  background-image: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)
  border: none
  border-radius: 6px
.sel-date
  margin-right: 10px
  padding: 5px

</style>
