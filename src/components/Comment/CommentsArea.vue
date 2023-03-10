<template lang="pug">
.comments-area
  //- CommentSubmit(:id="id" @push-comment="pushComment")
  em.stats(v-if='count')
    | 共{{ count || comments.length || 0 }}条评论
  p(v-if="!comments.length && !loading") 还没有人发表评论呢~
  ul.comments-list(v-if="comments.length")
    comment(v-for="item in comments" :comment="item")
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
    placeholder
</template>

<script lang="ts" setup>
import axios from 'axios'
import Mint from 'mint-filter'
import { onMounted, ref } from 'vue'
import { API_BASE } from '../../config'

import Comment from './Comment.vue'
import Placeholder from '../Placeholder.vue'
import type { Comments } from '../../types'

const loading = ref(false)
const comments = ref<Comments[]>([])
const hasNext = ref(false)

const props = defineProps<{
  id: string
  count: number
  limit?: number
}>()

async function init(id: string | number): Promise<void> {
  if (loading.value) return

  try {
    loading.value = true
    const { data: filterWords } = await axios.get<string>('https://unpkg.com/@dragon-fish/sensitive-words-filter@2.0.1/lib/words.txt')
    const mint = new Mint(filterWords.split(/\s+/))
    const { data } = await axios.get(
      `${API_BASE}/ajax/illusts/comments/roots`,
      {
        params: {
          illust_id: id,
          limit: comments.value.length ? 30 : (props.limit ?? 3),
          offset: comments.value.length,
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
    comments.value = comments.value.concat(res)
  } catch (err) {
    console.warn('Comments fetch error', err)
  } finally {
    loading.value = false
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
</style>
