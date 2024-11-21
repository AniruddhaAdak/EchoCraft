import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ThumbsUp, Share2, MessageSquare, Trash } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const { type, content } = location.state || { type: "blog", content: "" };

  const handleLike = () => {
    setLikes(prev => prev + 1);
    toast({
      title: "Thanks!",
      description: "Your like has been recorded"
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: type === "blog" ? "My Blog Post" : "My Social Post",
        text: content,
      });
    } catch (error) {
      toast({
        title: "Share manually",
        description: "Copy the content and share it on your preferred platform"
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-8">
      <div className="container mx-auto max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Transcription
        </Button>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {type === "blog" ? "Blog Post" : "Social Media Post"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {content}
            </div>
          </CardContent>
          <CardFooter className="flex gap-4 flex-wrap">
            <Button onClick={handleLike} variant="outline">
              <ThumbsUp className="mr-2 h-4 w-4" />
              Like ({likes})
            </Button>
            <Button onClick={handleShare} variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2 border rounded-md"
              />
              <Button onClick={handleAddComment}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Comment
              </Button>
            </div>
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>{comment.author}</span>
                    <span>{comment.date}</span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Posts;