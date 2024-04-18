<template lang="pug">
.comments-area
  //- CommentSubmit(:id="id" @push-comment="pushComment")
  em.stats(v-if='count')
    | 共{{ count || comments.length || 0 }}条评论
  p(v-if="!comments.length && !loading") 还没有人发表评论呢~
  ul.comments-list(v-if="comments.length")
    .comments-item(v-for="item in comments")
      comment(:comment="item")
      .reply-area
        a.button(v-if="item.hasReplies && !qShowMap[item.id]" @click="queryReply(item.id)")
          | {{ qLoadingMap[item.id] ? '加载中' : '查看回复' }}
        ul.comments-list(v-if="qShowMap[item.id]")
          .comments-item(v-for="qItem in qComments[item.id]")
            comment(:comment="qItem" :author-id="item.userId" :parent-user-name="item.userName")
    .show-more.align-center
      a.button(
        v-if="comments.length && hasNext"
        @click="async () => await init(id)"
      )
        | {{ loading ? '正在加载' : '查看更多' }}
        | &nbsp;
        fa(
          :icon="loading ? 'spinner' : 'plus'"
          :spin="loading")
  .align-center(v-if="!comments.length && loading")
    //- placeholder
    fa(icon="spinner" :spin="loading")
</template>

<script lang="ts" setup>
import axios from 'axios'
import Mint from 'mint-filter'
import uniqBy from 'lodash/uniqBy'
import { onMounted, ref } from 'vue'
import { API_BASE } from '../../config'

import Comment from './Comment.vue'
// import Placeholder from '../Placeholder.vue'
import type { Comments } from '../../types'
import { getCache, setCache } from '../../utils/siteCache'
import { useRoute } from 'vue-router'

const route = useRoute()
const isNovel = route.query.novel == '1'
const ajaxPart = isNovel ? 'novels' : 'illusts'

const loading = ref(false)
const comments = ref<Comments[]>([])
const offset = ref(0)
const hasNext = ref(false)

const props = defineProps<{
  id: string
  count: number
  limit?: number
}>()


let mint: Mint
async function init(id: string | number): Promise<void> {
  if (loading.value) return

  try {
    loading.value = true
    if (!mint) {
      let filterWords = await getCache('s.filter.words')
      if (!filterWords) {
        const res = await axios.get<string>('https://kwc.cocomi.eu.org/https://cdn.jsdelivr.net/npm/@dragon-fish/sensitive-words-filter@2.0.1/lib/words.txt')
        filterWords = res.data.split(/\s+/)
        setCache('s.filter.words', filterWords, -1)
      }
      mint = new Mint(filterWords)
    }
    const { data } = await axios.get(
      `${API_BASE}/ajax/${ajaxPart}/comments/roots`,
      {
        params: {
          [isNovel ? 'novel_id' : 'illust_id']: id,
          limit: comments.value.length ? 30 : (props.limit ?? 3),
          offset: offset.value,
        },
      }
    )
    hasNext.value = data.hasNext
    const res = []
    for (let i = 0; i < data.comments.length; i++) {
      const element = data.comments[i];
      const text = element.userName + element.comment
      if (mint.verify(text)) {
        res.push(element)
      }
    }
    comments.value = uniqBy(comments.value.concat(res), 'id')
    offset.value += data.comments.length
  } catch (err) {
    console.warn('Comments fetch error', err)
  } finally {
    loading.value = false
  }
}

const qShowMap = ref<Record<string, boolean | undefined>>({})
const qLoadingMap = ref<Record<string, boolean | undefined>>({})
const qComments = ref<Record<string, Comments[]>>({})
async function queryReply(id: string | number): Promise<void> {
  if (qLoadingMap.value[id]) return
  try {
    qLoadingMap.value[id] = true
    const { data } = await axios.get(
      `${API_BASE}/ajax/${ajaxPart}/comments/replies`,
      {
        params: {
          comment_id: id,
          page: 1,
        },
      }
    )
    const res = []
    for (let i = 0; i < data.comments.length; i++) {
      const element = data.comments[i];
      const text = element.userName + element.comment
      if (mint.verify(text)) {
        res.push(element)
      }
    }
    // qComments.value[id] = uniqBy((qComments.value[id] || []).concat(res), 'id')
    qComments.value[id] = uniqBy(res, 'id')
    qShowMap.value[id] = true
  } catch (err) {
    console.warn('Comments fetch error', err)
  } finally {
    qLoadingMap.value[id] = false
  }
}

function pushComment(data: any) {
  console.log(data)
  comments.value.unshift(data)
}

onMounted(async () => {
  if (!props.id) return console.info('Component CommentsArea missing param: id')
  await init(props.id)
})
</script>

<style scoped lang="sass">

.comments-list
  list-style: none
  padding-left: 0

.reply-area
  margin: 10px 0 20px 50px
</style>
