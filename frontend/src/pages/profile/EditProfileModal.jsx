import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
// TODO: review
const EditProfileModal = ({ authUser }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    fullname: authUser?.fullName || "",
    username: authUser?.userName || "",
    email: authUser?.email || "",
    bio: authUser?.bio || "",
    link: authUser?.link || "",
    newPassword: "",
    currentPassword: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await axios.post("/api/user/update", formData);
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
    onMutate: async (newData) => {
      await queryClient.cancelQueries(["authUser"]);
      const previousData = queryClient.getQueryData(["authUser"]);

      queryClient.setQueryData(["authUser"], (old) => ({
        ...old,
        ...newData,
      }));

      return { previousData };
    },
    onError: (error, newData, context) => {
      queryClient.setQueryData(["authUser"], context.previousData);
      toast.error(error.message);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["authUser"]);
      queryClient.invalidateQueries(["userProfile"]);

      const newUsername = data.user.userName;
      if (newUsername !== authUser.userName) {
        window.location.href = `/profile/${newUsername}`;
      }
      toast.success("Updated successfully");
			document.getElementById("edit_profile_modal").close();
    },
  });

  useEffect(() => {
    if (authUser) {
      setFormData({
        fullname: authUser.fullName,
        username: authUser.userName,
        email: authUser.email,
        bio: authUser.bio,
        link: authUser.link,
        newPassword: "",
        currentPassword: "",
      });
    }
  }, [authUser]);

  return (
    <>
      <button
        className="btn btn-outline rounded-full btn-sm"
        onClick={() =>
          document.getElementById("edit_profile_modal").showModal()
        }
      >
        Edit profile
      </button>
      <dialog id="edit_profile_modal" className="modal">
        <div className="modal-box border rounded-md border-gray-700 shadow-md">
          <h3 className="font-bold text-lg my-3">Update Profile</h3>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate(formData);
            }}
          >
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Full Name"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.fullname}
                name="fullname"
                onChange={handleInputChange}
              />
              <input
                type="text"
                placeholder="Username"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.username}
                name="username"
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.email}
                name="email"
                onChange={handleInputChange}
              />
              <textarea
                placeholder="Bio"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.bio}
                name="bio"
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="password"
                placeholder="Current Password"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.currentPassword}
                name="currentPassword"
                onChange={handleInputChange}
              />
              <input
                type="password"
                placeholder="New Password"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.newPassword}
                name="newPassword"
                onChange={handleInputChange}
              />
            </div>
            <input
              type="text"
              placeholder="Link"
              className="flex-1 input border border-gray-700 rounded p-2 input-md"
              value={formData.link}
              name="link"
              onChange={handleInputChange}
            />
            <button className="btn btn-primary rounded-full btn-sm text-white">
              {mutation.isLoading ? "Updating..." : "Update"}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">Close</button>
        </form>
      </dialog>
    </>
  );
};

export default EditProfileModal;
