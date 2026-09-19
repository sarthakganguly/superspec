import React, { useState, useEffect } from "react";
import axios from "axios";
import { SignoffButton } from "./SignoffButton";
import { CheckCircle, ShieldAlert, Circle, User as UserIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface Gate5Props {
  projectId: string;
}

interface ProjectMember {
  user_id: string;
  email: string;
  role: string;
}

interface Signoff {
  user_id: string;
  gate_name: string;
  signed_at: string;
}

export const Gate5Signoff = ({ projectId }: Gate5Props) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [signoffs, setSignoffs] = useState<Signoff[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const [reportRes, signoffRes, membersRes] = await Promise.all([
        axios.get(`/api/projects/${projectId}/traceability`),
        axios.get(`/api/projects/${projectId}/signoffs`),
        axios.get(`/api/projects/${projectId}/members`)
      ]);
      setIsValid(reportRes.data.is_valid);
      setSignoffs(signoffRes.data.filter((s: any) => s.gate_name === "Traceability"));
      setMembers(membersRes.data);
    } catch (error) {
      console.error("Error fetching signoff status", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [projectId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading sign-off status...</div>;

  const hasSignedOff = (userId: string) => signoffs.some(s => s.user_id === userId);
  const isFullySignedOff = members.length > 0 && members.every(m => hasSignedOff(m.user_id));
  const currentUserSignedOff = user ? hasSignedOff(user.id) : false;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Gate 5: Consensus Sign-off</h2>
        {isFullySignedOff ? (
          <p className="text-green-600 font-medium max-w-md mx-auto">
            All team members have cryptographically signed off. The project baseline is immutable and ready for export.
          </p>
        ) : (
          <p className="text-gray-500 max-w-md mx-auto">
            Signing off will record your identity and generate a SHA-256 hash of all requirements. Export is disabled until all members sign off.
          </p>
        )}
      </div>
      
      {!isValid && !isFullySignedOff && (
        <div className="mb-8 mx-auto max-w-lg p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 flex items-start">
          <ShieldAlert className="mr-3 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm">
            Traceability errors exist. Requirements must be valid before you can sign off. Please check Gate 4.
          </p>
        </div>
      )}
      
      <div className="max-w-2xl mx-auto border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
        <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Required Signatures</h3>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {signoffs.length} / {members.length} Signed
          </span>
        </div>
        
        <ul className="divide-y divide-gray-200">
          {members.map(member => {
            const signed = hasSignedOff(member.user_id);
            const isCurrentUser = user && member.user_id === user.id;
            
            return (
              <li key={member.user_id} className={`px-6 py-4 flex items-center justify-between ${isCurrentUser && !signed ? 'bg-blue-50' : 'bg-white'}`}>
                <div className="flex items-center space-x-4">
                  {signed ? (
                    <CheckCircle className="text-green-500 h-6 w-6" />
                  ) : (
                    <Circle className="text-gray-300 h-6 w-6" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 flex items-center">
                      {member.email}
                      {isCurrentUser && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">You</span>}
                    </p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                </div>
                
                <div>
                  {signed ? (
                    <span className="text-sm text-green-600 font-medium">Signed</span>
                  ) : isCurrentUser ? (
                    <SignoffButton 
                      projectId={projectId} 
                      gateName="Traceability" 
                      disabled={!isValid}
                      onSuccess={fetchStatus}
                    />
                  ) : (
                    <span className="text-sm text-gray-400">Pending</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
