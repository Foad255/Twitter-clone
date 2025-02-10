import { Link } from "react-router-dom";
import { ImSpinner9 } from "react-icons/im";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useFollow from "../hooks/useFollow";
import { useState } from "react";

const RightPanel = () => {
  const { data: suggestedUsers = [], isLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      const res = await axios.get("/api/user/suggestions");
      return res.data || [];
    },
  });
  const { follow } = useFollow();

  const [loadingUserId, setLoadingUserId] = useState(null); // Track the loading state for each user

  // Avoid stretching the page
  if (suggestedUsers.length === 0)
    return (
      <div className="md:w-64 w-0">
        <div className="bg-[#16181C] p-4 rounded-md sticky top-2">
          <p className="font-bold">No more to Follow</p>
        </div>
      </div>
    );

  return (
    <div className="hidden lg:block my-4 mx-2">
      <div className="bg-[#16181C] p-4 rounded-md sticky top-2">
        <p className="font-bold">Who to follow</p>
        <div className="flex flex-col gap-4">
          {isLoading && (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          )}
          {!isLoading &&
            suggestedUsers.map((user) => (
              <Link
                to={`/profile/${user.userName}`}
                className="flex items-center justify-between gap-4"
                key={user._id}
              >
                <div className="flex gap-2 items-center">
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img src={user.profileImg || "/avatar-placeholder.png"} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold tracking-tight truncate w-28">
                      {user.fullName}
                    </span>
                    <span className="text-sm text-slate-500">
                      @{user.userName}
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      setLoadingUserId(user._id); // Set loading state for the user
                      follow(user._id, {
                        onSettled: () => {
                          setLoadingUserId(null); // Reset loading state when mutation is settled
                        },
                      });
                    }}
                    disabled={loadingUserId === user._id} // Disable button if this user's follow is pending
                  >
                    {loadingUserId === user._id ? (
                      <ImSpinner9 className="animate-spin" />
                    ) : (
                      "Follow"
                    )}
                  </button>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
