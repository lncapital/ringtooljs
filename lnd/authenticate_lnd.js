const asyncAuto = require('async/auto');
const { authenticatedLndGrpc } = require('ln-service');
const { returnResult } = require('asyncjs-util');
//Copyright (c) 2021 Balance of Satoshi 
const lndCredentials = require('./lnd_credentials');

/** Authenticated LND

  {
    [logger]: <Winston Logger Object>
    [node]: <Node Name String>
  }

  @returns via cbk or Promise
  {
    lnd: <Authenticated LND gRPC API Object>
  }
*/
module.exports = ({ logger, node, lnDir }, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Credentials

      credentials: cbk => {
        lndCredentials({ logger, node, lnDir }, cbk)
      },

      // Lnd
      lnd: ['credentials', ({ credentials }, cbk) => {

        console.log(credentials.socket)
        console.log()

        return cbk(null, authenticatedLndGrpc({
          cert: credentials.cert,
          macaroon: credentials.macaroon,
          socket: credentials.socket,
        }));
      }],
    },

      returnResult({ reject, resolve, of: 'lnd' }, cbk));

  });
};
