import { ref, onMounted } from 'vue'

export function useData(fetchFn) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const load = async () => {
    loading.value = true
    error.value = null
    try {
      data.value = await fetchFn()
    } catch (e) {
      error.value = e.message
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  return { data, loading, error, reload: load }
}
