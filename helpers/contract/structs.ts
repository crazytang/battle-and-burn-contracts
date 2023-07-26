import {DistributionStructs} from "../../typechain-types/CreationNFT";
import UserRewardDataStructOutput = DistributionStructs.UserRewardDataStructOutput;
import {BigNumber} from "ethers";
import {bnToDate, bnToNoPrecisionNumber, bnToNumber} from "./contract-utils";
import DistributionRoleStructOutput = DistributionStructs.DistributionRoleStructOutput;
import {nowTimestamp} from "../utils";
import {ethers} from "hardhat";
import {string} from "hardhat/internal/core/params/argumentTypes";

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
        stakedAtDate: bnToDate(data[3]),
        isFrozen: data['isFrozen'],
        beneficiaryAddress: data['beneficiaryAddress']
    }
}

export interface MatchData {
    matchId: string
    matchName: string
    matchStartTime: number
    matchEndTime: number
    voteCount: number
    voteArenaCount: number
    voteChallengeCount: number
    arenaNFT: string
    arenaTokenId: number
    arenaOwnerSignature: string
    challengeNFT: string
    challengeTokenId: number
    challengeOwnerSignature: string
    merkleTreeURI: string
    merkleTreeRoot: string
    burnedAt: number
}

export const fetchToMatchData = (data: any): MatchData => {
    return {
        matchId: data['matchId'],
        matchName: data['matchName'],
        matchStartTime: bnToNoPrecisionNumber(data['matchStartTime']),
        matchEndTime: bnToNoPrecisionNumber(data['matchEndTime']),
        voteCount: bnToNoPrecisionNumber(data['voteCount']),
        voteArenaCount: bnToNoPrecisionNumber(data['voteArenaCount']),
        voteChallengeCount: bnToNoPrecisionNumber(data['voteChallengeCount']),
        arenaNFT: data['arenaNFT'],
        arenaTokenId: bnToNoPrecisionNumber(data['arenaTokenId']),
        arenaOwnerSignature: data['arenaOwnerSignature'],
        challengeNFT: data['challengeNFT'],
        challengeTokenId: bnToNoPrecisionNumber(data['challengeTokenId']),
        challengeOwnerSignature: data['challengeOwnerSignature'],
        merkleTreeURI: data['merkleTreeURI'],
        merkleTreeRoot: data['merkleTreeRoot'],
        burnedAt: bnToNoPrecisionNumber(data['burnedAt'])
    }
}