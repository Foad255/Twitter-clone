import {useMutation, useQueryClient} from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'



const useFollow = () => {

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (userId) => {
      const res = await axios.post(`/api/user/follow/${userId}`)
      return res.data
    },
    onMutate: () => {
      toast.loading('loading...')
    },
    onSuccess: () => {
      Promise.all([      
        queryClient.invalidateQueries({queryKey: ['suggestedUsers']}),
        queryClient.invalidateQueries({queryKey: ['authUser']})]
      ),
      toast.dismiss()
      toast.success('success')
    }
  })
  const follow = (userId) => {mutation.mutate(userId)}
  const isPending = mutation.isPending
  return {follow , isPending}
}

export default useFollow