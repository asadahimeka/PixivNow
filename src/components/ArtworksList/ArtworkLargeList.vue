<template lang="pug">
div.artwork-large-list
  artwork-large-card(v-for="(item) in artworks" :key="item[0].id" :illust="item[0]" :rank="item[1]")
</template>

<script lang="ts" setup>
import ArtworkLargeCard from './ArtworkLargeCard.vue'
import type { ArtworkInfo, ArtworkRank } from '../../types'
import { computed } from 'vue'

const props = defineProps<{
  rankList?: ArtworkRank[]
  artworkList?: ArtworkInfo[]
}>()
const artworks = computed(() => {
  if (props.rankList) {
    return convertRankToInfo(props.rankList)
  } else if (props.artworkList) {
    return props.artworkList.map((item) => {
      return [item, 0] as [ArtworkInfo, number]
    })
  } else {
    return []
  }
})

function convertRankToInfo(rankInfo: ArtworkRank[]): [ArtworkInfo, number][] {
  return rankInfo.map((item) => {
    return [
      {
        id: item.illust_id.toString(),
        title: item.title,
        description: '',
        createDate: item.date,
        updateDate: item.date,
        illustType: 0,
        restrict: 0,
        xRestrict: item.illust_content_type.sexual,
        sl: 2,
        userId: item.user_id.toString(),
        userName: item.user_name,
        alt: item.title,
        width: item.width,
        height: item.height,
        pageCount: +item.illust_page_count,
        isBookmarkable: true,
        bookmarkData: null,
        titleCaptionTranslation: {
          workTitle: null,
          workCaption: null,
        },
        isUnlisted: false,
        url: item.url,
        tags: item.tags,
        profileImageUrl: item.profile_img,
        type: 'illust',
      } as ArtworkInfo,
      item.rank,
    ]
  })
}
</script>

<style lang="sass">

.artwork-large-list
  display: flex
  justify-content: center
  flex-wrap: wrap
  padding-left: 0
  gap: 8px

  &.inline
    padding: 1rem
    flex-wrap: nowrap
    overflow-y: auto
    justify-content: left

    .artwork-large-card
      height: 500px
      // overflow-x: auto
</style>
