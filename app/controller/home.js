'use strict';

const Controller = require('../core/baseController');
const AElf = require('aelf-sdk');
const config = require('../common/constants');

let lotteryContract;

const aelf = new AElf(
  new AElf.providers.HttpProvider(config.httpProvider, config.fetchTimeout)
);

const wallet = AElf.wallet.getWalletByPrivateKey(config.commonPrivateKey);

async function init() {
  lotteryContract = await aelf.chain.contractAt(config.lotteryContract, wallet);
}

init();

async function GetRewardedLotteries(obj) {
  const { offset, limit, address } = obj;
  let rewardedList = [],
    of = offset,
    code = 1;
  while (rewardedList.length < limit) {
    const result = await lotteryContract.GetLotteries.call({
      offset: of,
      limit,
      address,
    });
    const { lotteries } = result || {};
    if (Array.isArray(lotteries)) {
      of = of + lotteries.length;
      const list = lotteries.filter(item => {
        const { noDraw, reward, cashed, expired } = item;
        return !noDraw && reward && reward > 0 && !cashed && !expired;
      });
      rewardedList = rewardedList.concat(list);
      if (lotteries.length < limit) {
        code = -1;
        break;
      }
    } else {
      code = -1;
      break;
    }
  }
  return {
    rewardedList,
    code,
    offset: of,
  };
}

async function GetRewardedLotteriesInBatch(obj) {
  const { offset, limit, address } = obj;
  let rewardedList = [],
    code = 1,
    of = offset;
  while (rewardedList.length < limit) {
    const result = await lotteryContract.GetRewardedLotteriesInBatch.call({
      offset: of,
      address,
    });
    const { lotteries, offset: offsetCode } = result || {};
    if (Array.isArray(lotteries)) {
      of = offsetCode === -1 ? -1 : offsetCode + 1;
      rewardedList = rewardedList.concat(lotteries);
      if (offsetCode === -1) {
        code = offsetCode;
        break;
      }
    } else {
      code = -1;
      break;
    }
  }
  return {
    rewardedList,
    code,
    offset: of,
  };
}

class HomeController extends Controller {
  async getRewardedLotteries() {
    if (!lotteryContract) await init();
    const { address, offset = 0, limit = 20 } = this.ctx.request.query;
    try {
      this.sendBody(
        await GetRewardedLotteries({
          offset: Number(offset),
          limit: Number(limit),
          address,
        })
      );
    } catch (error) {
      this.error(error);
    }
  }
  async getRewardedLotteriesInBatch() {
    if (!lotteryContract) await init();
    const { address, offset = 0, limit = 20 } = this.ctx.request.query;
    try {
      this.sendBody(
        await GetRewardedLotteriesInBatch({
          offset: Number(offset),
          limit: Number(limit),
          address,
        })
      );
    } catch (error) {
      this.error(error);
    }
  }
}

module.exports = HomeController;
