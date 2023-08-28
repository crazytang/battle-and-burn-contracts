import {DistributionStructs} from "../../typechain-types/CreationNFT";
import UserRewardDataStructOutput = DistributionStructs.UserRewardDataStructOutput;
import {BigNumber, BigNumberish, BytesLike} from "ethers";
import {bnToDate, bnToNoPrecisionNumber, bnToNumber} from "./contract-utils";
import DistributionRoleStructOutput = DistributionStructs.DistributionRoleStructOutput;
import {AggressiveBidStructs} from "../../typechain-types/AggressiveBid";
import OrderStruct = AggressiveBidStructs.OrderStruct;
import InputStruct = AggressiveBidStructs.InputStruct;
import MerkleTreeStruct = AggressiveBidStructs.MerkleTreeStruct;
import {PromiseOrValue} from "../../typechain-types/common";

export interface DistributionData {
    creator: string
    original_element_creator: string
    element_creators: string[]
    element_quote_element_creators: string[]
}
export const fetchToDistributionData = (data: DistributionRoleStructOutput): DistributionData => {
    return {
        creator: data.creator,
        original_element_creator: data.original_element_creator,
        element_creators: data.element_creators,
        element_quote_element_creators: data.element_quote_element_creators
    }
}
export interface UserRewardData {
    user_address: string
    claimable_amount: BigNumber
    claimable_amount_dec: number
    claimed_amount: BigNumber
    claimed_amount_dec: number
    last_claimed_at: number
    last_claimed_at_date: String
}
export const fetchToUserRewardData = (data: UserRewardDataStructOutput): UserRewardData => {
    return {
        user_address: data.user_address,
        claimable_amount: data.claimable_amount,
        claimable_amount_dec: bnToNumber(data.claimable_amount),
        claimed_amount: data.claimed_amount,
        claimed_amount_dec: bnToNumber(data.claimed_amount),
        last_claimed_at: bnToNoPrecisionNumber(data.last_claimed_at),
        last_claimed_at_date: bnToDate(data.last_claimed_at)
    }
}

export interface RoyaltyInfo {
    royalty_recipient: string
    royalty_amount: BigNumber
    royalty_amount_dec: number
}

export const fetchToRoyaltyInfo = (data: any): RoyaltyInfo => {
    return {
        royalty_recipient: data[0],
        royalty_amount: data[1],
        royalty_amount_dec: bnToNumber(data[1])
    }
}

export const fetchToDistributedResult = (data: any): {} => {
    let result = []
    for (let i = 0; i < data[0].length; i++) {
        result.push({address:data[0][i], amount: bnToNumber(data[1][i])})
    }

    return result
}

export interface NFTData {
    nftAddress: string
    tokenId: number
    amount: number
    stakedAt: number
    stakedAtDate: string
    isFrozen: boolean
    beneficiaryAddress: string
}

export const fetchToNFTData = (data: any): NFTData => {
    return {
        nftAddress: data['nftAddress'],
        tokenId: bnToNoPrecisionNumber(data['tokenId']),
        amount: bnToNoPrecisionNumber(data['amount']),
        stakedAt: bnToNoPrecisionNumber(data['stakedAt']),
        stakedAtDate: bnToDate(data['stakedAt']),
        isFrozen: data['isFrozen'],
        beneficiaryAddress: data['beneficiaryAddress']
    }
}

export interface MatchData {
    matchId: string
    matchStartTime: number
    matchEndTime: number
    voteCount: number
    voteArenaCount: number
    voteChallengeCount: number
    arenaOwner: string
    arenaNFT: string
    arenaTokenId: number
    challengeOwner: string
    challengeNFT: string
    challengeTokenId: number
    merkleTreeRoot: string
    winner: Winner
    determinedAt: number
}
export enum Winner {
    Arena, Challenge
}

export const fetchToMatchData = (data: any): MatchData => {
    return {
        matchId: data['matchId'],
        matchStartTime: bnToNoPrecisionNumber(data['matchStartTime']),
        matchEndTime: bnToNoPrecisionNumber(data['matchEndTime']),
        voteCount: bnToNoPrecisionNumber(data['voteCount']),
        voteArenaCount: bnToNoPrecisionNumber(data['voteArenaCount']),
        voteChallengeCount: bnToNoPrecisionNumber(data['voteChallengeCount']),
        arenaOwner: data['arenaOwner'],
        arenaNFT: data['arenaNFT'],
        arenaTokenId: bnToNoPrecisionNumber(data['arenaTokenId']),
        challengeOwner: data['challengeOwner'],
        challengeNFT: data['challengeNFT'],
        challengeTokenId: bnToNoPrecisionNumber(data['challengeTokenId']),
        merkleTreeRoot: data['merkleTreeRoot'],
        winner: data['winner'],
        determinedAt: bnToNoPrecisionNumber(data['determinedAt'])
    }
}

export interface MatchDataV2 {
    voteCount: number
    voteArenaCount: number
    voteChallengeCount: number
    arenaOwner: string
    arenaNFT: string
    arenaTokenId: number
    challengeOwner: string
    challengeNFT: string
    challengeTokenId: number
    merkleTreeRoot: string
    winner: string
    determinedAt: number
}


export const fetchToMatchDataV2 = (data: any): MatchDataV2 => {
    return {
        voteCount: bnToNoPrecisionNumber(data['voteCount']),
        voteArenaCount: bnToNoPrecisionNumber(data['voteArenaCount']),
        voteChallengeCount: bnToNoPrecisionNumber(data['voteChallengeCount']),
        arenaOwner: data['arenaOwner'],
        arenaNFT: data['arenaNFT'],
        arenaTokenId: bnToNoPrecisionNumber(data['arenaTokenId']),
        challengeOwner: data['challengeOwner'],
        challengeNFT: data['challengeNFT'],
        challengeTokenId: bnToNoPrecisionNumber(data['challengeTokenId']),
        merkleTreeRoot: data['merkleTreeRoot'],
        winner: data['winner'],
        determinedAt: bnToNoPrecisionNumber(data['determinedAt'])
    }
}
export interface MatchDataParam {
    matchId: string
    matchListTime: number
    matchStartTime: number
    matchEndTime: number
    voteCount: number
    voteArenaCount: number
    voteChallengeCount: number
    arenaJPG: string
    arenaOwner: string
    arenaNFT: string
    arenaTokenId: number
    arenaOwnerSignature: string
    challengeJPG: string
    challengeOwner: string
    challengeNFT: string
    challengeTokenId: number
    challengeOwnerSignature: string
    merkleTreeURI: string
    merkleTreeRoot: string
    extraSignature: string
}
export interface UserVote  {
    matchId: string
    voter: string
    votedNFT: string
    votedTokenId: number
    votedJPG: string
    NFTOwner: string
    votedAt: number
    extraSignature: string
}
export interface ApprovalData {
    userAddress: string
    spender: string
    tokenId: number
    nonce: number
    deadline: number
    v: number
    r: string
    s: string
}

export interface BidPoolUserStakedData {
    userAddress: string
    nftStakedDataList: NFTStakedData[]
    balance: number
}

export interface NFTStakedData {
    nftAddress: string
    tokenId : number
    amount: number
}

export const fetchToBidPoolUserStakedData = (data: any): BidPoolUserStakedData => {
    let nftStakedDataList = []
    for (let i = 0; i < data['nftStakedDataList'].length; i++) {
        nftStakedDataList.push({
            nftAddress: data['nftStakedDataList'][i]['nftAddress'],
            tokenId: bnToNoPrecisionNumber(data['nftStakedDataList'][i]['tokenId']),
            amount: bnToNoPrecisionNumber(data['nftStakedDataList'][i]['amount'])
        })
    }
    return {
        userAddress: data['userAddress'],
        nftStakedDataList: nftStakedDataList,
        balance: bnToNumber(data['balance'])
    }
}

export interface UserNFTStakedData {
    userAddress: string
    nftAddress: string
    tokenId: number
    amount: number
    lastTradedAt: number
    lastTradedAtDate: string
}

export const fetchToUserNFTStakedData = (data: any): UserNFTStakedData => {
    return {
        userAddress: data['userAddress'],
        nftAddress: data['nftAddress'],
        tokenId: bnToNoPrecisionNumber(data['tokenId']),
        amount: bnToNoPrecisionNumber(data['amount']),
        lastTradedAt: bnToNoPrecisionNumber(data['lastTradedAt']),
        lastTradedAtDate: bnToDate(data['lastTradedAt'])
    }
}

export const fetchToUserNFTStakedDataList = (data: any): UserNFTStakedData[] => {
    let result = []
    for (let i = 0; i < data.length; i++) {
        result.push(fetchToUserNFTStakedData(data[i]))
    }
    return result
}

export enum OrderSide {
    BUY, SELL
}

export enum OrderType {
    FixedPrice, EnglishAuction, DutchAuction
}

export enum AssetType {ERC721, ERC1155}

export interface Order extends OrderStruct {
    tokenId_dec: number
    amount_dec: number
    price_dec: number
    listingTime_date: string
    expirationTime_date: string
    extraParams_obj: any
}

export interface InputData extends InputStruct {
    order: OrderStruct;
    v: number;
    r: string;
    s: string;
    merkleTree: MerkleTreeStruct;
    blockNumber: BigNumber;
}

export interface InputDataV2 {
    order: AggressiveOrder;
    v: number
    r: string
    s: string
    extraSignature: string
    merkleTree: MerkleTreeData
    blockNumber: number
}

export interface MerkleTreeData {
    root: string;
    proof: string[];
};
export interface AggressiveOrder  {
    trader: string
    side: OrderSide
    orderType: OrderType
    collection: string
    assetType: AssetType
    tokenId: number
    amount: number
    paymentToken: string
    price: BigNumber
    listingTime: number
    expirationTime: number
    trader_nonce: number
}