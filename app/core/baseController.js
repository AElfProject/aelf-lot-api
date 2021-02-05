'use strict';
/**
 * @file base controller
 */
const { Controller } = require('egg');

class BaseController extends Controller {
  sendBody(data = {}) {
    this.ctx.body = {
      msg: 'success',
      code: 0,
      ...this.ctx.body,
      data,
    };
  }

  error(err) {
    const { Error } = err || {};
    const errors = Array.isArray(err) ? err : [ err.toString() ];
    this.ctx.body = {
      msg: err.message || errors[0].message || Error.Message,
      code: err.code || 500,
      errors,
      ...(Error || {}),
    };
  }

  validate(rule) {
    this.ctx.validate(rule);
  }

  notFound(msg) {
    msg = msg || 'not found';
    this.ctx.throw(404, msg);
  }
}
module.exports = BaseController;
