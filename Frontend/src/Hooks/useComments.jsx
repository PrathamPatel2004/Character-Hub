import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../Contexts/AuthContext";

const useComments = ({ seriesId, characterId } = {}) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);

    useEffect(() => {
        const fetchComments = async () => {
            if (!seriesId && !characterId) return;

            try {
                setLoadingComments(true);
                const url = characterId
                    ? `/api/comments/character/${characterId}`
                    : `/api/comments/series/${seriesId}`;

                const res = await fetch(url, {credentials: "include"});
                if (!res.ok) throw new Error("Failed to load comments");

                const data = await res.json();
                setComments(data.comments || []);
            } catch (err) {
                toast.error(err.message || "Error fetching comments");
            } finally {
                setLoadingComments(false);
            }
        };
        fetchComments();
    }, [seriesId, characterId]);

    const addComment = async (content) => {
        if (!content.trim()) return toast.error("Comment cannot be empty");

        try {
            const res = await fetch(`/api/comments/add-comment`, {
                method : "POST",
                credentials : "include",
                headers: { "Content-Type": "application/json" },
                body : JSON.stringify({
                    content,
                    seriesId,
                    characterId,
                }),
            });

            if (!res.ok) throw new Error("Failed to post comment");
            const data = await res.json();

            setComments((prev) => [data.comment, ...prev]);
            return data.comment;
        } catch (err) {
            toast.error(err.message);
        }
    };

    const deleteComment = async (commentId) => {
        try {
            const res = await fetch(`/api/comments/delete-comment`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ commentId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to delete comment");
            }

            toast.success("Comment deleted successfully");

            setComments(prev => prev.filter(c => c._id !== commentId));

        } catch (err) {
            console.error("Delete error:", err);
            toast.error(err.message);
        }
    };

    const addReply = async (commentId, content) => {
        if (!content.trim()) return toast.error("Reply cannot be empty");

        try {
            const res = await fetch(`/api/comments/reply-comment`, {
                method : "POST",
                credentials : "include",
                headers: { "Content-Type": "application/json" },
                body : JSON.stringify({ commentId, content }),
            });

            if (!res.ok) throw new Error("Failed to post reply");
            const data = await res.json();

            setComments((prev) =>
                prev.map((c) =>
                c._id === commentId
                    ? { ...c, replies: [...(c.replies || []), data.reply] }
                    : c
            ));
            return data.reply;
        } catch (err) {
            toast.error(err.message);
        }
    };

    const toggleLike = async (commentId) => {
    if (!commentId) return;

    try {
        setComments((prev) =>
            prev.map((c) =>
                c._id === commentId?
                    {    ...c,
                        likes: c.likes.includes(user._id)
                        ? c.likes.filter((id) => id !== user._id) // unlike
                        : [...c.likes, user._id], // like
                    }
                    : c
                )
            );

            const res = await fetch(`/api/comments/like-comment`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ commentId }),
            });

            if (!res.ok) throw new Error("Failed to toggle like");
            const data = await res.json();

            setComments((prev) =>
                prev.map((c) =>
                    c._id === commentId ? { ...c, likes: data.likes || c.likes } : c
                )
            );
        } catch (err) {
            console.error(err);
            toast.error("Error toggling like.");
        }
    };

    return {
        comments,
        loadingComments,
        addComment,
        addReply,
        toggleLike,
        deleteComment,
    };
};

export default useComments;
