import { toast } from 'sonner'

export const showToast = {
  success: (message: string) => {
    toast.success(message)
  },
  error: (message: string) => {
    toast.error(message)
  },
  loading: (message: string) => {
    return toast.loading(message)
  },
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId)
  },
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string
      error: string
    }
  ): ReturnType<typeof toast.promise> => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    })
  },
}
