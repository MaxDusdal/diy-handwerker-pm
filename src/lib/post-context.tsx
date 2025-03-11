"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define types
export interface Author {
  name: string;
  avatar: string;
  expertise?: string;
}

export interface Reply {
  id: number;
  content: string;
  author: Author;
  timestamp: string;
  likes: number;
}

export interface Comment {
  id: number;
  content: string;
  author: Author;
  timestamp: string;
  likes: number;
  replies: Reply[];
}

export interface Post {
  id: number;
  type: "help" | "showcase";
  title: string;
  content: string;
  category: string;
  images?: string[];
  author: Author;
  timestamp: string;
  likes: number;
  liked?: boolean; // Track if current user has liked this post
  comments: number; // number of comments (for list view)
  commentsList?: Comment[]; // actual comments (for detail view)
  urgency?: string;
}

// Initial mock data for posts
const initialPosts: Post[] = [
  {
    id: 1,
    type: "help",
    title: "Brauche Hilfe bei Badrenovierung",
    content:
      "Ich versuche mein Badezimmer zu renovieren, habe aber Probleme mit der Fliesenanordnung. Das Hauptproblem ist die Eckenverbindung, wo die Wand auf den Boden trifft. Ich habe verschiedene Ansätze probiert, aber keiner scheint einen sauberen Abschluss zu ergeben. Suche nach Expertenrat zur besten Vorgehensweise.\n\nKonkrete Fragen:\n1. Was ist der beste Weg, um Eckenübergänge zu handhaben?\n2. Sollte ich Silikon oder Fugenmasse für die Ecken verwenden?\n3. Gibt es spezielle Werkzeuge, die ich verwenden sollte?",
    category: "Sanitär",
    images: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400"
    ],
    author: {
      name: "John Doe",
      avatar: "https://avatar.iran.liara.run/public/1",
      expertise: "DIY Enthusiast"
    },
    timestamp: "2024-03-02T10:00:00Z",
    likes: 24,
    comments: 8,
    commentsList: [
      {
        id: 1,
        content:
          "Für Eckenübergänge empfehle ich ein Eckprofilstück. Es sieht viel sauberer aus und hilft, Risse im Laufe der Zeit zu vermeiden.",
        author: {
          name: "Mike Wilson",
          avatar: "https://avatar.iran.liara.run/public/8",
          expertise: "Professioneller Fliesenleger"
        },
        timestamp: "2024-03-02T11:30:00Z",
        likes: 12,
        replies: [
          {
            id: 11,
            content:
              "Stimme zu! Achte auch darauf, in den Ecken Silikonfugenmasse zu verwenden, nicht Fugenmörtel. Fugenmörtel reißt mit der Zeit aufgrund von Hausbewegungen.",
            author: {
              name: "Sarah Johnson",
              avatar: "https://avatar.iran.liara.run/public/9",
              expertise: "Bauunternehmer"
            },
            timestamp: "2024-03-02T12:15:00Z",
            likes: 8
          }
        ]
      },
      {
        id: 2,
        content:
          "Hier ein Tipp: Verwende eine Laserwasserwaage, um sicherzustellen, dass deine Fliesen perfekt gerade sind. Es macht einen riesigen Unterschied im Endergebnis.",
        author: {
          name: "Emily Chen",
          avatar: "https://avatar.iran.liara.run/public/6",
          expertise: "DIY-Experte"
        },
        timestamp: "2024-03-02T13:00:00Z",
        likes: 6,
        replies: []
      }
    ],
    urgency: "Hoch"
  },
  {
    id: 2,
    type: "showcase",
    title: "Küchenumbau abgeschlossen!",
    content:
      "Habe gerade dieses Küchenumbauprojekt beendet. Hat 6 Wochen gedauert, aber die Ergebnisse sind fantastisch. Wische, um Vorher und Nachher zu sehen!",
    category: "Innenausbau",
    images: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    author: {
      name: "Sarah Wilson",
      avatar: "https://avatar.iran.liara.run/public/2",
      expertise: "Heimwerker"
    },
    timestamp: "2024-03-01T15:00:00Z",
    likes: 156,
    comments: 32,
    commentsList: [
      {
        id: 1,
        content: "Wirklich beeindruckend! Wie lange hat die gesamte Renovierung gedauert?",
        author: {
          name: "Thomas Mueller",
          avatar: "https://avatar.iran.liara.run/public/5",
          expertise: "Anfänger"
        },
        timestamp: "2024-03-01T16:30:00Z",
        likes: 5,
        replies: []
      }
    ]
  },
  {
    id: 3,
    type: "help",
    title: "Steckdose funktioniert nicht",
    content:
      "Die Steckdose in meinem Wohnzimmer hat plötzlich aufgehört zu funktionieren. Habe bereits den Sicherungskasten geprüft. Irgendwelche Ideen, was falsch sein könnte?",
    category: "Elektrik",
    author: {
      name: "Mike Brown",
      avatar: "https://avatar.iran.liara.run/public/3",
      expertise: "Heimwerker"
    },
    timestamp: "2024-03-02T08:00:00Z",
    likes: 12,
    comments: 15,
    commentsList: [],
    urgency: "Mittel"
  },
  {
    id: 4,
    type: "showcase",
    title: "DIY Garten-Feuerstelle",
    content:
      "Habe diese Feuerstelle am Wochenende gebaut. Die Gesamtkosten lagen unter 200€. So habe ich es gemacht!",
    category: "Außenbereich",
    images: ["/placeholder.svg?height=300&width=400"],
    author: {
      name: "Emily Chen",
      avatar: "https://avatar.iran.liara.run/public/4",
      expertise: "DIY-Enthusiast"
    },
    timestamp: "2024-03-01T10:00:00Z",
    likes: 89,
    comments: 24,
    commentsList: []
  }
];

// Create the context
interface PostContextType {
  posts: Post[];
  addPost: (post: Omit<Post, "id" | "timestamp" | "likes" | "comments" | "commentsList">) => void;
  getPost: (id: number) => Post | undefined;
  addComment: (postId: number, comment: Omit<Comment, "id" | "timestamp" | "likes" | "replies">) => void;
  addReply: (postId: number, commentId: number, reply: Omit<Reply, "id" | "timestamp" | "likes">) => void;
  toggleLike: (postId: number) => void;
  resetPosts: () => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  // Attempt to load posts from localStorage on initial render
  useEffect(() => {
    const savedPosts = localStorage.getItem("posts");
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts) as Post[]);
      } catch (error) {
        console.error("Failed to parse saved posts", error);
      }
    }
  }, []);

  // Save posts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts));
  }, [posts]);

  const addPost = (post: Omit<Post, "id" | "timestamp" | "likes" | "comments" | "commentsList">) => {
    const newPost: Post = {
      ...post,
      id: Math.max(0, ...posts.map(p => p.id)) + 1,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      commentsList: []
    };
    
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const getPost = (id: number) => {
    return posts.find(post => post.id === id);
  };

  const addComment = (postId: number, comment: Omit<Comment, "id" | "timestamp" | "likes" | "replies">) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const newComment: Comment = {
            ...comment,
            id: post.commentsList ? Math.max(0, ...post.commentsList.map(c => c.id)) + 1 : 1,
            timestamp: new Date().toISOString(),
            likes: 0,
            replies: []
          };
          
          return {
            ...post,
            comments: post.comments + 1,
            commentsList: post.commentsList ? [newComment, ...post.commentsList] : [newComment]
          };
        }
        return post;
      })
    );
  };

  const addReply = (postId: number, commentId: number, reply: Omit<Reply, "id" | "timestamp" | "likes">) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId && post.commentsList) {
          const updatedComments = post.commentsList.map(comment => {
            if (comment.id === commentId) {
              const newReply: Reply = {
                ...reply,
                id: comment.replies ? Math.max(0, ...comment.replies.map(r => r.id)) + 1 : 1,
                timestamp: new Date().toISOString(),
                likes: 0
              };
              
              return {
                ...comment,
                replies: [...comment.replies, newReply]
              };
            }
            return comment;
          });
          
          return {
            ...post,
            comments: post.comments + 1,
            commentsList: updatedComments
          };
        }
        return post;
      })
    );
  };

  const toggleLike = (postId: number) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          // Toggle liked state and update like count accordingly
          const newLikedState = !post.liked;
          return {
            ...post,
            liked: newLikedState,
            likes: newLikedState 
              ? post.likes + 1  // If now liked, increment
              : Math.max(0, post.likes - 1)  // If unliked, decrement but not below 0
          };
        }
        return post;
      })
    );
  };

  // Reset posts to initial state
  const resetPosts = () => {
    localStorage.removeItem("posts");
    setPosts(initialPosts);
  };

  // Add a global window function for easy console access
  useEffect(() => {
    // Make the reset function available globally for debugging
    if (typeof window !== 'undefined') {
      // Define a type for our custom window object
      interface CustomWindow extends Window {
        resetPostsData?: () => void;
      }
      
      // Cast window to our custom type
      const customWindow = window as CustomWindow;
      
      // Add the reset function
      customWindow.resetPostsData = () => {
        localStorage.removeItem("posts");
        console.log("Posts data cleared. Reload the page to see changes.");
      };
    }
    
    return () => {
      // Clean up the global function when unmounting
      if (typeof window !== 'undefined') {
        // Define a type for our custom window object
        interface CustomWindow extends Window {
          resetPostsData?: () => void;
        }
        
        // Cast window to our custom type
        const customWindow = window as CustomWindow;
        
        // Remove the function
        delete customWindow.resetPostsData;
      }
    };
  }, []);

  return (
    <PostContext.Provider
      value={{
        posts,
        addPost,
        getPost,
        addComment,
        addReply,
        toggleLike,
        resetPosts
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

// Custom hook to use the post context
export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostProvider");
  }
  return context;
} 