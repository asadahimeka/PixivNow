import { createRouter, createWebHistory } from 'vue-router'
import Home from './view/index.vue'
import Artworks from './view/artworks.vue'
import Users from './view/users.vue'
import Search from './view/search.vue'
import Ranking from './view/ranking.vue'
import About from './view/about.vue'
import NotFound from './view/404.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [],
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

// Home
router.addRoute({
  path: '/',
  name: 'home',
  component: Home,
})

// Illust
router.addRoute({
  path: '/artworks/:id',
  alias: ['/illust/:id', '/i/:id'],
  name: 'artworks',
  component: Artworks,
})

// User
router.addRoute({
  path: '/users/:id',
  name: 'users',
  alias: ['/u/:id'],
  component: Users,
})

// Search
router.addRoute({
  path: '/search/:keyword',
  name: 'search-index-redirect',
  redirect: (to) => `/search/${to.params.keyword}/1`,
})
router.addRoute({
  path: '/search/:keyword/:p',
  name: 'search',
  component: Search,
})

// Ranking
router.addRoute({
  path: '/ranking',
  name: 'ranking',
  component: Ranking,
})

// Ranking
// router.addRoute({
//   path: '/login',
//   name: 'user-login',
//   component: () => import('./view/login.vue'),
// })

// About
router.addRoute({
  path: '/about',
  name: 'about-us',
  component: About,
})

// 404
router.addRoute({
  path: '/:pathMatch(.*)*',
  name: 'not-found',
  component: NotFound,
})

router.afterEach(({ name }) => {
  document.body.setAttribute('data-route', name as string)
  // Fix route when modal opened
  document.body.style.overflow = 'visible'
})

router.onError((error, to, from) => console.log(error, to, from))

export { router }
