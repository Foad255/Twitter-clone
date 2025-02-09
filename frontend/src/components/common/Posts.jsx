import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
// import { POSTS } from "../../utils/db/dummy";
import { useQuery } from "@tanstack/react-query";
import axios from 'axios'


const Posts = ({feedtype}) => {
	
	const getPostsEndpoint = () => {
		switch (feedtype) {
			case "forYou":
				return '/api/post/all'
			case 'following':
				return '/api/post/following'
			default:
				return '/api/post/all'
		}
	}
	const POST_ENDPOINT = getPostsEndpoint()

	 const {data, isLoading} = useQuery({
		queryKey: ['posts', POST_ENDPOINT],
		queryFn: async () => {
			try {
				const res = await axios.get(POST_ENDPOINT)
				return res.data	
			} catch (err) {
				if (err.response) {
					// out of 2xx
					throw new Error(err.response.data.error)
				} else if (err.request) {
					// doesn't get any response from the server
					throw new Error('No response received from the server')
				} else {
					// others errors
					throw new Error(err.message)
				}
			}
		}
	})

	const posts = data ? data.posts : [];
	

	return (
		<>
			{isLoading && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && posts.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;