import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function UserCard({ user }) {
  const { user: currentUser } = useContext(AuthContext);
  const [isFollowing, setIsFollowing] = useState(
    currentUser?.following?.some((f) => f._id === user._id)
  );

  const handleFollow = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${user._id}/follow`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (res.ok) {
        setIsFollowing((prev) => !prev);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <img
          src={user.profilePic || "/default-avatar.png"}
          alt={user.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <span>{user.username}</span>
      </div>
      {currentUser?._id !== user._id && (
        <button
          onClick={handleFollow}
          className={`px-3 py-1 rounded-lg text-sm ${
            isFollowing ? "bg-gray-300" : "bg-blue-500 text-white"
          }`}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}
    </div>
  );
}
