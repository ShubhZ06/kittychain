"use client";

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { monadTestnet } from "@/lib/wagmi";

export function Navbar() {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address, chainId: monadTestnet.id });

  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const wrongNetwork = isConnected && chain?.id !== monadTestnet.id;

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <div className="logo-brand">
            <svg className="logo-bow" viewBox="0 0 100 100" fill="currentColor">
              {/* Cute bow icon SVG */}
              <circle cx="50" cy="50" r="14" />
              <path d="M 40 46 C 25 30 10 32 12 50 C 14 68 25 70 40 54 Z" />
              <path d="M 60 46 C 75 30 90 32 88 50 C 86 68 75 70 60 54 Z" />
              <circle cx="36" cy="48" r="4" fill="#ffffff" opacity="0.6" />
              <circle cx="64" cy="48" r="4" fill="#ffffff" opacity="0.6" />
            </svg>
            KittyChain
          </div>

          <div className="nav-actions">
            {isConnected && (
              <>
                {balance && (
                  <span className="balance-pill">
                    {parseFloat(balance.formatted).toFixed(4)} MON
                  </span>
                )}

                {wrongNetwork && (
                  <span className="network-alert">
                    Switch to Monad Testnet
                  </span>
                )}

                <div className="connected-badge">
                  <span className="status-dot" />
                  {shortAddr}
                </div>

                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => disconnect()}
                >
                  Disconnect
                </button>
              </>
            )}

            {!isConnected && (
              <button
                className="btn btn-primary"
                onClick={() => connect({ connector: connectors[0], chainId: monadTestnet.id })}
              >
                Connect MetaMask
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
