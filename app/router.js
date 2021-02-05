'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get(
    '/api/lot/getRewardedLotteries',
    controller.home.getRewardedLotteries
  );
  router.get(
    '/api/lot/getRewardedLotteriesInBatch',
    controller.home.getRewardedLotteriesInBatch
  );
};
