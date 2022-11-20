<template lang="pug">
#ranking-view
  .body-inner
    //- Error
    section(v-if='error')
      h1 排行榜加载失败
      error-page(title='出大问题', :description='error')

    //- Loading
    section(v-if='loading')
      h1 排行榜加载中……
      .loading
        placeholder

    template(v-else)
      //- Result
      section(v-if='list?.contents.length')
        h1 {{ rankDateText(list.date) }}排行榜
        artwork-large-list(:rank-list='list.contents')
      section(v-else)
        h1 {{ rankDateText(list.date) }}
        error-page(title='暂无数据', description='')

</template>

<script lang="ts" setup>
import { API_BASE } from '../config'

import ArtworkLargeList from '../components/ArtworksList/ArtworkLargeList.vue'
import ErrorPage from '../components/ErrorPage.vue'
import Placeholder from '../components/Placeholder.vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { ArtworkRank } from '../types'
import { getCache, setCache } from '../utils/siteCache'
import { getJSON } from '../utils/fetch'
import subDays from 'date-fns/subDays'
import formatDate from 'date-fns/format'
import parseDate from 'date-fns/parse'

const today = new Date()
const defQueryDate = subDays(new Date(), today.getHours() > 14 ? 1 : 2)
const defQueryDateString = formatDate(defQueryDate ,'yyyyMMdd')
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

function rankDateText(date: Date | string) {
  if (!(date instanceof Date)) date = new Date(date)
  try {
    return formatDate(date, 'yyyy年MM月dd日')
  } catch (error) {
    return ''
  }
}

async function init(): Promise<void> {
  try {
    loading.value = true
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
      setCache(dbKey, listValue)
    } else {
      list.value = {
        date: parseDate(date as string, 'yyyyMMdd', new Date()),
        contents: []
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = '哎呀，出错了！'
    }
  } finally {
    loading.value = false
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
</style>
