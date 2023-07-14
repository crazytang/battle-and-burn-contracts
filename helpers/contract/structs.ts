import {DistributionStructs} from "../../typechain-types/CreationNFT";
import UserRewardDataStructOutput = DistributionStructs.UserRewardDataStructOutput;
import {BigNumber} from "ethers";
import {bnToDate, bnToNoPrecisionNumber, bnToNumber} from "./contract-utils";
import DistributionRoleStructOutput = DistributionStructs.DistributionRoleStructOutput;

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