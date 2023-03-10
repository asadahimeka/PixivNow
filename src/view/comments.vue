<template lang="pug">
#artwork-view
  section.illust-container
    #top-area
      .body-inner
        card.comments(title='评论')
          comments-area(
            v-if="showComments"
            :id='id',
            :count='0'
            :limit="10"
          )
</template>

<script lang="ts" setup>
import Card from '../components/Card.vue';
import CommentsArea from '../components/Comment/CommentsArea.vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import { ref, nextTick } from 'vue';

const route = useRoute()
const id = ref(route.params.id as string)
const showComments = ref(true)

onBeforeRouteUpdate(to => {
  showComments.value = false
  id.value = to.params.id as string
  nextTick(() => {
    showComments.value = true
  })
})
</script>

<style lang="sass">
[data-route="Comments"]
  header, footer, aside, .show-more svg, #nprogress
    display: none
  main
    padding-top: 0
  .show-more a
    margin-top: 2rem
    padding-left: 1rem
  .body-inner
    width: 100%
    max-width: unset
    padding: 0 1rem
</style>
