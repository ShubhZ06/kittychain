"use client";

import { useState } from "react";
import { useAccount, useReadContract, useConnect } from "wagmi";
import { Navbar } from "@/components/Navbar";
import { GroupCard } from "@/components/GroupCard";
import { GroupDetail } from "@/components/GroupDetail";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { KITTY_PARTY_ADDRESS, KITTY_PARTY_ABI } from "@/lib/contract";
import { monadTestnet } from "@/lib/wagmi";

type Tab = "all" | "mine";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();

  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [selectedGroup, setSelectedGroup] = useState<bigint | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [, setRefreshKey] = useState(0);

  const { data: groupCount, refetch: refetchCount } = useReadContract({
    address: KITTY_PARTY_ADDRESS,
    abi: KITTY_PARTY_ABI,
    functionName: "groupCount",
  });

  const totalGroups = groupCount ? Number(groupCount) : 0;
  const allGroupIds = Array.from({ length: totalGroups }, (_, i) => BigInt(totalGroups - i));

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-tag">
            Monad Testnet · Chain ID 10143
          </div>

          <h1 className="hero-title">
            Decentralized Kitty Party,<br />
            <span className="hero-title-accent">Trustless Savings Circles</span>
          </h1>

          <p className="hero-description">
            Pool funds transparently with your trusted circle on the Monad network.
            Automated rotating distribution with zero intermediaries.
          </p>

          {isConnected ? (
            <button
              className="btn btn-primary"
              style={{ fontSize: "1.05rem", padding: "0.9rem 2.2rem" }}
              onClick={() => setShowCreate(true)}
            >
              Start a Kitty Circle
            </button>
          ) : (
            <button
              className="btn btn-primary"
              style={{ fontSize: "1.05rem", padding: "0.9rem 2.2rem" }}
              onClick={() => connect({ connector: connectors[0], chainId: monadTestnet.id })}
            >
              Connect MetaMask
            </button>
          )}

          <div className="hero-stats">
            <div className="stat-chip">
              Monad Testnet Active
            </div>
            <div className="stat-chip">
              {totalGroups} Circles Deployed
            </div>
            <div className="stat-chip">
              Zero Intermediary
            </div>
          </div>
        </div>
      </section>

      {/* Concept Architecture Cards */}
      {!isConnected && (
        <section className="container">
          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-badge-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="feature-title">Form the Circle</h3>
              <p className="feature-desc">
                Register participant wallet addresses. The order of registration defines the sequence of payouts.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-badge-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <h3 className="feature-title">Pool Contributions</h3>
              <p className="feature-desc">
                Each cycle, every member deposits their specified MON quota directly into the smart contract escrow.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-badge-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <h3 className="feature-title">Guaranteed Distribution</h3>
              <p className="feature-desc">
                Once all members contribute, the complete collected pot transfers immediately to that round's recipient.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Main App Content */}
      {isConnected && (
        <section className="container section-content">
          {selectedGroup !== null ? (
            <GroupDetail
              groupId={selectedGroup}
              onBack={() => setSelectedGroup(null)}
            />
          ) : (
            <>
              <div className="section-top">
                <div className="tab-pill-group">
                  <button
                    className={`tab-pill ${activeTab === "all" ? "active" : ""}`}
                    onClick={() => setActiveTab("all")}
                  >
                    All Circles
                  </button>
                  <button
                    className={`tab-pill ${activeTab === "mine" ? "active" : ""}`}
                    onClick={() => setActiveTab("mine")}
                  >
                    My Circles
                  </button>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreate(true)}
                >
                  Create Circle
                </button>
              </div>

              {totalGroups === 0 ? (
                <div className="empty-view hk-card">
                  <h3 className="card-title-text" style={{ marginBottom: "0.5rem" }}>
                    No Circles Available
                  </h3>
                  <p style={{ color: "var(--hk-text-muted)", marginBottom: "1.5rem" }}>
                    Be the first to start a Kitty Party circle on the Monad network.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCreate(true)}
                  >
                    Create First Circle
                  </button>
                </div>
              ) : (
                <div className="cards-grid">
                  {allGroupIds.map(id => (
                    <GroupCard
                      key={id.toString()}
                      groupId={id}
                      onClick={() => setSelectedGroup(id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            refetchCount();
            setRefreshKey(k => k + 1);
          }}
        />
      )}

      {/* Footer */}
      <footer className="footer-bar">
        <p>
          KittyChain · Monad Testnet ·{" "}
          <a
            href={`https://testnet.monadexplorer.com/address/${KITTY_PARTY_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--hk-red-bow)", fontWeight: 700, textDecoration: "none" }}
          >
            Contract on Explorer
          </a>
        </p>
      </footer>
    </>
  );
}
