#! /bin/bash

# 批处理命令，此文件只是为了方便操作，不是一个必要执行的命令

# recompile
#yarn hardhat compile
#yarn hardhat typechain

# transfer ETH to test users
#ts-node scripts/ts-node/get-some-eth.ts

# 先生成safe的多签合约

# deployment
#yarn hardhat run scripts/deployment/deploy-create-nft-contract.ts
#yarn hardhat run scripts/deployment/deploy-distribution-policy-v1.ts
#yarn hardhat run scripts/deployment/deploy-creation-nft.ts # 不需要部署这个合约
#yarn hardhat run scripts/deployment/deploy-magnifier-nft.ts
#yarn hardhat run scripts/deployment/deploy-magnifier-nft-airdrop.ts
#yarn hardhat run scripts/deployment/deploy-nft-battle.ts
#yarn hardhat run scripts/deployment/deploy-nft-battle-pool.ts
#yarn hardhat run scripts/deployment/deploy-aggressive-bid-pool.ts
#yarn hardhat run scripts/deployment/deploy-aggressive-bid-distribution.ts
#yarn hardhat run scripts/deployment/deploy-aggressive-bid.ts

# use case test
#yarn hardhat test --no-compile test/contracts/ysgg-token-test.ts
#yarn hardhat test --no-compile test/contracts/sggc-nft-test.ts
#yarn hardhat test --no-compile test/contracts/sggcd-nft-test.ts
yarn hardhat test --no-compile test/contracts/ysgh-pool-test.ts
yarn hardhat test --no-compile test/contracts/ysgh-market-test.ts