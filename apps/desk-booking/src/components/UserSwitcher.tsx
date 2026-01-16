"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Users, UserCircle } from "lucide-react";

export interface User {
  id: string;
  name: string;
  role: "admin" | "user";
}

const DEFAULT_USER: User = {
  id: "user-1",
  name: "Neo Anderson",
  role: "user",
};

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  openSwitcher: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("desk-booking-user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
      }
    }
  }, []);

  const handleSetUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("desk-booking-user", JSON.stringify(newUser));
    setIsSwitcherOpen(false);
  };

  if (!mounted) return null;

  return (
    <UserContext.Provider value={{ user, setUser: handleSetUser, openSwitcher: () => setIsSwitcherOpen(true) }}>
      {children}
      <UserSwitcherDialog 
        isOpen={isSwitcherOpen} 
        onClose={() => setIsSwitcherOpen(false)} 
        currentUser={user}
        onSelect={handleSetUser}
      />
      
      {/* Floating Switcher Trigger */}
      <div className="fixed bottom-4 left-4 z-50">
        <Button 
          onClick={() => setIsSwitcherOpen(true)}
          variant="outline"
          className="bg-black/80 backdrop-blur border-teal-500/30 text-teal-400 hover:bg-teal-900/50 hover:text-teal-200 shadow-lg rounded-full px-4 h-10 gap-2 transition-all font-mono text-xs uppercase tracking-wide"
        >
          <UserCircle size={14} />
          {user.name}
        </Button>
      </div>
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}

interface UserSwitcherDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelect: (user: User) => void;
}

function UserSwitcherDialog({ isOpen, onClose, currentUser, onSelect }: UserSwitcherDialogProps) {
  const [newUserName, setNewUserName] = useState("");

  const PRESET_USERS: User[] = [
    { id: "user-1", name: "Neo Anderson", role: "user" },
    { id: "user-2", name: "Trinity", role: "user" },
    { id: "user-3", name: "Morpheus", role: "admin" },
  ];

  const handleCreateTemp = () => {
    if (!newUserName) return;
    onSelect({
      id: `user-${Date.now()}`,
      name: newUserName,
      role: "user",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel border-teal-500/20 text-teal-50">
        <DialogHeader>
          <DialogTitle className="text-teal-400 font-mono uppercase tracking-widest flex items-center gap-2">
            <Users size={16} /> Identity Switch
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <label className="text-xs text-teal-600 font-mono uppercase">Detected Signatures</label>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_USERS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => onSelect(u)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    currentUser.id === u.id 
                      ? "bg-teal-500/20 border-teal-400 text-teal-100 shadow-[0_0_15px_rgba(20,184,166,0.1)]" 
                      : "bg-teal-950/20 border-teal-800/50 text-teal-400 hover:bg-teal-900/40 hover:border-teal-600/50"
                  }`}
                >
                  <span className="font-bold">{u.name}</span>
                  <span className="text-[10px] font-mono opacity-60 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                    {u.role.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-teal-800/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0c0f0e] px-2 text-teal-700 font-mono">Or create new identity</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Input 
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Enter alias..."
              className="bg-teal-950/30 border-teal-800 focus-visible:ring-teal-500 text-teal-100 font-mono placeholder:text-teal-800"
            />
            <Button 
                onClick={handleCreateTemp}
                disabled={!newUserName}
                className="bg-teal-700 hover:bg-teal-600 text-white"
            >
                Connect
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
