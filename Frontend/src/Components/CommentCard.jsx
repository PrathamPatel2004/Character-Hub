import React, { useState } from "react";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import SendIcon from '@mui/icons-material/Send';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from "../Contexts/AuthContext";

const CommentCard = ({ comment, onReply, onLike, onDelete }) => {
    const [replyText, setReplyText] = useState("");
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [showAllReplies, setShowAllReplies] = useState(false);
    const { user } = useAuth();

    const handleReplySubmit = async () => {
        if (!replyText.trim()) return;
        await onReply(comment._id, replyText);
        setReplyText("");
        setShowReplyBox(false);
    };

    const isLiked = user && comment.likes?.includes(user._id);

    return (
        <div className="border-b border-gray-500 py-3">
            <div className="flex items-start px-5 flex-col gap-1">
                <div className="flex gap-2">
                    <img
                        src={comment.commentBy?.profilePic || "/default-avatar.png"}
                        alt={comment.commentBy?.username}
                        className="w-8 h-8 rounded-full"
                    />
                    <div>
                        <span className="font-medium">{comment.commentBy?.username}</span>
                        <span className="ml-2 text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="flex justify-between items-center w-full">
                    <h5 className="text-sm text-gray-800 px-10">{comment.content}</h5>
                    {user?._id === comment.commentBy?._id && (
                        <button
                        onClick={() => onDelete(comment._id)}
                        className="text-right"
                        >
                            <DeleteIcon className="text-gray-500 hover:text-red-600 h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="flex gap-2 items-center px-10 mt-1">
                    <button
                        onClick={() => onLike(comment._id)}
                        className="flex items-center gap-1 text-sm"
                    >
                        {isLiked ? (
                            <ThumbUpIcon className="text-blue-600 h-3 w-3" />
                        ) : (
                            <ThumbUpOffAltIcon className="text-gray-500 h-3 w-3" />
                        )}
                        <span className="text-gray-600 text-sm">{comment.likes?.length || 0}</span>
                    </button>
                    <button
                        onClick={() => setShowReplyBox((prev) => !prev)}
                        className="text-sm text-gray-600 flex items-center gap-1 hover:text-blue-600"
                    >
                        <ReplyIcon className="h-3 w-3"/><h5>Reply</h5>
                    </button>
                </div>
            </div>
            {showReplyBox && (
                <div className="ml-16 mt-2 gap-2">
                    <div className="flex gap-3 mb-2 ">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Add a Reply..."
                            className="w-full p-3 border border-gray-500 rounded-lg resize-none"
                            rows="2"
                        />
                    </div>
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={handleReplySubmit}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <SendIcon className="h-4 w-4" />
                            Reply to {comment.commentBy?.username}
                        </button>
                    </div>
                </div>
            )}

            {comment.replies?.length > 0 && (
                <div className="ml-12 mt-3 space-y-2">
                    {comment.replies.slice(0, 5).map((reply) => (
                        <div key={reply._id} className="flex items-center gap-2">
                            <img
                                src={reply.commentBy?.profilePic || "/default-avatar.png"}
                                alt={reply.commentBy?.username}
                                className="w-8 h-8 rounded-full"
                            />
                            <div>
                                <span className="font-medium">{reply.commentBy?.username}</span>
                                <span className="ml-2 text-sm text-gray-500">
                                    {new Date(reply.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <p className="ml-10">{reply.content}</p>
                        </div>
                    ))}

                    {comment.replies.length > 5 && (
                        <button
                            onClick={() => setShowAllReplies((prev) => !prev)}
                            className="text-blue-600 text-sm mt-2"
                        >
                            {showAllReplies ? "Hide replies" : "View all replies"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentCard;