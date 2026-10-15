"use client";

import { useReadContract, useAccount } from "wagmi";
import { formatEther } from "viem";
import { KITTY_PARTY_ADDRESS, KITTY_PARTY_ABI } from "@/lib/contract";

interface GroupCardProps {
  groupId: bigint;
  onClick: () => void;
}

export function GroupCard({ groupId, onClick }: GroupCardProps) {
  const { address } = useAccount();

  const { data: info } = useReadContract({
    address: KITTY_PARTY_ADDRESS,
    abi: KITTY_PARTY_ABI,
    functionName: "getGroupInfo",
    args: [groupId],
  });

  const { data: pot } = useReadContract({
    address: KITTY_PARTY_ADDRESS,
    abi: KITTY_PARTY_ABI,
    functionName: "getRoundPot",
    args: [groupId],
  });

  if (!info) {
    return (
      <div className="hk-card" style={{ padding: "2.5rem", textAlign: "center", color: "var(--hk-text-muted)" }}>
        Loading circle...
      </div>
    );
  }

  const [name, organizer, members, contributionAmount, , currentRound, totalRounds, active] = info;

  const isMember = members.some(m => m.toLowerCase() === address?.toLowerCase());
  const isOrganizer = organizer.toLowerCase() === address?.toLowerCase();
  const progress = Number(currentRound + 1n) / Number(totalRounds);

  return (
    <div className="hk-card card-clickable" onClick={onClick}>
      <div className="card-header-bar">
        <div>
          <h3 className="card-title-text">{name}</h3>
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.4rem" }}>
            {isOrganizer && <span className="badge-role">Organizer</span>}
            {isMember && !isOrganizer && <span className="badge-role">Member</span>}
          </div>
        </div>
        <span className={`badge ${active ? "badge-active" : "badge-done"}`}>
          {active ? "Active" : "Completed"}
        </span>
      </div>

      <div className="data-list">
        <div className="data-row">
          <span className="data-label">Pot Size</span>
          <span className="data-val data-val-highlight">
            {pot ? parseFloat(formatEther(pot)).toFixed(4) : "0"} MON
          </span>
        </div>
        <div className="data-row">
          <span className="data-label">Contribution</span>
          <span className="data-val">{parseFloat(formatEther(contributionAmount)).toFixed(4)} MON</span>
        </div>
        <div className="data-row">
          <span className="data-label">Current Round</span>
          <span className="data-val">
            Round {active ? Number(currentRound) + 1 : Number(totalRounds)} of {Number(totalRounds)}
          </span>
        </div>
      </div>

      <div className="progress-track">
        <div className="progress-thumb" style={{ width: `${progress * 100}%` }} />
      </div>
      <div style={{ fontSize: "0.8rem", color: "var(--hk-text-muted)", textAlign: "right", marginTop: "0.4rem", fontWeight: 700 }}>
        {members.length} members · {Math.round(progress * 100)}% complete
      </div>
    </div>
  );
}
