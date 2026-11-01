import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@fontsource-variable/inter'
import '@fontsource/bebas-neue'
import './assets/main.css'
import App from './App.vue'

// Clean up any legacy service workers if previously registered
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister()
    }
  })
}

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
