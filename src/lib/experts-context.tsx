"use client";

import React, { createContext, useContext, useState, useMemo, useCallback, useRef } from "react";

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

export interface ExpertMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  read: boolean;
  type?: "text" | "payment_request";
  paymentDetails?: {
    amount: number;
    description: string;
    status: "pending" | "paid" | "cancelled";
    paymentId: string;
  };
}

export interface ChatThread {
  expert?: Expert;
  messages: ExpertMessage[];
  lastUpdated: Date;
}

export type ThreadsRecord = Record<string, ChatThread>;

export const SPECIALTIES = [
  "Sanitär",
  "Elektrik",
  "Tischlerei",
  "Malerei",
  "Allgemeiner Handwerker",
];

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
    },
    {
      role: "assistant",
      content: "Basierend auf Ihrer Beschreibung, schlage ich vor, dass ich vorbeikomme und die Steckdose überprüfe. Die Kosten belaufen sich auf 60€ pro Stunde.",
      timestamp: new Date(Date.now() - 84000000),
      read: true
    },
    {
      role: "user",
      content: "Ja, das wäre gut. Können Sie heute noch vorbeikommen?",
      timestamp: new Date(Date.now() - 83000000),
      read: true
    },
    {
      role: "assistant",
      content: "Ich kann heute Nachmittag um 14:00 Uhr vorbeikommen. Bitte bestätigen Sie den Termin durch Zahlung der Vorabgebühr.",
      timestamp: new Date(Date.now() - 82000000),
      read: true,
      type: "payment_request",
      paymentDetails: {
        amount: 60,
        description: "Vorabgebühr für Elektrikerbesuch",
        status: "pending",
        paymentId: "PAY-123456"
      }
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

const createInitialThreads = (): ThreadsRecord => {
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

  const threads: ThreadsRecord = {
    "ai": aiThread
  };

  const alexExpert = MOCK_EXPERTS.find(expert => expert.id === "1");
  if (alexExpert) {
    const alexMessages = expertConversations["1"] ?? [];
    threads[alexExpert.id] = {
      expert: alexExpert,
      messages: alexMessages,
      lastUpdated: new Date()
    };
  }

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
  
  const updatingThreadRef = useRef<string | null>(null);

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

  const getExpertsByCategory = useCallback((category: string) => {
    return experts.filter(expert => expert.categories.includes(category));
  }, [experts]);

  const resetAIChat = useCallback(() => {
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

  const sendMessageToAI = async (message: string) => {
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

  const sendMessageToExpert = async (expertId: string, message: string) => {
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setThreads(prev => {
        const thread = prev[expertId];
        if (!thread) return prev;

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

  const hasUnreadMessages = (threadId: string): boolean => {
    const thread = threads[threadId];
    if (!thread) return false;
    
    return thread.messages.some(msg => msg.role === "assistant" && !msg.read);
  };

  const markThreadAsRead = (threadId: string) => {
    if (updatingThreadRef.current === threadId) return;
    
    updatingThreadRef.current = threadId;
    
    setThreads(prev => {
      const thread = prev[threadId];
      if (!thread) return prev;
      
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
    
    setTimeout(() => {
      updatingThreadRef.current = null;
    }, 100);
  };

  const startExpertChat = (expert: Expert) => {
    if (!threads[expert.id]) {
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
    
    setActiveThread(expert.id);
  };

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