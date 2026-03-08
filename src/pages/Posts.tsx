import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ThumbsUp, Share2, MessageSquare, Trash, Copy, Download, Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard, downloadTranscription } from "@/utils/transcriptionUtils";

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

const Posts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const { type, content } = location.state || { type: "blog", content: "" };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const handleLike = () => {
    setLiked((previous) => !previous);
    setLikes((previous) => previous + (liked ? -1 : 1));
    toast({
      title: liked ? "Like removed" : "Thanks!",
      description: liked ? "The post was removed from your likes." : "Your like has been recorded"
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: type === "blog" ? "My Blog Post" : "My Social Post",
        text: content,
      });
    } catch (error) {
      await copyToClipboard(content);
      toast({
        title: "Share fallback used",
        description: "The content was copied so you can paste it anywhere."
      });
    }
  };

  const handleDelete = () => {
    toast({
      title: "Post deleted",
      description: "Your post has been successfully deleted"
    });
    navigate("/");
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: "Anonymous",
      content: newComment,
      date: new Date().toLocaleDateString()
    };

    setComments(prev => [comment, ...prev]);
    setNewComment("");
    toast({
      title: "Comment added",
      description: "Your comment has been posted successfully"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-fuchsia-50 via-white to-sky-50 p-8">
      <div className="container mx-auto max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6 rounded-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Transcription
        </Button>

        <Card className="mb-8 overflow-hidden border-white/60 bg-white/85 shadow-xl backdrop-blur">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-fuchsia-600">
                  <Sparkles className="h-4 w-4" />
                  Content workspace
                </p>
                <CardTitle className="text-3xl text-slate-950">
                  {type === "blog" ? "Blog Post" : "Social Media Post"}
                </CardTitle>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50 px-4 py-3 text-slate-700">
                  <div className="text-xs uppercase tracking-wide text-fuchsia-600">Words</div>
                  <div className="text-xl font-semibold text-slate-900">{wordCount}</div>
                </div>
                <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-slate-700">
                  <div className="text-xs uppercase tracking-wide text-sky-600">Characters</div>
                  <div className="text-xl font-semibold text-slate-900">{content.length}</div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap rounded-3xl border border-slate-200 bg-slate-50 p-6 text-base leading-8 text-slate-700 shadow-inner">
              {content}
            </div>
          </CardContent>
          <CardFooter className="flex gap-4 flex-wrap">
            <Button onClick={handleLike} variant="outline">
              <ThumbsUp className="mr-2 h-4 w-4" />
              {liked ? "Liked" : "Like"} ({likes})
            </Button>
            <Button onClick={handleShare} variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button onClick={() => copyToClipboard(content)} variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button onClick={() => downloadTranscription(content)} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur">
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="min-h-[88px] flex-1"
              />
              <Button onClick={handleAddComment}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Comment
              </Button>
            </div>
            {comments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                No comments yet. Start the conversation with the first note.
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="mb-2 flex justify-between text-sm text-gray-500">
                      <span>{comment.author}</span>
                      <span>{comment.date}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-slate-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Posts;