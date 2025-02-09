import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const Posts = ({ feedtype }) => {
  const getPostsEndpoint = () => {
    switch (feedtype) {
      case "forYou":
        return "/api/post/all";
      case "following":
        return "/api/post/following";
      default:
        return "/api/post/all";
    }
  };

  const POST_ENDPOINT = getPostsEndpoint();

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", feedtype],
    queryFn: async () => {
      try {
        const res = await axios.get(POST_ENDPOINT);
        return res.data;
      } catch (err) {
        if (err.response) {
          throw new Error(err.response.data.error);
        } else if (err.request) {
          throw new Error("No response received from the server");
        } else {
          throw new Error(err.message);
        }
      }
    },
    enabled: !!feedtype,
  });

  const posts = data && data.posts ? data.posts : [];

  return (
    <>
      {isLoading && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && posts.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && posts.length > 0 && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
      {error && <p className="text-center my-4">{error.message}</p>}
    </>
  );
};

export default Posts;
