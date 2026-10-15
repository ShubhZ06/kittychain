"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { KITTY_PARTY_ADDRESS, KITTY_PARTY_ABI } from "@/lib/contract";

interface CreateGroupModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const DURATION_OPTIONS = [
  { label: "1 minute (testing)", value: 60 },
  { label: "1 day", value: 86400 },
  { label: "1 week", value: 604800 },
  { label: "2 weeks", value: 1209600 },
  { label: "1 month", value: 2592000 },
];

export function CreateGroupModal({ onClose, onSuccess }: CreateGroupModalProps) {
  const { address } = useAccount();

  const [name, setName] = useState("");
  const [members, setMembers] = useState<string[]>([address || "", ""]);
  const [contribution, setContribution] = useState("");
  const [duration, setDuration] = useState(60);
  const [error, setError] = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const addMember = () => setMembers([...members, ""]);
  const removeMember = (i: number) => {
    if (members.length <= 2) return;
    setMembers(members.filter((_, idx) => idx !== i));
  };
  const updateMember = (i: number, val: string) => {
    const updated = [...members];
    updated[i] = val;
    setMembers(updated);
  };

  const handleCreate = async () => {
    setError("");
    if (!name.trim()) { setError("Please provide a name for your circle."); return; }
    const validMembers = members.filter(m => m.trim().startsWith("0x") && m.trim().length === 42);
    if (validMembers.length < 2) { setError("Please enter at least 2 valid wallet addresses (0x...)."); return; }
    if (!contribution || parseFloat(contribution) <= 0) { setError("Please enter a valid MON contribution."); return; }

    try {
      writeContract({
        address: KITTY_PARTY_ADDRESS,
        abi: KITTY_PARTY_ABI,
        functionName: "createGroup",
        args: [
          name.trim(),
          validMembers as `0x${string}`[],
          parseEther(contribution),
          BigInt(duration),
        ],
      });
    } catch (e: any) {
      setError(e.message || "Transaction creation failed");
    }
  };

  if (isSuccess) {
    onSuccess();
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h2 className="card-title-text" style={{ fontSize: "1.4rem" }}>
            New Kitty Circle
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="form-field">
          <label className="input-label">Circle Name</label>
          <input
            className="text-input"
            placeholder="e.g. Afternoon Tea Club"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="input-label">Contribution per Member (MON)</label>
          <input
            className="text-input"
            type="number"
            min="0"
            step="0.001"
            placeholder="e.g. 0.05"
            value={contribution}
            onChange={e => setContribution(e.target.value)}
          />
          <p className="input-help">Amount deposited by every participant each cycle</p>
        </div>

        <div className="form-field">
          <label className="input-label">Cycle Duration</label>
          <select
            className="select-input"
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
          >
            {DURATION_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="input-label">
            Member Wallets — Payout Order ({members.length})
          </label>
          <p className="input-help" style={{ marginBottom: "0.6rem" }}>
            Round 1 goes to Member 1, Round 2 to Member 2, in sequence.
          </p>
          <div>
            {members.map((m, i) => (
              <div key={i} className="address-row">
                <input
                  className="text-input"
                  placeholder={`Member ${i + 1} address (0x...)`}
                  value={m}
                  onChange={e => updateMember(i, e.target.value)}
                  style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                />
                {members.length > 2 && (
                  <button className="btn btn-outline btn-sm" onClick={() => removeMember(i)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="btn btn-outline btn-sm" style={{ marginTop: "0.5rem" }} onClick={addMember}>
            Add Another Member
          </button>
        </div>

        {error && (
          <div style={{
            background: "#ffe3e3",
            border: "1.5px solid #ff8787",
            borderRadius: "14px",
            padding: "0.8rem 1.1rem",
            color: "#d6336c",
            fontSize: "0.88rem",
            marginBottom: "1.2rem",
            fontWeight: 700
          }}>
            {error}
          </div>
        )}

        {name && contribution && members.filter(m => m.length === 42).length >= 2 && (
          <div style={{
            background: "var(--hk-pink-subtle)",
            border: "2px solid var(--hk-border)",
            borderRadius: "18px",
            padding: "1rem",
            marginBottom: "1.4rem",
            textAlign: "center"
          }}>
            <p style={{ fontSize: "0.85rem", color: "var(--hk-text-muted)", fontWeight: 700 }}>
              Calculated Pot per Round
            </p>
            <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--hk-red-bow)", marginTop: "0.2rem" }}>
              {(parseFloat(contribution || "0") * members.filter(m => m.length === 42).length).toFixed(4)} MON
            </p>
          </div>
        )}

        <button
          className="btn btn-primary btn-full"
          onClick={handleCreate}
          disabled={isPending || isConfirming}
        >
          {isPending || isConfirming ? "Confirming on Monad..." : "Create Circle on Monad"}
        </button>
      </div>
    </div>
  );
}
