"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import PremiumLock from "@/components/PremiumLock";
import { FamilyMember, FamilyRequest } from "./types";

import FamilyHeader from "./FamilyHeader";
import PendingRequests from "./PendingRequests";
import FamilyStats from "./FamilyStats";
import FamilyMembersGrid from "./FamilyMembersGrid";
import AddMemberModal from "./AddMemberModal";

export default function FamilyDashboard() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [requests, setRequests] = useState<FamilyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [membersRes, requestsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/family/members`, { headers }),
        axios
          .get(`${process.env.NEXT_PUBLIC_API_URL}/family/requests`, { headers })
          .catch(() => ({ data: { requests: [] } })),
      ]);

      if (membersRes.data.success) {
        setMembers(membersRes.data.members);
      }
      if (requestsRes.data && requestsRes.data.success) {
        setRequests(requestsRes.data.requests);
      }
    } catch (error) {
      console.error("Error fetching family data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRespond = async (familyId: string, action: "accept" | "reject") => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/family/respond`,
        { familyId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      console.error("Error responding", error);
      alert("Action failed: Response could not be transmitted.");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen bg-white">
        <FamilyHeader onAddMember={() => setShowAddModal(true)} />

        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto pb-20 space-y-12">
          <PremiumLock
            title="Family Health Ecosystem"
            description="Monitor real-time vitals, historical clinical trends, and receive high-priority health alerts for your dependents."
          >
            <PendingRequests requests={requests} onRespond={handleRespond} />

            <FamilyStats members={members} />

            <FamilyMembersGrid
              members={members}
              loading={loading}
              onAddMember={() => setShowAddModal(true)}
            />
          </PremiumLock>
        </div>

        {showAddModal && (
          <AddMemberModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              fetchData();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
