import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";


function useFollow(){
    const queryClient = useQueryClient();

    const {mutate: followAndUnfollow, isPending}=useMutation({
        mutationFn: async (userId: string) =>{
            try {
                const res = await axios.post(`/api/users/follow/${userId}`)
                return res.data;
            } catch (error) {
                if(axios.isAxiosError(error)){
                    throw error;
                }else{
                    throw new Error("An unexpected error occurred");
                }
            }   
        },
        onSuccess: ()=>{
            Promise.all([ // Promise so that both query will go parallel
                queryClient.invalidateQueries({queryKey: ["suggestedUser"]}),
                queryClient.invalidateQueries({queryKey: ["authUser"]})   // to change follow to unfollow | remove it from follow[] of /me
        ])
        },
        onError: ()=>{
            toast.error("Failed to follow");
        }
    })

    return {followAndUnfollow, isPending};
}

export default useFollow;