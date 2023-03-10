<template lang="pug">
#artwork-view
  section.illust-container
    #top-area
      .body-inner
        card.comments(title='评论')
          comments-area(
            :id='id',
            :count='0'
            :limit="10"
          )
</template>

<script lang="ts" setup>
import Card from '../components/Card.vue';
import CommentsArea from '../components/Comment/CommentsArea.vue'
import { useRoute } from 'vue-router';

const route = useRoute()
const id = route.params.id as string
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
