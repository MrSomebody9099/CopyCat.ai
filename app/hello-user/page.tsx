"use client";

import { useEffect, useState } from 'react';
import HelloUser from "@/app/components/HelloUser";

export default function HelloPage() {
  const [userInfo, setUserInfo] = useState<{ userName: string; userId: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve user info from sessionStorage
    const storedUserInfo = sessionStorage.getItem('helloUserUserInfo');
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo({
          userName: parsedUserInfo.displayName || parsedUserInfo.username || "User",
          userId: parsedUserInfo.id
        });
      } catch (error) {
        console.error("Error parsing user info:", error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen" style={{ background: "#1a1a1a" }}><p className="text-white">Loading...</p></div>;
  }

  return <HelloUser initialUserName={userInfo?.userName} initialUserId={userInfo?.userId} />;
}