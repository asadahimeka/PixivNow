<template lang="pug">
card.author-card(title='')
  .flex-center
    .left
      router-link(:to="'/users/' + user.userId")
        img(:src="resolveSrc(user.imageBig)" alt="")
    .right
      .flex
        h4
          router-link(:to="'/users/' + user.userId") {{ user.name }}
        //- button
        //-   | 关注&nbsp;
        //-   fa(icon="plus")
      p.description.pre {{ user.comment }}

  artwork-list.inline.tiny(:list="user.illusts")
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import ArtworkList from '../components/ArtworksList/ArtworkList.vue'
import Card from './Card.vue'

import type { User } from '../types'
import { resolveSrc } from '../config';

const props = defineProps<{
  user: User
}>()
const API = ref('https://pixiv.cocomi.eu.org')
</script>

<style scoped lang="sass">

.left
  margin-right: 1rem

  img
    border-radius: 50%
    width: 80px
    height: 80px

.right
  flex: 1
  max-width: calc(100% - 80px - 1rem)

  h4
    margin: 0.2rem 0
    flex: 1
    font-weight: 600

  button
    background-color: #efefef
    color: var(--theme-text-color)
    padding: 0.2rem 1rem
    border-radius: 1rem

.description
  width: 100%
  max-height: 80px
  overflow: auto
</style>
