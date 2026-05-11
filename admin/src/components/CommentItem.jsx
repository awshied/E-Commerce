import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  Reply,
} from "lucide-react";

const CommentItem = ({
  comment,
  level = 0,
  onReply,
  onEdit,
  onUpdate,
  onDelete,
  onHide,
  onReaction,
  isReplying,
  isEditing,
  editText,
  setEditText,
  onCancelEdit,
  isUpdatePending,
  isReactionPending,
  visibleReplies,
  toggleReplies,
}) => {
  const isHidden = comment.isHidden;
  const maxLevel = 3;
  const marginLeft = level * 32;

  return (
    <div
      className={`card transition-all duration-200 ${
        isHidden ? "opacity-60" : ""
      }`}
      style={{ marginLeft: level > 0 ? `${Math.min(marginLeft, 128)}px` : "0" }}
    >
      <div
        className={`card-body p-4 ${level > 0 ? "bg-base-200/50" : "bg-base-200"} rounded-xl group`}
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <div className="avatar placeholder">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary">
                  {comment.userId?.avatar ? (
                    <img
                      src={comment.userId.avatar}
                      alt={comment.userId.username}
                    />
                  ) : (
                    <span className="text-sm font-bold">
                      {comment.userId?.username?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base-content">
                  {comment.userId?.username || "User Tidak Diketahui"}
                </span>
                {comment.userId?.role === "admin" && (
                  <span className="badge badge-primary badge-sm">Admin</span>
                )}
                <div className="flex items-center gap-1 text-xs text-base-content/50">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(comment.createdAt).toLocaleString("id-ID")}
                  </span>
                </div>
                {comment.updatedAt !== comment.createdAt && (
                  <span className="text-xs text-base-content/40">(diedit)</span>
                )}
                {isHidden && (
                  <span className="badge badge-error badge-sm gap-1">
                    <EyeOff className="w-3 h-3" /> Tersembunyi
                  </span>
                )}
                {comment.isReply && (
                  <span className="badge badge-info badge-sm gap-1">
                    <Reply className="w-3 h-3" /> Balasan
                  </span>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="mt-3 space-y-3">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                  className="textarea textarea-bordered w-full focus:textarea-primary"
                  autoFocus
                  placeholder="Edit komentar..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdate(comment._id)}
                    disabled={isUpdatePending}
                    className="btn btn-sm btn-primary"
                  >
                    {isUpdatePending ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      "Simpan"
                    )}
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="btn btn-sm btn-ghost"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <p
                className={`text-base-content/80 mt-1 ${isHidden ? "line-through" : ""}`}
              >
                {comment.comment}
              </p>
            )}

            {!isEditing && (
              <div className="flex items-center gap-1 mt-3 flex-wrap">
                <button
                  onClick={() => onReaction(comment._id, "like")}
                  disabled={isReactionPending}
                  className={`btn btn-sm btn-ghost gap-1 ${
                    comment.userLiked ? "text-primary" : ""
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{comment.activity?.totalLikes || 0}</span>
                </button>

                <button
                  onClick={() => onReaction(comment._id, "dislike")}
                  disabled={isReactionPending}
                  className={`btn btn-sm btn-ghost gap-1 ${
                    comment.userDisliked ? "text-error" : ""
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>{comment.activity?.totalDislikes || 0}</span>
                </button>

                <button
                  onClick={() => onReply(comment)}
                  className="btn btn-sm btn-ghost gap-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  Balas
                </button>

                {comment.replies?.length > 0 && !comment.isReply && (
                  <button
                    onClick={() => toggleReplies(comment._id)}
                    className="btn btn-sm btn-ghost gap-1"
                  >
                    {visibleReplies.has(comment._id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    {comment.replies.length} Balasan
                  </button>
                )}

                <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(comment)}
                    className="btn btn-xs btn-ghost text-warning"
                    title="Edit komentar"
                    aria-label="Edit komentar"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onHide(comment._id, isHidden)}
                    className={`btn btn-xs btn-ghost ${
                      isHidden ? "text-success" : "text-info"
                    }`}
                    aria-label={
                      isHidden ? "Tampilkan kembali" : "Sembunyikan komentar"
                    }
                  >
                    {isHidden ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={() => onDelete(comment._id)}
                    className="btn btn-xs btn-ghost text-error"
                    title="Hapus komentar"
                    aria-label="Hapus komentar"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {comment.replies &&
          comment.replies.length > 0 &&
          visibleReplies.has(comment._id) &&
          level < maxLevel && (
            <div className="mt-4 space-y-3 pl-4 border-l-2 border-base-300">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  level={level + 1}
                  onReply={onReply}
                  onEdit={onEdit}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onHide={onHide}
                  onReaction={onReaction}
                  isReplying={isReplying}
                  isEditing={isEditing}
                  editText={editText}
                  setEditText={setEditText}
                  onCancelEdit={onCancelEdit}
                  isUpdatePending={isUpdatePending}
                  isReactionPending={isReactionPending}
                  visibleReplies={visibleReplies}
                  toggleReplies={toggleReplies}
                />
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default CommentItem;
