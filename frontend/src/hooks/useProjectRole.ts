import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./useAuth";

export const useProjectRole = (projectId: string) => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(Boolean(user && projectId));

  useEffect(() => {
    if (!user || !projectId) return;

    let active = true;
    const fetchRole = async () => {
      try {
        const res = await axios.get(`/api/projects/${projectId}/members`);
        if (!active) return;
        const members = res.data;
        const userMembers = members.filter((m: { user_id: string; role: string }) => m.user_id === user.id);
        const userRoles = userMembers.map((m: { user_id: string; role: string }) => m.role);
        setRoles(userRoles);
      } catch (error) {
        console.error("Failed to fetch project role", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchRole();
    return () => {
      active = false;
    };
  }, [user, projectId]);

  const isGlobalAdmin = user?.role === "ADMIN";
  const isProjectAdmin = isGlobalAdmin || roles.includes("PROJECT_ADMIN");

  const canEditGate = (gateRole: string) => {
    if (isGlobalAdmin || isProjectAdmin) return true;

    const aliases: Record<string, string[]> = {
      GATE_1_OWNER: ["GATE_1_OWNER", "BUSINESS_REQUIREMENT_OWNER"],
      BUSINESS_REQUIREMENT_OWNER: ["GATE_1_OWNER", "BUSINESS_REQUIREMENT_OWNER"],
      GATE_2_OWNER: ["GATE_2_OWNER", "DATA_DICTIONARY_OWNER"],
      DATA_DICTIONARY_OWNER: ["GATE_2_OWNER", "DATA_DICTIONARY_OWNER"],
      GATE_3_OWNER: ["GATE_3_OWNER", "USER_STORY_OWNER"],
      USER_STORY_OWNER: ["GATE_3_OWNER", "USER_STORY_OWNER"],
      GATE_5_OWNER: ["GATE_5_OWNER", "REQUIREMENT_SIGN_OFF_OWNER"],
      REQUIREMENT_SIGN_OFF_OWNER: ["GATE_5_OWNER", "REQUIREMENT_SIGN_OFF_OWNER"],
      PROJECT_ADMIN: ["PROJECT_ADMIN"],
    };

    const targetRoles = aliases[gateRole] || [gateRole];
    return targetRoles.some((r) => roles.includes(r));
  };

  return {
    roles,
    role: roles[0] || (isProjectAdmin ? "PROJECT_ADMIN" : null),
    isProjectAdmin,
    loading,
    canEditGate,
  };
};
