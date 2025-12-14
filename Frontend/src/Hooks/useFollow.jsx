import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const useFollowUser = (followingUserId) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);
    const API = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const followStatus = async () => {
            if (!followingUserId) return;

            try {
                const res = await fetch(
                    `${API}/api/auth/follow-status/${followingUserId}`,
                    { method: "GET", credentials: 'include' }
                );

                if (!res.ok) throw new Error(`Error ${res.status}`);

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
        if (!followingUserId) return false;

        try {
            setLoading(true);

            const url = isFollowing
                ? `${API}/api/auth/unfollow/${followingUserId}`
                : `${API}/api/auth/follow/${followingUserId}`;

            const res = await fetch(url, {
                method: isFollowing ? 'DELETE' : 'POST',
                credentials: 'include'
            });

            if (!res.ok) throw new Error(`Error ${res.status}`);

            setIsFollowing(!isFollowing);
            return true;
        } catch (err) {
            console.error(err);
            toast.error('Error toggling follow status.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { isFollowing, toggleFollow, loading };
};

export default useFollowUser;
