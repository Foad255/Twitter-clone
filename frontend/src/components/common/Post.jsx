import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { ImSpinner9 } from "react-icons/im";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { formatDatePost } from "../../utils/date";

const Post = ({ post }) => {
  const [comment, setComment] = useState("");
  const postOwner = post.user;

  const { data: authuser } = useQuery({ queryKey: ["authUser"] });
  const isMyPost = authuser._id === post.user._id;

  const queryClient = useQueryClient();
  const formattedDate = formatDatePost(post.createdAt);

  const deleteMutation = useMutation({
    mutationFn: async (postId) => {
      try {
        const res = await axios.delete(`/api/post/delete/${postId}`);
        return res.data;
      } catch (err) {
        if (err.response) {
          throw new Error(err.response.data.error);
        } else if (err.request) {
          throw new Error("No response received");
        } else {
          throw new Error(err.message);
        }
      }
    },
    onMutate: () => {
      toast.loading("loading...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.dismiss();
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(`Something went wrong: ${error.message}`);
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (postId) => {
      const res = await axios.post(`/api/post/like/${postId}`);
      return res.data;
    },
    onSuccess: () => {
      // TODO: NOT BEST UX
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
  const commentMutation = useMutation({
    mutationFn: async ({ postId, text }) => {
      const res = await axios.post(`/api/post/comment/${postId}`, { text });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Comment posted successfully");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // Refresh posts to show new comment
    },
    onError: (error) => {
      toast.error(`Error posting comment: ${error.message}`);
    },
  });
  const isLiked = post.likes.includes(authuser._id);

  const handleDeletePost = () => {
    deleteMutation.mutate(post._id);
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    // if (comment.trim() === "") return; // Prevent empty comments
    // if (commentMutation.isPending) return;
    commentMutation.mutate({ postId: post._id, text: comment });
  };

  const handleLikePost = () => {
    if (likeMutation.isPending) return;
    likeMutation.mutate(post._id);
  };

  return (
    <div className="flex gap-2 items-start p-4 border-b border-gray-700">
      <div className="avatar">
        <Link
          to={`/profile/${postOwner?.userName}`}
          className="w-8 rounded-full overflow-hidden"
        >
          <img
            src={postOwner?.profileImg || "/avatar-placeholder.png"}
            alt={postOwner?.userName}
          />
        </Link>
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex gap-2 items-center">
          <Link to={`/profile/${postOwner?.userName}`} className="font-bold">
            {postOwner?.userName + " " + postOwner.fullName}
          </Link>
          <span className="text-gray-700 flex gap-1 text-sm">
            <Link to={`/profile/${postOwner?.userName}`}>
              @{postOwner?.userName}
            </Link>
            <span>·</span>
            <span>{formattedDate}</span>
          </span>
          {isMyPost && (
            <span className="flex justify-end flex-1">
              {!deleteMutation.isPending ? (
                <FaTrash
                  className="cursor-pointer hover:text-red-500"
                  onClick={handleDeletePost}
                />
              ) : (
                <AiOutlineLoading3Quarters className="animate-spin" />
              )}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 overflow-hidden">
          <span>{post.text}</span>
          {post.img && (
            <img
              src={post.img}
              className="h-80 object-contain rounded-lg border border-gray-700"
              alt=""
            />
          )}
        </div>
        <div className="flex justify-between mt-3">
          <div className="flex gap-4 items-center w-2/3 justify-between">
            <div
              className="flex gap-1 items-center cursor-pointer group"
              onClick={() =>
                document.getElementById("comment_modal" + post._id).showModal()
              }
            >
              <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
              <span className="text-sm text-slate-500 group-hover:text-sky-400">
                {post.comment?.length || 0}
              </span>
            </div>
            <dialog
              id={`comment_modal${post._id}`}
              className="modal border-none outline-none"
            >
              <div className="modal-box rounded border border-gray-600">
                <h3 className="font-bold text-lg mb-4">comment</h3>
                <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                  {post.comment?.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No comment yet 🤔 Be the first one 😉
                    </p>
                  )}
                  {post.comment?.map((comment) => (
                    <div key={comment._id} className="flex gap-2 items-start">
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img
                            src={
                              comment.user?.profileImg ||
                              "/avatar-placeholder.png"
                            }
                            alt={comment.user?.userName}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-bold">
                            {comment.user?.userName +
                              " " +
                              comment.user?.fullName}
                          </span>
                          <span className="text-gray-700 text-sm">
                            @{comment.user?.userName}
                          </span>
                        </div>
                        <div className="text-sm">{comment.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <form
                  className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                  onSubmit={handlePostComment}
                >
                  <textarea
                    className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                    {commentMutation.isPending ? <ImSpinner9 /> : "Post"}
                  </button>
                </form>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button className="outline-none">close</button>
              </form>
            </dialog>
            <div className="flex gap-1 items-center group cursor-pointer">
              <BiRepost className="w-6 h-6 text-slate-500 group-hover:text-green-500" />
              <span className="text-sm text-slate-500 group-hover:text-green-500">
                0
              </span>
            </div>
            <div
              className="flex gap-1 items-center group cursor-pointer"
              onClick={handleLikePost}
            >
              {!isLiked && !likeMutation.isPending && (
                <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
              )}
              {isLiked && !likeMutation.isPending && (
                <FaHeart className="w-4 h-4 cursor-pointer text-pink-500" />
              )}
              {likeMutation.isPending && (
                <ImSpinner9 className="animate-spin w-4 h-4 text-slate-500" />
              )}
              <span
                className={`text-sm group-hover:text-pink-500 ${
                  isLiked ? "text-pink-500" : "text-slate-500"
                }`}
              >
                {post.likes?.length || 0}
              </span>
            </div>
          </div>
          <div className="flex w-1/3 justify-end gap-2 items-center">
            <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
