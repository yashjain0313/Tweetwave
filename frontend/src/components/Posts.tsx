import { useQuery } from "@tanstack/react-query";
import Post from "./Post";
import PostSkeleton from "./PostSkeleton";
import axios, { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Post as PostType} from "../utils/db/dummy";
import { useEffect } from "react";

function Posts({feedType, username, userId}: {feedType?: string, username?: string, userId?: string}){
	
  const getPostEndPoint = () =>{
	switch(feedType){
		case "forYou": return '/api/posts/all';
		case "following": return '/api/posts/following';
		case "posts": return `/api/posts/user/${username}`;
		case "likes": return `/api/posts/likes/${userId}`;
		default: return 'api/posts/all'; 
	}
  }

  const POST_ENDPOINT = getPostEndPoint();
  const {data: posts, isLoading, refetch, isRefetching} = useQuery<PostType[]>({
	queryKey: ["posts"],
	queryFn: async ()=>{
		try {
			const res = await axios.get<PostType[]>(POST_ENDPOINT)
			return res.data;

		} catch (error) {
			if (axios.isAxiosError(error)) {
			const errorMsg = isAxiosError(error) ? error.response?.data?.message : "An unexpected error occurred";
			toast.error(errorMsg);
			} else {
			console.error(error);
			toast.error("An unexpected error occurred");
			}
			return [];
		}
	}
  });

  useEffect(()=>{
	refetch();

  },[feedType, refetch, username])

  return (
    <>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching &&posts?.length === 0 && <p className='text-center my-4'>No posts 👻</p>}
			{!isLoading && !isRefetching && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
  )
}

export default Posts