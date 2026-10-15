"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { formatEther } from "viem";
import { KITTY_PARTY_ADDRESS, KITTY_PARTY_ABI } from "@/lib/contract";
import { useState } from "react";

interface GroupDetailProps {
  groupId: bigint;
  onBack: () => void;
}

export function GroupDetail({ groupId, onBack }: GroupDetailProps) {
  const { address } = useAccount();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const { data: info, refetch: refetchInfo } = useReadContract({
    address: KITTY_PARTY_ADDRESS,
    abi: KITTY_PARTY_ABI,
    functionName: "getGroupInfo",
    args: [groupId],
  });

  const { data: potData } = useReadContract({
    address: KITTY_PARTY_ADDRESS,
    abi: KITTY_PARTY_ABI,
    functionName: "getRoundPot",
    args: [groupId],
  });

  const { data: statusData, refetch: refetchStatus } = useReadContract({
    address: KITTY_PARTY_ADDRESS,
    abi: KITTY_PARTY_ABI,
    functionName: "getMemberContributionStatus",
    args: info ? [groupId, info[5]] : [groupId, 0n],
    query: { enabled: !!info },
  });

  const { writeContract: contributeWrite, data: contributeTx, isPending: contributeLoading } = useWriteContract();
  const { writeContract: payoutWrite, data: payoutTx, isPending: payoutLoading } = useWriteContract();

  const { isLoading: contributingConfirming, isSuccess: contributeSuccess } = useWaitForTransactionReceipt({ hash: contributeTx });
  const { isLoading: payoutConfirming, isSuccess: payoutSuccess } = useWaitForTransactionReceipt({ hash: payoutTx });

  if (contributeSuccess) { refetchInfo(); refetchStatus(); showToast("Contribution received successfully"); }
  if (payoutSuccess) { refetchInfo(); refetchStatus(); showToast("Round payout executed successfully"); }

  if (!info) {
    return (
      <div className="empty-view">
        <p>Loading circle details...</p>
      </div>
    );
  }

  const [
    name, organizer, members, contributionAmount,
    roundDuration, currentRound, totalRounds, active
  ] = info;

  const membersList = statusData?.[0] ?? [];
  const paidStatus = statusData?.[1] ?? [];

  const roundProgress = Number(currentRound + 1n) / Number(totalRounds);
  const potFormatted = potData ? formatEther(potData) : "0";
  const contribFormatted = formatEther(contributionAmount);

  const myIndex = members.findIndex(m => m.toLowerCase() === address?.toLowerCase());
  const isMember = myIndex >= 0;
  const myPaid = isMember ? (paidStatus[myIndex] ?? false) : false;
  const currentWinner = active ? members[Number(currentRound)] : null;
  const allPaid = membersList.length > 0 && paidStatus.every(Boolean);

  const handleContribute = () => {
    contributeWrite({
      address: KITTY_PARTY_ADDRESS,
      abi: KITTY_PARTY_ABI,
      functionName: "contribute",
      args: [groupId],
      value: contributionAmount,
    });
  };

  const handlePayout = () => {
    payoutWrite({
      address: KITTY_PARTY_ADDRESS,
      abi: KITTY_PARTY_ABI,
      functionName: "triggerPayout",
      args: [groupId],
    });
  };

  return (
    <div>
      {toastMsg && (
        <div className="toast-box">
          {toastMsg}
        </div>
      )}

      <button className="btn btn-outline btn-sm" style={{ marginBottom: "1.5rem" }} onClick={onBack}>
        Back to Circles
      </button>

      <div className="detail-card">
        <div className="detail-banner">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8rem", marginBottom: "0.5rem" }}>
            <h1 style={{ fontFamily: "Comfortaa", fontSize: "2rem", fontWeight: 700, color: "var(--hk-text-main)" }}>
              {name}
            </h1>
            <span className={`badge ${active ? "badge-active" : "badge-done"}`}>
              {active ? "Active" : "Completed"}
            </span>
          </div>

          <p style={{ color: "var(--hk-text-muted)", fontSize: "0.95rem", fontWeight: 600 }}>
            Current Round Total Pot
          </p>
          <div className="pot-amount">{parseFloat(potFormatted).toFixed(4)} MON</div>
          <p style={{ color: "var(--hk-text-muted)", fontSize: "0.88rem" }}>
            {members.length} members contributing {contribFormatted} MON each
          </p>

          <div style={{ maxWidth: 420, margin: "1.5rem auto 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700, color: "var(--hk-pink-deep)", marginBottom: "0.4rem" }}>
              <span>Round {active ? Number(currentRound) + 1 : Number(totalRounds)} of {Number(totalRounds)}</span>
              <span>{Math.round(roundProgress * 100)}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-thumb" style={{ width: `${roundProgress * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="detail-inner">
          {/* Left Column: Contributions */}
          <div>
            {active && currentWinner && (
              <div style={{
                background: "var(--hk-pink-subtle)",
                border: "2px solid var(--hk-border)",
                borderRadius: "20px",
                padding: "1.25rem",
                marginBottom: "1.5rem",
                textAlign: "center"
              }}>
                <span className="input-label" style={{ color: "var(--hk-red-bow)" }}>
                  Current Round Recipient
                </span>
                <p style={{ fontFamily: "monospace", fontSize: "0.92rem", fontWeight: 700, color: "var(--hk-text-main)", marginTop: "0.3rem" }}>
                  {currentWinner.toLowerCase() === address?.toLowerCase() ? "You " : ""}
                  ({currentWinner.slice(0, 8)}...{currentWinner.slice(-6)})
                </p>
              </div>
            )}

            <div className="hk-card" style={{ marginBottom: "1.5rem" }}>
              <h3 className="card-title-text" style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
                Member Status
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {membersList.map((member, i) => {
                  const isMe = member.toLowerCase() === address?.toLowerCase();
                  const paid = paidStatus[i];
                  return (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 1rem",
                      borderRadius: "14px",
                      background: paid ? "#e6fcf5" : "#fff5f8",
                      border: `1.5px solid ${paid ? "#a4eddf" : "var(--hk-border)"}`,
                    }}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 700, color: "var(--hk-text-main)" }}>
                        {isMe ? "You " : `Member ${i + 1} `}
                        ({member.slice(0, 6)}...{member.slice(-4)})
                      </span>
                      <span className={`badge ${paid ? "badge-active" : "badge-done"}`}>
                        {paid ? "Paid" : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {active && isMember && !myPaid && (
              <button
                className="btn btn-primary btn-full"
                onClick={handleContribute}
                disabled={contributeLoading || contributingConfirming}
              >
                {contributeLoading || contributingConfirming
                  ? "Processing Contribution..."
                  : `Contribute ${contribFormatted} MON`}
              </button>
            )}

            {active && isMember && myPaid && (
              <div style={{
                textAlign: "center",
                padding: "0.9rem",
                background: "#e6fcf5",
                border: "2px solid #a4eddf",
                borderRadius: "16px",
                color: "var(--hk-green)",
                fontWeight: 800,
                fontSize: "0.92rem"
              }}>
                Contribution confirmed for this round
              </div>
            )}

            {active && allPaid && (
              <button
                className="btn btn-primary btn-full"
                style={{ marginTop: "1rem", background: "linear-gradient(135deg, #ff2a5f, #f43f7a)" }}
                onClick={handlePayout}
                disabled={payoutLoading || payoutConfirming}
              >
                {payoutLoading || payoutConfirming
                  ? "Releasing Payout..."
                  : "Release Round Payout"}
              </button>
            )}
          </div>

          {/* Right Column: Timeline & Details */}
          <div>
            <div className="hk-card" style={{ marginBottom: "1.5rem" }}>
              <h3 className="card-title-text" style={{ fontSize: "1.1rem", marginBottom: "1.2rem" }}>
                Payout Sequence
              </h3>
              <div className="round-timeline">
                {members.map((member, i) => {
                  const isCurrent = active && i === Number(currentRound);
                  const isMe = member.toLowerCase() === address?.toLowerCase();

                  return (
                    <div key={i} className={`timeline-step ${isCurrent ? "current" : ""}`}>
                      <div className="step-num">{i + 1}</div>
                      <div className="step-content">
                        <div className="step-name">
                          {isMe ? "You" : `Member ${i + 1}`}
                          {isCurrent && <span style={{ marginLeft: "0.5rem", color: "var(--hk-red-bow)", fontSize: "0.78rem" }}>Current Round</span>}
                        </div>
                        <div className="step-wallet">
                          {member.slice(0, 10)}...{member.slice(-8)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="hk-card">
              <h3 className="card-title-text" style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
                Circle Information
              </h3>
              <div className="data-list">
                <div className="data-row">
                  <span className="data-label">Organizer</span>
                  <span className="data-val" style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                    {organizer.slice(0, 8)}...{organizer.slice(-6)}
                  </span>
                </div>
                <div className="data-row">
                  <span className="data-label">Per Member</span>
                  <span className="data-val data-val-highlight">{contribFormatted} MON</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Total Rounds</span>
                  <span className="data-val">{Number(totalRounds)}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Network</span>
                  <span className="data-val">Monad Testnet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
