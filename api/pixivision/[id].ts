import { VercelRequest, VercelResponse } from '@vercel/node'
import axios, { AxiosRequestConfig } from 'axios'
import { load } from 'cheerio'
import { handleError, isAccepted, setCorsHeader } from '../utils'

export default async (req: VercelRequest, res: VercelResponse) => {
  if (!isAccepted(req)) {
    return res.status(403).send('403 Forbidden')
  }
  const id = req.query.id as string
  if (!/^\d+$/g.test(id)) {
    return res.status(400).send({
      error: true,
      message: 'Invalid ID',
    })
  }

  setCorsHeader(req, res)

  const config: AxiosRequestConfig = {
    url: `https://www.pixivision.net/zh/a/${id}`,
    method: 'GET',
    timeout: 9000,
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      'dnt': '1',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.56',
    },
  }

  try {
    const htmlResp = await axios(config)
    const data: any = {}
    const $ = load(htmlResp.data)

    data.title = $('.am__title').text()
    data.cover = $('._article-illust-eyecatch img').attr('src')
    data.desc = $('._feature-article-body__article_thumbnail + ._feature-article-body__paragraph').text()

    data.items = $('.article-item._feature-article-body__pixiv_illust').map(function () {
      const $this = $(this)
      const $titleLink = $this.find('.am__work__title a')
      const $userLink = $this.find('.am__work__user-name a')
      return {
        title: $titleLink.text(),
        illust_id: $titleLink.attr('href')?.match(/(\d+)/)?.[1],
        illust_url: $this.find('.am__work__illust').attr('src'),
        user_id: $userLink.attr('href')?.match(/(\d+)/)?.[1],
        user_name: $userLink.text(),
        user_avatar: $this.find('.am__work__uesr-icon').attr('src'),
      }
    }).toArray()

    data.tags = $('._tag-list a').map(function () {
      const $el = $(this)
      return {
        id: $el.attr('href')?.match(/(\d+)/)?.[1],
        name: $el.text()
      }
    }).toArray()

    const $latest = $('._related-articles[data-gtm-category="Related Article Latest"]')
    const $latest_tag_link = $latest.find('.rla__heading-link')
    data.related_latest = {
      tag_name: $latest_tag_link.data('gtm-label'),
      tag_id: $latest_tag_link.attr('href')?.match(/(\d+)/)?.[1],
      items: $latest.find('._article-summary-card-related').map(function () {
        const $el = $(this)
        const $link = $el.find('.ascr__title-container > a')
        return {
          id: $link.attr('href')?.match(/(\d+)/)?.[1],
          title: $link.text(),
          thumbnail: $el.find('._thumbnail').css('background-image')?.match(/url\((.*)\)/)?.[1],
        }
      }).toArray()
    }

    const $rec = $('._related-articles[data-gtm-category="Related Article Popular"]')
    const $rec_tag_link = $rec.find('.rla__heading-link')
    data.related_recommend = {
      tag_name: $rec_tag_link.data('gtm-label'),
      tag_id: $rec_tag_link.attr('href')?.match(/(\d+)/)?.[1],
      items: $rec.find('._article-summary-card-related').map(function () {
        const $el = $(this)
        const $link = $el.find('.ascr__title-container > a')
        return {
          id: $link.attr('href')?.match(/(\d+)/)?.[1],
          title: $link.text(),
          thumbnail: $el.find('._thumbnail').css('background-image')?.match(/url\((.*)\)/)?.[1],
        }
      }).toArray()
    }


    res.setHeader('cache-control', 'max-age=0, s-maxage=21600')
    res.send(data)
  } catch (err) {
    console.log('err: ', err)
    return handleError(err, res)
  }
}
