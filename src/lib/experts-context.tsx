"use client";

import React, { createContext, useContext, useState, useMemo, useCallback, useRef } from "react";

// Define Expert interface
export interface Expert {
  id: string;
  name: string;
  specialty: string;
  profileImage: string;
  rating: number;
  ratingCount: number;
  hourlyRate: number;
  availability: string;
  description: string;
  categories: string[];
}

// Chat message interface
export interface ExpertMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  read: boolean;
}

// Chat thread interface
export interface ChatThread {
  expert?: Expert;
  messages: ExpertMessage[];
  lastUpdated: Date;
}

export type ThreadsRecord = Record<string, ChatThread>;

// Specialty options
export const SPECIALTIES = [
  "Sanitär",
  "Elektrik",
  "Tischlerei",
  "Malerei",
  "Allgemeiner Handwerker",
];

// Mock experts data
const MOCK_EXPERTS: Expert[] = [
  {
    id: "1",
    name: "Alex Johnson",
    specialty: "Elektrik",
    profileImage: "https://avatar.iran.liara.run/public/5",
    rating: 4.8,
    ratingCount: 127,
    hourlyRate: 60,
    availability: "Heute verfügbar",
    description: "Spezialist für elektrische Installationen und Reparaturen",
    categories: ["Stromversorgung", "Beleuchtung", "Sicherungen"],
  },
  {
    id: "2",
    name: "Sam Rodriguez",
    specialty: "Sanitär",
    profileImage: "https://avatar.iran.liara.run/public/6",
    rating: 4.9,
    ratingCount: 94,
    hourlyRate: 65,
    availability: "Morgen verfügbar",
    description: "Experte für Sanitäranlagen und Wassersysteme",
    categories: ["Rohrreparatur", "Armatureninstallation", "Wassererhitzer"],
  },
  {
    id: "3",
    name: "Jamie Smith",
    specialty: "Tischlerei",
    profileImage: "https://avatar.iran.liara.run/public/7",
    rating: 4.7,
    ratingCount: 56,
    hourlyRate: 55,
    availability: "Heute verfügbar",
    description: "Holzarbeiten und Möbelreparaturen",
    categories: ["Möbelmontage", "Schränke", "Bodenbeläge"],
  },
  {
    id: "4",
    name: "Taylor Wilson",
    specialty: "Malerei",
    profileImage: "https://avatar.iran.liara.run/public/8",
    rating: 4.6,
    ratingCount: 42,
    hourlyRate: 50,
    availability: "In 2 Tagen verfügbar",
    description: "Innen- und Außenmalerei mit perfektem Finish",
    categories: ["Innenräume", "Außenbereiche", "Beizen"],
  },
  {
    id: "5",
    name: "Morgan Lee",
    specialty: "Allgemeiner Handwerker",
    profileImage: "https://avatar.iran.liara.run/public/9",
    rating: 4.9,
    ratingCount: 138,
    hourlyRate: 55,
    availability: "Heute verfügbar",
    description: "Vielseitige Handwerksdienstleistungen für alle Reparaturen",
    categories: ["Reparaturen", "Installation", "Wartung"],
  },
];

// Sample expert conversations only - no initial AI conversation
const expertConversations: Record<string, ExpertMessage[]> = {
  // Alex Johnson (Elektrik)
  "1": [
    {
      role: "assistant",
      content: "Hallo! Hier ist Alex Johnson, Ihr Elektriker. Wie kann ich Ihnen helfen?",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      read: true
    },
    {
      role: "user",
      content: "Ich habe Probleme mit meiner Steckdose. Sie funktioniert nicht mehr.",
      timestamp: new Date(Date.now() - 86000000),
      read: true
    },
    {
      role: "assistant",
      content: "Haben Sie geprüft, ob der FI-Schalter ausgelöst wurde? Oft ist das der Grund, warum eine Steckdose plötzlich nicht mehr funktioniert.",
      timestamp: new Date(Date.now() - 85000000),
      read: true
    }
  ],
  // Sam Rodriguez (Sanitär) 
  "3": [
    {
      role: "assistant",
      content: "Hi, ich bin Sam Rodriguez, Ihr Klempner. Wie kann ich Ihnen heute helfen?",
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
      read: false
    },
    {
      role: "user",
      content: "Mein Wasserhahn tropft ständig. Kann ich das selbst reparieren?",
      timestamp: new Date(Date.now() - 258000000),
      read: true
    },
    {
      role: "assistant",
      content: "In den meisten Fällen ist ein tropfender Wasserhahn auf eine abgenutzte Dichtung zurückzuführen. Das ist eine einfache Reparatur, die Sie selbst durchführen können. Haben Sie Werkzeuge wie einen verstellbaren Schraubenschlüssel und einen Schraubendreher zur Hand?",
      timestamp: new Date(Date.now() - 257000000),
      read: false
    }
  ],
};

// Create initial chat threads - AI thread with just a welcome message, not a full conversation
const createInitialThreads = (): ThreadsRecord => {
  // Create AI thread with just a welcome message
  const aiThread: ChatThread = {
    messages: [
      {
        role: "assistant",
        content: "Hallo! Ich bin Ihr Handwerker-Assistent. Wie kann ich Ihnen bei Ihrem DIY-Projekt oder einer Reparatur helfen?",
        timestamp: new Date(),
        read: true
      }
    ],
    lastUpdated: new Date()
  };

  // Create expert threads
  const threads: ThreadsRecord = {
    "ai": aiThread
  };

  // Add sample conversation with Alex (Elektrik expert)
  const alexExpert = MOCK_EXPERTS.find(expert => expert.id === "1");
  if (alexExpert) {
    const alexMessages = expertConversations["1"] ?? [];
    threads[alexExpert.id] = {
      expert: alexExpert,
      messages: alexMessages,
      lastUpdated: new Date()
    };
  }

  // Add sample conversation with Jamie (Tischlerei expert)
  const jamieExpert = MOCK_EXPERTS.find(expert => expert.id === "3");
  if (jamieExpert) {
    const jamieMessages = expertConversations["3"] ?? [];
    threads[jamieExpert.id] = {
      expert: jamieExpert,
      messages: jamieMessages,
      lastUpdated: new Date()
    };
  }

  return threads;
};

// Create the context
export interface ExpertsContextType {
  experts: Expert[];
  filteredExperts: Expert[];
  selectedExpert: Expert | null;
  activeThread: string;
  threads: ThreadsRecord;
  setSearchQuery: (query: string) => void;
  setSelectedSpecialty: (specialty: string | null) => void;
  setSelectedExpert: (expert: Expert | null) => void;
  getExpertsByCategory: (category: string) => Expert[];
  sendMessageToAI: (message: string) => Promise<void>;
  sendMessageToExpert: (expertId: string, message: string) => Promise<void>;
  setActiveThread: (threadId: string) => void;
  hasUnreadMessages: (threadId: string) => boolean;
  markThreadAsRead: (threadId: string) => void;
  startExpertChat: (expert: Expert) => void;
  resetAIChat: () => void;
  updateThreads: (newThreads: ThreadsRecord) => void;
}

const ExpertsContext = createContext<ExpertsContextType | undefined>(undefined);

export function ExpertsProvider({ children }: { children: React.ReactNode }) {
  const [experts, setExperts] = useState<Expert[]>(MOCK_EXPERTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [activeThread, setActiveThread] = useState<string>("ai");
  const [threads, setThreads] = useState<ThreadsRecord>(createInitialThreads());
  
  // Use a ref to track if a thread was just updated to prevent infinite loops
  const updatingThreadRef = useRef<string | null>(null);

  // Filter experts based on search query and specialty
  const filteredExperts = useMemo(() => {
    return experts.filter((expert) => {
      const matchesQuery = searchQuery === "" || 
        expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expert.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expert.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSpecialty = !selectedSpecialty || expert.specialty === selectedSpecialty;
      
      return matchesQuery && matchesSpecialty;
    });
  }, [experts, searchQuery, selectedSpecialty]);

  // Get experts by category
  const getExpertsByCategory = useCallback((category: string) => {
    return experts.filter(expert => expert.categories.includes(category));
  }, [experts]);

  // Reset AI chat to just the welcome message
  const resetAIChat = useCallback(() => {
    // Create a completely fresh AI thread with just the welcome message
    setThreads(prev => ({
      ...prev,
      ai: {
        messages: [
          {
            role: "assistant" as const,
            content: "Hallo! Ich bin Ihr Handwerker-Assistent. Wie kann ich Ihnen bei Ihrem DIY-Projekt oder einer Reparatur helfen?",
            timestamp: new Date(),
            read: true
          }
        ],
        lastUpdated: new Date()
      }
    }));
  }, []);

  // Send message to AI assistant
  const sendMessageToAI = async (message: string) => {
    // Add user message
    setThreads(prev => {
      const aiThread = prev.ai;
      if (!aiThread) return prev;
      
      const updatedMessages: ExpertMessage[] = [
        ...aiThread.messages,
        {
          role: "user",
          content: message,
          timestamp: new Date(),
          read: true
        }
      ];

      return {
        ...prev,
        ai: {
          ...aiThread,
          messages: updatedMessages,
          lastUpdated: new Date()
        }
      };
    });

    try {
      // Simulate AI response
      // In a real application, this would be a call to the AI API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add AI response
      setThreads(prev => {
        const aiThread = prev.ai;
        if (!aiThread) return prev;
        
        const updatedMessages: ExpertMessage[] = [
          ...aiThread.messages,
          {
            role: "assistant",
            content: "Danke für Ihre Nachricht! Ich helfe Ihnen gerne mit Ihrem DIY-Projekt. Könnten Sie mir mehr Details zu Ihrem Vorhaben geben?",
            timestamp: new Date(),
            read: true
          }
        ];

        return {
          ...prev,
          ai: {
            ...aiThread,
            messages: updatedMessages,
            lastUpdated: new Date()
          }
        };
      });
    } catch (error) {
      console.error("Error sending message to AI:", error);
    }
  };

  // Send message to expert
  const sendMessageToExpert = async (expertId: string, message: string) => {
    // Add user message
    setThreads(prev => {
      const thread = prev[expertId];
      if (!thread) return prev;

      const updatedMessages: ExpertMessage[] = [
        ...thread.messages,
        {
          role: "user",
          content: message,
          timestamp: new Date(),
          read: true
        }
      ];

      return {
        ...prev,
        [expertId]: {
          ...thread,
          messages: updatedMessages,
          lastUpdated: new Date()
        }
      };
    });

    try {
      // Simulate expert response
      // In a real application, this would notify the expert and handle their response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add expert response
      setThreads(prev => {
        const thread = prev[expertId];
        if (!thread) return prev;

        const expertName = thread.expert?.name ?? "Expert";
        const expertResponses = [
          `Danke für Ihre Nachricht! Ich werde Ihnen so schnell wie möglich antworten.`,
          `Vielen Dank für die Informationen. Haben Sie vielleicht Fotos, die mir bei der Einschätzung helfen könnten?`,
          `Ich verstehe Ihr Problem. Basierend auf Ihrer Beschreibung, empfehle ich folgendes Vorgehen...`,
          `Das klingt nach einem häufigen Problem. Ich kann Ihnen gerne weiterhelfen.`
        ];
        
        const randomResponse = expertResponses[Math.floor(Math.random() * expertResponses.length)];
        
        const updatedMessages: ExpertMessage[] = [
          ...thread.messages,
          {
            role: "assistant",
            content: randomResponse!,
            timestamp: new Date(),
            read: false
          }
        ];

        return {
          ...prev,
          [expertId]: {
            ...thread,
            messages: updatedMessages,
            lastUpdated: new Date()
          }
        };
      });
    } catch (error) {
      console.error("Error sending message to expert:", error);
    }
  };

  // Check if thread has unread messages
  const hasUnreadMessages = (threadId: string): boolean => {
    const thread = threads[threadId];
    if (!thread) return false;
    
    return thread.messages.some(msg => msg.role === "assistant" && !msg.read);
  };

  // Mark all messages in a thread as read
  const markThreadAsRead = (threadId: string) => {
    // Prevent infinite loops by checking if we're already updating this thread
    if (updatingThreadRef.current === threadId) return;
    
    updatingThreadRef.current = threadId;
    
    setThreads(prev => {
      const thread = prev[threadId];
      if (!thread) return prev;
      
      // Check if there are any unread messages before updating
      const hasUnread = thread.messages.some(msg => msg.role === "assistant" && !msg.read);
      if (!hasUnread) return prev;
      
      const updatedMessages = thread.messages.map(msg => ({
        ...msg,
        read: true
      }));
      
      return {
        ...prev,
        [threadId]: {
          ...thread,
          messages: updatedMessages
        }
      };
    });
    
    // Clear the updating ref after a short delay
    setTimeout(() => {
      updatingThreadRef.current = null;
    }, 100);
  };

  // Start a chat with an expert (create thread if it doesn't exist)
  const startExpertChat = (expert: Expert) => {
    // Check if thread already exists
    if (!threads[expert.id]) {
      // Create new thread
      setThreads(prev => ({
        ...prev,
        [expert.id]: {
          expert,
          messages: [
            {
              role: "assistant",
              content: `Hallo! Hier ist ${expert.name}, Ihr ${expert.specialty}. Wie kann ich Ihnen helfen?`,
              timestamp: new Date(),
              read: true
            }
          ],
          lastUpdated: new Date()
        }
      }));
    }
    
    // Set active thread to this expert
    setActiveThread(expert.id);
  };

  // Update threads directly with a new threads record
  const updateThreads = (newThreads: ThreadsRecord) => {
    setThreads(newThreads);
  };

  return (
    <ExpertsContext.Provider
      value={{
        experts,
        filteredExperts,
        selectedExpert,
        activeThread,
        threads,
        setSearchQuery,
        setSelectedSpecialty,
        setSelectedExpert,
        getExpertsByCategory,
        sendMessageToAI,
        sendMessageToExpert,
        setActiveThread,
        hasUnreadMessages,
        markThreadAsRead,
        startExpertChat,
        resetAIChat,
        updateThreads
      }}
    >
      {children}
    </ExpertsContext.Provider>
  );
}

export function useExperts() {
  const context = useContext(ExpertsContext);
  if (context === undefined) {
    throw new Error("useExperts must be used within an ExpertsProvider");
  }
  return context;
} 