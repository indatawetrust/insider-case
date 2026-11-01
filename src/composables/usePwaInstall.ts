import { computed, onMounted, onUnmounted, ref } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function usePwaInstall() {
  const installPrompt = ref<BeforeInstallPromptEvent | null>(null)
  const isInstalled = ref(false)
  const canInstall = computed(() => !isInstalled.value && installPrompt.value !== null)

  function onBeforeInstallPrompt(event: Event) {
    event.preventDefault()
    installPrompt.value = event as BeforeInstallPromptEvent
  }

  function onAppInstalled() {
    isInstalled.value = true
    installPrompt.value = null
  }

  onMounted(() => {
    if (typeof window === 'undefined') return
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
  })

  onUnmounted(() => {
    if (typeof window === 'undefined') return
    window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.removeEventListener('appinstalled', onAppInstalled)
  })

  async function install(): Promise<boolean> {
    const promptEvent = installPrompt.value
    if (!promptEvent) return false

    await promptEvent.prompt()
    const choice = await promptEvent.userChoice
    installPrompt.value = null
    return choice.outcome === 'accepted'
  }

  return {
    canInstall,
    isInstalled,
    install,
  }
}
