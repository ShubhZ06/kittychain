// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title KittyParty
 * @notice Decentralized Kitty Party (ROSCA) on Monad Testnet.
 *         A group of members contributes a fixed amount each round.
 *         Each round, one member receives the entire pot in a rotating order.
 * @dev No external oracle needed. Order is fixed at group creation.
 */
contract KittyParty {

    // ─── Structs ──────────────────────────────────────────────────────────────

    struct Group {
        uint256 id;
        string  name;
        address organizer;
        address[] members;
        uint256 contributionAmount;
        uint256 roundDuration;
        uint256 currentRound;
        uint256 roundStartTime;
        bool    active;
        mapping(uint256 => mapping(address => bool)) hasPaid;
        mapping(uint256 => bool)                     roundPaid;
        uint256 totalRounds;
    }

    // ─── State ────────────────────────────────────────────────────────────────

    uint256 public groupCount;
    mapping(uint256 => Group) private groups;

    // ─── Events ───────────────────────────────────────────────────────────────

    event GroupCreated(
        uint256 indexed groupId,
        string  name,
        address indexed organizer,
        uint256 contributionAmount,
        uint256 roundDuration,
        address[] members
    );
    event ContributionMade(
        uint256 indexed groupId,
        uint256 indexed round,
        address indexed contributor,
        uint256 amount
    );
    event RoundPayout(
        uint256 indexed groupId,
        uint256 indexed round,
        address indexed recipient,
        uint256 amount
    );
    event GroupCompleted(uint256 indexed groupId);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error NotAMember();
    error AlreadyPaid();
    error WrongAmount();
    error GroupNotActive();
    error RoundAlreadyPaidOut();
    error NotAllMembersPaid();
    error GroupAlreadyCompleted();
    error OnlyOrganizer();
    error TooFewMembers();

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyActive(uint256 groupId) {
        if (!groups[groupId].active) revert GroupNotActive();
        _;
    }

    // ─── Core Functions ───────────────────────────────────────────────────────

    function createGroup(
        string calldata name,
        address[] calldata members,
        uint256 contributionAmt,
        uint256 roundDurationSec
    ) external returns (uint256 groupId) {
        if (members.length < 2) revert TooFewMembers();
        require(contributionAmt > 0, "Contribution must be > 0");
        require(roundDurationSec > 0, "Round duration must be > 0");

        groupId = ++groupCount;
        Group storage g = groups[groupId];

        g.id                 = groupId;
        g.name               = name;
        g.organizer          = msg.sender;
        g.members            = members;
        g.contributionAmount = contributionAmt;
        g.roundDuration      = roundDurationSec;
        g.currentRound       = 0;
        g.roundStartTime     = block.timestamp;
        g.active             = true;
        g.totalRounds        = members.length;

        emit GroupCreated(groupId, name, msg.sender, contributionAmt, roundDurationSec, members);
    }

    function contribute(uint256 groupId) external payable onlyActive(groupId) {
        Group storage g = groups[groupId];

        if (!_isMember(g, msg.sender))               revert NotAMember();
        if (msg.value != g.contributionAmount)        revert WrongAmount();
        if (g.hasPaid[g.currentRound][msg.sender])   revert AlreadyPaid();

        g.hasPaid[g.currentRound][msg.sender] = true;

        emit ContributionMade(groupId, g.currentRound, msg.sender, msg.value);
    }

    function triggerPayout(uint256 groupId) external onlyActive(groupId) {
        Group storage g = groups[groupId];

        uint256 round = g.currentRound;

        if (g.roundPaid[round])     revert RoundAlreadyPaidOut();
        if (!_allPaid(g, round))    revert NotAllMembersPaid();

        g.roundPaid[round] = true;

        address recipient = g.members[round];
        uint256 pot       = g.contributionAmount * g.members.length;

        if (round + 1 >= g.totalRounds) {
            g.active = false;
            emit GroupCompleted(groupId);
        } else {
            g.currentRound   = round + 1;
            g.roundStartTime = block.timestamp;
        }

        emit RoundPayout(groupId, round, recipient, pot);

        (bool ok, ) = recipient.call{value: pot}("");
        require(ok, "Transfer failed");
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getGroupInfo(uint256 groupId)
        external
        view
        returns (
            string  memory name,
            address        organizer,
            address[] memory members,
            uint256        contributionAmount,
            uint256        roundDuration,
            uint256        currentRound,
            uint256        totalRounds,
            bool           active,
            uint256        roundStartTime
        )
    {
        Group storage g = groups[groupId];
        return (
            g.name, g.organizer, g.members,
            g.contributionAmount, g.roundDuration,
            g.currentRound, g.totalRounds,
            g.active, g.roundStartTime
        );
    }

    function hasMemberPaid(uint256 groupId, uint256 round, address member)
        external view returns (bool)
    {
        return groups[groupId].hasPaid[round][member];
    }

    function getRoundPot(uint256 groupId) external view returns (uint256) {
        Group storage g = groups[groupId];
        return g.contributionAmount * g.members.length;
    }

    function getCurrentRecipient(uint256 groupId) external view returns (address) {
        Group storage g = groups[groupId];
        require(g.currentRound < g.members.length, "All rounds done");
        return g.members[g.currentRound];
    }

    function getMemberContributionStatus(uint256 groupId, uint256 round)
        external view
        returns (address[] memory membersList, bool[] memory paidStatus)
    {
        Group storage g = groups[groupId];
        membersList = g.members;
        paidStatus  = new bool[](g.members.length);
        for (uint256 i = 0; i < g.members.length; i++) {
            paidStatus[i] = g.hasPaid[round][g.members[i]];
        }
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _isMember(Group storage g, address addr) internal view returns (bool) {
        for (uint256 i = 0; i < g.members.length; i++) {
            if (g.members[i] == addr) return true;
        }
        return false;
    }

    function _allPaid(Group storage g, uint256 round) internal view returns (bool) {
        for (uint256 i = 0; i < g.members.length; i++) {
            if (!g.hasPaid[round][g.members[i]]) return false;
        }
        return true;
    }
}
