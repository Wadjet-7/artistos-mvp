import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"
import { MessageSquare, Heart, Send, Loader2, Pin, Filter, Image } from "lucide-react"

/* ================================================================ */
/*  CONSTANTS                                                        */
/* ================================================================ */

const TAGS = [
  { value: "looking_for",   label: "Looking for",  bg: "#FBF2DC", color: "#8A6A1A" },
  { value: "show_and_tell", label: "Show & tell",   bg: "#F5E6D8", color: "#B5651D" },
  { value: "question",      label: "Question",      bg: "#E8F2EA", color: "#2D4A35" },
  { value: "win",           label: "Win",            bg: "#F5E2DC", color: "#C4705A" },
  { value: "prompt",        label: "Prompt",         bg: "#0E0C0A", color: "#FAF8F5" },
]

const REACTIONS = ["👏", "❤️", "🔥", "💡"]

const FILTER_CHIPS = [
  { value: null,            label: "All" },
  { value: "looking_for",   label: "Looking for" },
  { value: "show_and_tell", label: "Show & tell" },
  { value: "question",      label: "Questions" },
  { value: "win",           label: "Wins" },
]

/* ================================================================ */
/*  HELPERS                                                          */
/* ================================================================ */

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "Just now"
  if (seconds < 3600) return Math.floor(seconds / 60) + "m ago"
  if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago"
  if (seconds < 604800) return Math.floor(seconds / 86400) + "d ago"
  return new Date(date).toLocaleDateString()
}

function tagMeta(value) {
  return TAGS.find(t => t.value === value) || null
}

/* ================================================================ */
/*  COMPOSER                                                         */
/* ================================================================ */

function Composer({ roomId, user, onPosted }) {
  const [body, setBody] = useState("")
  const [tag, setTag] = useState("show_and_tell")
  const [posting, setPosting] = useState(false)

  const handlePost = async () => {
    const trimmed = body.trim()
    if (!trimmed) return
    setPosting(true)
    const { error } = await supabase.from("room_posts").insert({
      room_id: roomId,
      author_id: user.id,
      body: trimmed,
      tag,
    })
    setPosting(false)
    if (error) {
      toast.error("Couldn't post — try again")
      return
    }
    setBody("")
    onPosted()
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <textarea
        rows={3}
        placeholder="Share something with the community..."
        value={body}
        onChange={e => setBody(e.target.value)}
        className="input w-full mb-3"
        style={{ resize: "vertical", minHeight: 72 }}
      />
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Tag picker */}
        <div className="flex gap-1.5 flex-wrap">
          {TAGS.filter(t => t.value !== "prompt").map(t => (
            <button
              key={t.value}
              onClick={() => setTag(t.value)}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-opacity"
              style={{
                background: t.bg,
                color: t.color,
                opacity: tag === t.value ? 1 : 0.45,
                border: tag === t.value ? `1.5px solid ${t.color}` : "1.5px solid transparent",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={handlePost}
          disabled={posting || !body.trim()}
          className="btn-copper flex items-center gap-1.5 text-sm"
          style={{ opacity: posting || !body.trim() ? 0.5 : 1 }}
        >
          {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Post
        </button>
      </div>
    </div>
  )
}

/* ================================================================ */
/*  POST CARD                                                        */
/* ================================================================ */

function PostCard({ post, user, reactions, onReact, onReplyPosted }) {
  const [showReplies, setShowReplies] = useState(false)
  const [replyBody, setReplyBody] = useState("")
  const [replying, setReplying] = useState(false)
  const [replies, setReplies] = useState([])
  const [loadingReplies, setLoadingReplies] = useState(false)

  const tag = tagMeta(post.tag)
  const author = post.author || {}

  /* ---- fetch replies ---- */
  const fetchReplies = useCallback(async () => {
    setLoadingReplies(true)
    const { data } = await supabase
      .from("room_posts")
      .select("*, author:public_profiles!room_posts_author_id_fkey(id, name, avatar_url, initials)")
      .eq("parent_id", post.id)
      .order("created_at", { ascending: true })
    setReplies(data || [])
    setLoadingReplies(false)
  }, [post.id])

  useEffect(() => {
    if (showReplies) fetchReplies()
  }, [showReplies, fetchReplies])

  /* ---- submit reply ---- */
  const handleReply = async () => {
    const trimmed = replyBody.trim()
    if (!trimmed) return
    setReplying(true)
    const { error } = await supabase.from("room_posts").insert({
      room_id: post.room_id,
      author_id: user.id,
      body: trimmed,
      parent_id: post.id,
    })
    setReplying(false)
    if (error) {
      toast.error("Couldn't reply — try again")
      return
    }
    setReplyBody("")
    fetchReplies()
    onReplyPosted()
  }

  /* ---- group reactions ---- */
  const grouped = {}
  ;(reactions || []).forEach(r => {
    if (!grouped[r.emoji]) grouped[r.emoji] = { count: 0, mine: false }
    grouped[r.emoji].count++
    if (r.user_id === user?.id) grouped[r.emoji].mine = true
  })

  return (
    <div className="card" style={{ marginBottom: 16, position: "relative" }}>
      {/* Pin indicator */}
      {post.pinned && (
        <div className="flex items-center gap-1 mb-2 text-[11px] font-medium" style={{ color: "#B5651D" }}>
          <Pin size={12} /> Pinned
        </div>
      )}

      {/* Author row */}
      <div className="flex items-center gap-2.5 mb-2">
        {author.avatar_url ? (
          <img
            src={author.avatar_url}
            alt={author.name}
            className="rounded-full object-cover"
            style={{ width: 32, height: 32 }}
          />
        ) : (
          <div
            className="rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ width: 32, height: 32, background: "#E8E2DA", color: "#0E0C0A" }}
          >
            {author.initials || "?"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold" style={{ color: "#0E0C0A" }}>{author.name || "Member"}</span>
          <span className="text-[11px] ml-2" style={{ color: "#A89F94" }}>{timeAgo(post.created_at)}</span>
        </div>
        {tag && (
          <span
            className="px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap"
            style={{ background: tag.bg, color: tag.color }}
          >
            {tag.label}
          </span>
        )}
      </div>

      {/* Body */}
      <p className="text-sm leading-relaxed mb-3" style={{ color: "#0E0C0A", whiteSpace: "pre-wrap" }}>
        {post.body}
      </p>

      {/* Attached artwork thumbnail */}
      {post.artwork_id && post.artwork_image_url && (
        <div className="mb-3 rounded-lg overflow-hidden" style={{ maxWidth: 220 }}>
          <img
            src={post.artwork_image_url}
            alt="Attached artwork"
            className="w-full object-cover"
            style={{ maxHeight: 180 }}
          />
        </div>
      )}

      {/* Reactions + Reply row */}
      <div className="flex items-center gap-1 flex-wrap">
        {REACTIONS.map(emoji => {
          const g = grouped[emoji]
          return (
            <button
              key={emoji}
              onClick={() => onReact(post.id, emoji)}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors"
              style={{
                background: g?.mine ? "#F5E6D8" : "#FAF8F5",
                border: `1px solid ${g?.mine ? "#B5651D" : "#E8E2DA"}`,
                color: "#0E0C0A",
              }}
            >
              {emoji}{g?.count ? <span className="font-medium">{g.count}</span> : null}
            </button>
          )
        })}
        <button
          onClick={() => setShowReplies(v => !v)}
          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs ml-1"
          style={{ background: "#FAF8F5", border: "1px solid #E8E2DA", color: "#A89F94" }}
        >
          <MessageSquare size={12} />
          {replies.length || post.reply_count || "Reply"}
        </button>
      </div>

      {/* Inline replies thread */}
      {showReplies && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid #E8E2DA" }}>
          {loadingReplies && (
            <div className="flex justify-center py-3">
              <Loader2 size={16} className="animate-spin" style={{ color: "#A89F94" }} />
            </div>
          )}
          {replies.map(reply => {
            const ra = reply.author || {}
            return (
              <div key={reply.id} className="flex gap-2 mb-3 ml-4">
                {ra.avatar_url ? (
                  <img src={ra.avatar_url} alt={ra.name} className="rounded-full object-cover" style={{ width: 24, height: 24, flexShrink: 0 }} />
                ) : (
                  <div className="rounded-full flex items-center justify-center text-[10px] font-semibold" style={{ width: 24, height: 24, flexShrink: 0, background: "#E8E2DA", color: "#0E0C0A" }}>{ra.initials || "?"}</div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold" style={{ color: "#0E0C0A" }}>{ra.name || "Member"}</span>
                  <span className="text-[10px] ml-1.5" style={{ color: "#A89F94" }}>{timeAgo(reply.created_at)}</span>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#0E0C0A", whiteSpace: "pre-wrap" }}>{reply.body}</p>
                </div>
              </div>
            )
          })}

          {/* Reply composer */}
          <div className="flex gap-2 ml-4 mt-1">
            <input
              type="text"
              placeholder="Write a reply..."
              value={replyBody}
              onChange={e => setReplyBody(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply() } }}
              className="input flex-1 text-xs"
              style={{ padding: "6px 10px" }}
            />
            <button
              onClick={handleReply}
              disabled={replying || !replyBody.trim()}
              className="btn-copper text-xs px-3 py-1 flex items-center gap-1"
              style={{ opacity: replying || !replyBody.trim() ? 0.5 : 1 }}
            >
              {replying ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================================================================ */
/*  MAIN COMPONENT                                                   */
/* ================================================================ */

export default function FoundersRoom() {
  const { user } = useAuth()
  const [room, setRoom] = useState(null)
  const [isMember, setIsMember] = useState(false)
  const [posts, setPosts] = useState([])
  const [reactionsMap, setReactionsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState(null)
  const channelRef = useRef(null)

  /* ---- check membership ---- */
  useEffect(() => {
    if (!user?.id) return
    ;(async () => {
      setLoading(true)

      // Fetch the founders room
      const { data: roomData, error: roomErr } = await supabase
        .from("rooms")
        .select("*")
        .eq("slug", "founders")
        .single()

      if (roomErr || !roomData) {
        setLoading(false)
        return
      }
      setRoom(roomData)

      // Check membership
      const { data: membership } = await supabase
        .from("room_members")
        .select("id")
        .eq("room_id", roomData.id)
        .eq("user_id", user.id)
        .maybeSingle()

      setIsMember(!!membership)
      setLoading(false)
    })()
  }, [user?.id])

  /* ---- fetch posts + reactions ---- */
  const fetchPosts = useCallback(async () => {
    if (!room?.id) return

    const { data: postsData } = await supabase
      .from("room_posts")
      .select("*, author:public_profiles!room_posts_author_id_fkey(id, name, avatar_url, initials)")
      .eq("room_id", room.id)
      .is("parent_id", null)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })

    if (postsData) {
      setPosts(postsData)

      // Fetch reactions for all posts
      const postIds = postsData.map(p => p.id)
      if (postIds.length) {
        const { data: rxns } = await supabase
          .from("room_reactions")
          .select("*")
          .in("post_id", postIds)

        const map = {}
        ;(rxns || []).forEach(r => {
          if (!map[r.post_id]) map[r.post_id] = []
          map[r.post_id].push(r)
        })
        setReactionsMap(map)
      }
    }
  }, [room?.id])

  useEffect(() => {
    if (isMember && room?.id) fetchPosts()
  }, [isMember, room?.id, fetchPosts])

  /* ---- realtime subscription ---- */
  useEffect(() => {
    if (!room?.id || !isMember) return

    const channel = supabase.channel(`room-${room.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "room_posts",
        filter: `room_id=eq.${room.id}`,
      }, () => {
        fetchPosts()
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [room?.id, isMember, fetchPosts])

  /* ---- toggle reaction ---- */
  const handleReact = async (postId, emoji) => {
    if (!user?.id) return

    // Check if already reacted
    const existing = (reactionsMap[postId] || []).find(
      r => r.user_id === user.id && r.emoji === emoji
    )

    if (existing) {
      await supabase.from("room_reactions").delete().eq("id", existing.id)
    } else {
      await supabase.from("room_reactions").insert({
        post_id: postId,
        user_id: user.id,
        emoji,
      })
    }
    fetchPosts()
  }

  /* ---- loading state ---- */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin" style={{ color: "#B5651D" }} />
      </div>
    )
  }

  /* ---- not a member gate ---- */
  if (!isMember) {
    return (
      <div className="max-w-xl mx-auto text-center py-24 px-6">
        <div
          className="mx-auto mb-4 flex items-center justify-center rounded-full"
          style={{ width: 56, height: 56, background: "#FBF2DC" }}
        >
          <Heart size={24} style={{ color: "#B5651D" }} />
        </div>
        <h2 className="font-serif text-xl font-semibold mb-2" style={{ color: "#0E0C0A" }}>
          Founders Room
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "#A89F94" }}>
          This room is for Founding Artists and early members. If you believe you should have access, reach out to us through the Help panel.
        </p>
      </div>
    )
  }

  /* ---- filter posts ---- */
  const filtered = activeFilter
    ? posts.filter(p => p.tag === activeFilter)
    : posts

  /* ---- main feed ---- */
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold mb-1" style={{ color: "#0E0C0A" }}>
          Founders Room
        </h1>
        <p className="text-sm" style={{ color: "#A89F94" }}>
          A private space for Founding Artists and early members to connect, share, and grow together.
        </p>
      </div>

      {/* Composer */}
      <Composer roomId={room.id} user={user} onPosted={fetchPosts} />

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <Filter size={14} style={{ color: "#A89F94" }} />
        {FILTER_CHIPS.map(f => (
          <button
            key={f.label}
            onClick={() => setActiveFilter(f.value)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
            style={{
              background: activeFilter === f.value ? "#0E0C0A" : "#FAF8F5",
              color: activeFilter === f.value ? "#FAF8F5" : "#A89F94",
              border: `1px solid ${activeFilter === f.value ? "#0E0C0A" : "#E8E2DA"}`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Posts feed */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <MessageSquare size={32} className="mx-auto mb-3" style={{ color: "#E8E2DA" }} />
          <p className="text-sm" style={{ color: "#A89F94" }}>
            {activeFilter ? "No posts with this tag yet." : "No posts yet. Be the first to share!"}
          </p>
        </div>
      )}

      {filtered.map(post => (
        <PostCard
          key={post.id}
          post={post}
          user={user}
          reactions={reactionsMap[post.id] || []}
          onReact={handleReact}
          onReplyPosted={fetchPosts}
        />
      ))}
    </div>
  )
}
