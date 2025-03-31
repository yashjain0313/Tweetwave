import { FormEvent, useState } from "react";
import { Post as PostType } from "../utils/db/dummy"
import { Link } from "react-router-dom";
import { FaRegBookmark, FaRegComment, FaRegHeart, FaTrash } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User as DataType } from "../utils/db/dummy";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../utils/date";

interface Props {
  post: PostType
}

function Post({post}: Props) {
  const [comment, setComment] = useState<string>();

  const {data:authUser} = useQuery<DataType>({queryKey: ["authUser"]});
  const queryClient = useQueryClient();

  const {mutate: deletePost, isPending: isDeleting} = useMutation({
	mutationFn: async () => {
		try {
			const res = await axios.delete(`/api/posts/${post._id}`)

			return res.data;
		} catch (error) {			
			if (axios.isAxiosError(error)){
				throw error;
			} else{
				throw new Error('Server error');
			}
		}
	},
	onSuccess: ()=>{
		toast.success("Post deleted successfully");

		queryClient.invalidateQueries({queryKey: ["posts"]});    //define in Posts.tsx
	},
	onError: ()=>{
        toast.error("Post deletion failed");
    }
  })

  const {mutate: likePost, isPending: isLiking} = useMutation({
	mutationFn: async () => {
		try {
			const res = await axios.put(`/api/posts/like/${post._id}`)
			return res.data;
		} catch (error) {
			if(axios.isAxiosError(error)) throw error;
			else throw new Error('Server error');
		}
	},
	onSuccess: (updatedLikes)=>{
		// toast.success("Post liked successfully");
		// queryClient.invalidateQueries({queryKey: ["posts"]})  refething all post again

		// updating in cache
		queryClient.setQueryData(["posts"], (oldData: PostType[]) => {
			return oldData.map(p =>{
				if(p._id === post._id){
					console.log(post);
					return {...p, likes:updatedLikes}
				}
				return p;
			});
		})
	},
	onError: ()=>{
        toast.error("Post like failed");
    }
  })

  const {mutate: commentPost, isPending: isCommenting} = useMutation({
	mutationFn: async (comment : string)=>{
		try {
			
			const res = await axios.put(`/api/posts/comment/${post._id}`,{
				text: comment
			},{
				headers: {
                    "Content-Type": "application/json"
                }
			});
			return res.data;
		} catch (error) {
			console.log(error);
			
			if(axios.isAxiosError(error)){
				throw error;
			}else{
				throw new Error('Server error');
			}
		}
	},
	onSuccess: (updated: PostType)=>{
		// toast.success("commented successfully");
		setComment("");
		queryClient.setQueryData(["posts"], (oldData : PostType[]) => {
			
            return oldData.map(p => {
                if (p._id === post._id) {

                    return {...p, comments: updated};
					
                }
                return p;
            });
        });
	},
	onError: ()=>{
		toast.error("commenting failed");
	}
  })

	const postOwner = post.user;
	const isLiked = post.likes.includes(authUser?._id.toString() ?? '');

	const isMyPost = authUser?._id === post.user._id;

	const formattedDate = formatPostDate(post.createdAt);

	const handleDeletePost = () => {
		deletePost();
	};

	const handlePostComment = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (isCommenting || !comment) return;
		commentPost(comment);
	};

	const handleLikePost = () => {
		if(isLiking) return;
		likePost();
	};

	return (
		<>
			<div className='flex gap-2 items-start p-4 border-b border-gray-700'>
				<div className='avatar'>
					<Link to={`/profile/${postOwner.username}`} className='w-8 rounded-full overflow-hidden'>
						<img src={postOwner.profileImg || "/avatar-placeholder.png"} />
					</Link>
				</div>
				<div className='flex flex-col flex-1'>
					<div className='flex gap-2 items-center'>
						<Link to={`/profile/${postOwner.username}`} className='font-bold'>
							{postOwner.fullname}
						</Link>
						<span className='text-gray-700 flex gap-1 text-sm'>
							<Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
							<span>·</span>
							<span>{formattedDate}</span>
						</span>
						{isMyPost && (
							<span className='flex justify-end flex-1'>
								{!isDeleting && <FaTrash className='cursor-pointer hover:text-red-500' onClick={handleDeletePost} />}
								{isDeleting && (<LoadingSpinner size="sm"/>)}
							</span>
						)}
					</div>
					<div className='flex flex-col gap-3 overflow-hidden'>
						<span>{post.text}</span>
						{post.img && (
							<img
								src={post.img}
								className='h-80 object-contain rounded-lg border border-gray-700'
								alt=''
							/>
						)}
					</div>
					{/* comment */}
					<div className='flex justify-between mt-3'>
						<div className='flex gap-4 items-center w-2/3 justify-between'>
							<div className='flex gap-1 items-center cursor-pointer group'
								onClick={() => (document.getElementById("comments_modal" + post._id) as HTMLDialogElement)?.showModal()}
							>
								<FaRegComment className='w-4 h-4  text-slate-500 group-hover:text-sky-400' />
								<span className='text-sm text-slate-500 group-hover:text-sky-400'>
									{post.comments.length}
								</span>
							</div>
							{/* Modal Component from DaisyUI */}
							<dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
								<div className='modal-box rounded border border-gray-600'>
									<h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
									<div className='flex flex-col gap-3 max-h-60 overflow-auto'>
										{post.comments.length === 0 && (
											<p className='text-sm text-slate-500'>
												No comments yet 🤔 Be the first one 😉
											</p>
										)}
										{post.comments.map((comment) => (
											<div key={comment._id} className='flex gap-2 items-start'>
												<div className='avatar'>
													<div className='w-8 rounded-full'>
														<img
															src={comment.user.profileImg || "/avatar-placeholder.png"}
														/>
													</div>
												</div>
												<div className='flex flex-col'>
													<div className='flex items-center gap-1'>
														<span className='font-bold'>{comment.user.fullname}</span>
														<span className='text-gray-700 text-sm'>
															@{comment.user.username}
														</span>
													</div>
													<div className='text-sm'>{comment.text}</div>
										</div>
											</div>
										))}
									</div>
									<form className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2'
										onSubmit={handlePostComment}
									>
										<textarea
											className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800'
											placeholder='Add a comment...'
											value={comment}
											onChange={(e) => setComment(e.target.value)}
										/>
										<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
											{isCommenting ? (<LoadingSpinner size="md" />) : ("Post")}
										</button>
									</form>
								</div>
								<form method='dialog' className='modal-backdrop'>
									<button className='outline-none'>close</button>
								</form>
							</dialog>
							<div className='flex gap-1 items-center group cursor-pointer'>
								<BiRepost className='w-6 h-6  text-slate-500 group-hover:text-green-500' />
								<span className='text-sm text-slate-500 group-hover:text-green-500'>0</span>
							</div>
							<div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
								{isLiking && <LoadingSpinner size="sm" />}
								{!isLiked && !isLiking && (
									<FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
								)}
								{isLiked && !isLiking && (<FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500 ' /> )}

								<span
									className={`text-sm group-hover:text-pink-500 ${
										isLiked ? "text-pink-500" : "text-slate-500"
									}`}
								>
									{post.likes.length}
								</span>
							</div>
						</div>
						<div className='flex w-1/3 justify-end gap-2 items-center'>
							<FaRegBookmark className='w-4 h-4 text-slate-500 cursor-pointer' />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default Post