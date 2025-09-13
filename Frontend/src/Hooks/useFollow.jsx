import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const useFollowUser = (followingUserId) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const followStatus = async () => {
            if (!followingUserId) return;

            try {
                const res = await fetch(
                    `http://localhost:5000/api/auth/follow-status/${followingUserId}`,
                    { method: "GET", credentials: 'include' }
                );

                if (!res.ok) {
                    throw new Error(`Error ${res.status}`);
                }

                const data = await res.json();
                setIsFollowing(data.isFollowing);
            } catch (err) {
                console.error(err);
                toast.error('Could not fetch follow status.');
            }
        };

        followStatus();
    }, [followingUserId]);

    const toggleFollow = async () => {
        if (!followingUserId) return;

        try {
            setLoading(true);

            const url = isFollowing
                ? `http://localhost:5000/api/auth/unfollow/${followingUserId}`
                : `http://localhost:5000/api/auth/follow/${followingUserId}`;

            const res = await fetch(url, { method : isFollowing ? 'DELETE' : 'POST', credentials: 'include' });

            if (!res.ok) {
                throw new Error(`Error ${res.status}`);
            }

            setIsFollowing(!isFollowing);
        } catch (err) {
            console.error(err);
            toast.error('Error toggling follow status.');
        } finally {
            setLoading(false);
        }
    };

    return { isFollowing, toggleFollow, loading };
};

export default useFollowUser;
