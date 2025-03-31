import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

interface From {
    _id: string;
    username: string;
    profileImg: string;
}

interface Notification {
    _id: string;
    from: From;
    type: "follow" | "like";
}

interface DeleteResponse {
    message: string;
}
const NotificationPage = () => {
	const queryClient = new QueryClient();

	const {data: notifications, isLoading} = useQuery<Notification[]>({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				const res = await axios.get('/api/notifications');
				return res.data;
			} catch (error) {
				if(axios.isAxiosError(error)) throw error;
				throw new Error("Server not responding");
			}
		}
	})

	const {mutate: deleteNotifications} = useMutation<DeleteResponse>({
		mutationFn: async () => {
            try {
                const res = await axios.delete('/api/notifications');
                return res.data;
            } catch (error) {
                if(axios.isAxiosError(error)) throw error;
                throw new Error("Server not responding");
            }
        },
		onSuccess: ()=> {
			toast.success("All notifications deleted");
			queryClient.invalidateQueries({queryKey: ["notifications"]});
		},
		onError: ()=>{
			toast.error("Failed to delete notifications");
		}
	})

	console.log(notifications);
	
	return (
		<>
			<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
				<div className='flex justify-between items-center p-4 border-b border-gray-700'>
					<p className='font-bold'>Notifications</p>
					<div className='dropdown '>
						<div tabIndex={0} role='button' className='m-1'>
							<IoSettingsOutline className='w-4' />
						</div>
						<ul
							tabIndex={0}
							className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
						>
							<li>
								<a onClick={(e)=> {
										e.preventDefault();
										deleteNotifications()
									}}>Delete all notifications</a>
							</li>
						</ul>
					</div>
				</div>
				{isLoading && (
					<div className='flex justify-center h-full items-center'>
						<LoadingSpinner size='lg' />
					</div>
				)}
				
				{notifications?.length === 0 && <div className='text-center p-4 font-bold'>No notifications 🤔</div>}
				{notifications?.map((notification) => (
					<div className='border-b border-gray-700' key={notification._id}>
						<div className='flex gap-2 p-4'>
							{notification.type === "follow" && <FaUser className='w-7 h-7 text-primary' />}
							{notification.type === "like" && <FaHeart className='w-7 h-7 text-red-500' />}
							<Link to={`/profile/${notification.from.username}`}>
								<div className='avatar'>
									<div className='w-8 rounded-full'>
										<img src={notification.from.profileImg || "/avatar-placeholder.png"} />
									</div>
								</div>
								<div className='flex gap-1'>
									<span className='font-bold'>@{notification.from.username}</span>{" "}
									{notification.type === "follow" ? "followed you" : "liked your post"}
								</div>
							</Link>
						</div>
					</div>
				))}
			</div>
		</>
	);
};
export default NotificationPage;