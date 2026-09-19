import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./useAuth";

export const useProjectRole = (projectId: string) => {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !projectId) return;

    const fetchRole = async () => {
      try {
        const res = await axios.get(`/api/projects/${projectId}/members`);
        const members = res.data;
        const currentMember = members.find((m: any) => m.user_id === user.id);
        if (currentMember) {
          setRole(currentMember.role);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("Failed to fetch project role", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, [user, projectId]);

  const canEditGate = (gateRole: string) => {
    if (role === "PROJECT_ADMIN") return true;
    return role === gateRole;
  };

  return { role, loading, canEditGate };
};
