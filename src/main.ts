import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { SITE_ENV } from './config'
import App from './App.vue'
import { router } from './router'
import ExternalLink from './components/ExternalLink.vue'
import Lazyload from './components/LazyLoad.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Style
import './styles/index.sass'

// Create App
const app = createApp(App)

// Router
app.use(router)

app.use(createPinia())

// Global components
app.component('external-link', ExternalLink)
app.component('lazyload', Lazyload)

// FontAwesome
// https://fontawesome.com/v5.15/icons
library.add(fas)
app.component('fa', FontAwesomeIcon)

// Mount
app.mount('#app')
document.body?.setAttribute('data-env', SITE_ENV)
