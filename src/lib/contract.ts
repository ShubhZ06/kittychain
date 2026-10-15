// Placeholder — will be replaced after: npm run deploy:monad
// Run `npm run deploy:monad` and this file will be auto-generated with real address + ABI

export const KITTY_PARTY_ADDRESS = "0xE321f1fd9e81e6f347c2CbbC871eeb8fc4b126F6" as `0x${string}`;

export const KITTY_PARTY_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "address[]", "name": "members", "type": "address[]" },
      { "internalType": "uint256", "name": "contributionAmt", "type": "uint256" },
      { "internalType": "uint256", "name": "roundDurationSec", "type": "uint256" }
    ],
    "name": "createGroup",
    "outputs": [{ "internalType": "uint256", "name": "groupId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "groupId", "type": "uint256" }],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "groupId", "type": "uint256" }],
    "name": "triggerPayout",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "groupId", "type": "uint256" }],
    "name": "getGroupInfo",
    "outputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "address", "name": "organizer", "type": "address" },
      { "internalType": "address[]", "name": "members", "type": "address[]" },
      { "internalType": "uint256", "name": "contributionAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "roundDuration", "type": "uint256" },
      { "internalType": "uint256", "name": "currentRound", "type": "uint256" },
      { "internalType": "uint256", "name": "totalRounds", "type": "uint256" },
      { "internalType": "bool", "name": "active", "type": "bool" },
      { "internalType": "uint256", "name": "roundStartTime", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "groupId", "type": "uint256" },
      { "internalType": "uint256", "name": "round", "type": "uint256" },
      { "internalType": "address", "name": "member", "type": "address" }
    ],
    "name": "hasMemberPaid",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "groupId", "type": "uint256" }],
    "name": "getRoundPot",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "groupId", "type": "uint256" }],
    "name": "getCurrentRecipient",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "groupId", "type": "uint256" },
      { "internalType": "uint256", "name": "round", "type": "uint256" }
    ],
    "name": "getMemberContributionStatus",
    "outputs": [
      { "internalType": "address[]", "name": "membersList", "type": "address[]" },
      { "internalType": "bool[]", "name": "paidStatus", "type": "bool[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "groupCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "groupId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "organizer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "contributionAmount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "roundDuration", "type": "uint256" },
      { "indexed": false, "internalType": "address[]", "name": "members", "type": "address[]" }
    ],
    "name": "GroupCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "groupId", "type": "uint256" },
      { "indexed": true, "internalType": "uint256", "name": "round", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "contributor", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "ContributionMade",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "groupId", "type": "uint256" },
      { "indexed": true, "internalType": "uint256", "name": "round", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "RoundPayout",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "groupId", "type": "uint256" }
    ],
    "name": "GroupCompleted",
    "type": "event"
  }
] as const;
