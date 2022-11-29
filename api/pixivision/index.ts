import { VercelRequest, VercelResponse } from '@vercel/node'
import axios, { AxiosRequestConfig } from 'axios'
import { AnyNode, Cheerio, CheerioAPI, load } from 'cheerio'
import { handleError, isAccepted, setCorsHeader } from '../utils'

export default async (req: VercelRequest, res: VercelResponse) => {
  if (!isAccepted(req)) {
    return res.status(403).send('403 Forbidden')
  }

  setCorsHeader(req, res)

  const params: any = {}
  const { page } = req.query
  if (page) params.p = page

  const config: AxiosRequestConfig = {
    url: 'https://www.pixivision.net/zh/c/illustration',
    params,
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

    const $articles = $('.main-column-container ._article-card')
    data.articles = $articles.map(function () {
      const $this = $(this)
      const $link = $this.find('.arc__title a')
      return parseArticle($, $this, $link)
    }).toArray()

    if (!page) {
      const $rankList = $('.alc__articles-list-group--ranking ._article-summary-card')
      data.rank = $rankList.map(function () {
        return parseSideItem($(this))
      }).toArray()

      const $recList = $('._articles-list-card[data-gtm-category="Osusume Area"] ._article-summary-card')
      data.recommend = $recList.map(function () {
        return parseSideItem($(this))
      }).toArray()

    }

    res.setHeader('cache-control', 'max-age=0, s-maxage=21600')
    res.send(data)
  } catch (err) {
    console.log('err: ', err)
    return handleError(err, res)
  }
}


function parseArticle($: CheerioAPI, $this: Cheerio<AnyNode>, $link: Cheerio<AnyNode>) {
  return {
    "id": $link.data('gtm-label'),
    "title": $link.text(),
    "pure_title": $link.text().split('-')[1] || '',
    "thumbnail": $this.find('._thumbnail').css('background-image')?.match(/url\((.*)\)/)?.[1],
    "article_url": `https://www.pixivision.net${$link.attr('href')}`,
    "publish_date": $this.find('_date').attr('datetime'),
    "tags": $this.find('.tls__list-item-container a').map(function () {
      const $el = $(this)
      return {
        id: $el.attr('href')?.match(/(\d+)/)?.[1],
        name: $el.text()
      }
    }).toArray()
  }
}

function parseSideItem($this: Cheerio<AnyNode>) {
  const $link = $this.find('.asc__title-link')
  return {
    "id": $link.data('gtm-label'),
    "title": $link.text(),
    "pure_title": $link.text().split('-')[1] || '',
    "thumbnail": $this.find('._thumbnail').css('background-image')?.match(/url\((.*)\)/)?.[1],
    "article_url": `https://www.pixivision.net${$link.attr('href')}`,
    "publish_date": null,
    "tags": []
  }
}
