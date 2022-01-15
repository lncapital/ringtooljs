const asyncAuto = require('async/auto');
const asyncMap = require('async/map');
const uniq = arr => Array.from(new Set(arr));
const { returnResult } = require('asyncjs-util');
const lnService = require('ln-service');
const { chanNumber, routeFromChannels } = require('bolt07');
const fs = require('fs')
const displayStatus = require('./display_status')
const { reorderPubkeys } = require('./helper')
const renderTable = require('table').table;
const inquirer = require('inquirer');


const { getBorderCharacters } = require('table');
const border = getBorderCharacters('norc');

const notNull = array => array.filter(n => n !== null);
const { bold } = require('colorette');
const { type } = require('os');
const { listenerCount } = require('process');

// (A) FLATTEN OBJECT FUNCTION
// CREDITS: https://gist.github.com/penguinboy/762197
const flatten = function (o) {
  var tempA = {};
  for (let i in o) {
    if ((typeof o[i]) == 'object') {
      var tempB = flatten(o[i]);
      for (let j in tempB) { tempA[j] = tempB[j]; }
    } else { tempA[i] = o[i]; }
  }
  return tempA;
};

const default_policy =
{
  base_fee_mtokens: '0',
  cltv_delta: 40,
  fee_rate: 1,
  base_fee_mtokens: '1000'
}


/** Ignite Channels 

  {
    pubkey_file: <List of Pubkeys in the Order the swap will take place>
    [is_zerofee]: <set all fees for the reblance to zero>
    amountReblance: <Amount to Reblance>
    lnDir: <Path to lnd directory if not standard is used>
    maxFeeSats: <Max Fees you are willing to pay for the Reblance>
    logger: <Winston Logger Object> ({info}) => ()
    pubkeys: <Pubkeys in case no file is provided>
    dryrun: <Query the Route but don't make the Payment
  }

  @returns via cbk or Promise
  {
    route: {
      fee:,           
      fee_mtokens:,
      hops: [],
      mtokens:,
      tokens:
    }
  }
**/





module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {


        if (!args.lnd) {
          return cbk([400, 'ExpectedLndToRebalnceChannels']);
        }

        if (!args.logger) {
          return cbk([400, 'ExpectedLoggerToRebalnceChannels']);
        }

        if (!(args.pubkey_file) && !(args.pubkeys)) {
          return cbk([400, 'ExpectedPublicKeysToRebalnceChannels']);
        }


        return cbk();
      },
      // Get channels
      getpubkeys: ['validate', ({ }, cbk) => {

        var pubkey_array = [];
        var telegram_array = []
        let = regexp = /^[0-9a-fA-F]/;

        if (!!args.pubkey_file) {
          try {
            filedata = fs.readFileSync(args.pubkey_file, 'utf8');
            lines = filedata.split(/\r?\n/);
            lines.forEach((line) => {

              pk = line.split(',')[0]


              if (regexp.test(pk) && pk.length == 66) {
                pubkey_array.push(line)
              }
            })
          } catch (err) {
            return cbk(err)
          }
        }
        else if (!!args.pubkeys) {
         
          pubkey_array = args.pubkeys.filter(n => {
            pk = n.split(',')[0]
            return (regexp.test(pk) && pk.length == 66)
          })

        }



        return lnService.getWalletInfo({ lnd: args.lnd }, (err, result) => {

          if (!!err) {
            return cbk(err);
          }
          try {

            const nodePublicKey = result.public_key
            const reorderd_pubkeys = reorderPubkeys(pubkey_array, nodePublicKey)
            return cbk(null, { reorderd_pubkeys, nodePublicKey });

          }
          catch (err) {
           
            return cbk(err)
          }
        })
      }],


      getchannels: ['getpubkeys', async ({ getpubkeys }) => {



        const reorderd_pubkeys = getpubkeys.reorderd_pubkeys.map(n => n.split(',')[0]);
        const nodePublicKey = getpubkeys.nodePublicKey;
        const telegram_array = getpubkeys.reorderd_pubkeys.map(n => n.split(',')[1]);



        var channelsROF = []


        try {


          for (let i = 0; i < reorderd_pubkeys.length; i++) {


            const publicKey = reorderd_pubkeys[i];
            const publicKeyPartner = reorderd_pubkeys[(i + 1) % reorderd_pubkeys.length];
            const telegramName = telegram_array[(i) % telegram_array.length]

            const result = await lnService.getNode({ lnd: args.lnd, public_key: publicKey })

            const channel = result.channels.filter(n => {
              return (n.policies.find(n => n.public_key === publicKeyPartner));
            }).reduce((acc, curr) => curr, undefined);


            if (!!channel) {
              const channelinformation = channel.policies.find(n => n.public_key === publicKey)
              channelsROF.push({ is_available: true, from_telegram: telegramName, alias: result.alias, chanid: channel.id, from_pubkey: publicKey, to_pubkey: publicKeyPartner, channel: channelinformation })
            } else {
              channelsROF.push({ is_available: false, from_telegram: telegramName, alias: undefined, chanid: undefined, from_pubkey: publicKey, to_pubkey: publicKeyPartner, channel: {} })
            }

          };

        }
        catch (error) { args.logger.error(error) }


        return {
          nodePublicKey: nodePublicKey || undefined,
          channels: channelsROF || undefined,
        }


      }],


      ignition: ['validate', 'getchannels', async ({ getchannels }) => {


        const finalChannels = getchannels.channels.map(n => {
          if (!!n.chanid) {
            try {
              n.chanid_normal = chanNumber({ channel: n.chanid }).number;
              return flatten(n)
            } catch (err) {
              return;
            }
          }
          return flatten(n)
        })

        const table = {
          rows: []
            .concat([notNull([
              'Telegram Name',
              'alias',
              'ChanID',
              'Public Key to open Channel with',
              'Basefee [msat]',
              'Feerate [ppm])',
              null
            ]).map(n => bold(n))])
            .concat((finalChannels.map(channel => {

              const chanid = channel.chanid
              const chanidNormal = channel.chanid_normal
              const telegramName = channel.from_telegram
              const baseFee = channel.base_fee_mtokens
              const feeRate = channel.fee_rate
              const pubkey = channel.to_pubkey
              let alias = { display: 'Missing Channel' }
              if (!!channel.is_available) {
                alias = displayStatus({
                  alias: channel.alias,
                  is_inbound_disabled: channel.is_disabled,
                });
              }

              return notNull([
                telegramName || 'No Name available',
                alias.display || ' ',
                chanid || '-',
                pubkey || '-',
                baseFee || '-',
                feeRate || '-',
                null
              ]);
            }))),
        }



        if (finalChannels.filter(n => !n.is_available).length > 0) {

          args.logger.info(renderTable(table['rows'], { border }));
          return cbk([400, 'NoIgnitionPossibleMissingChannel']);
        }

        //Create route 


        const channelsForRouting = await asyncMap(finalChannels, async (n) => {
          try {

            let channel = await lnService.getChannel({ lnd: args.lnd, id: n.chanid })

            for (let i in channel.policies) {

              //replace with fake policy
            
              if (!channel.policies[i].fee_rate) {
              
                channel.policies[i] = default_policy;
                channel.policies[i].public_key = n.from_pubkey;
                if(args.verbose){
                  args.logger.info(`Inserted Fake-Policy for Channel for ${channel}`)
                }
                break;
              }
            }

            return channel;

          } catch (err) {
            return;
          }
        });

        if (!!args.is_zerofee) {

          for (let i = 0; i < channelsForRouting.length; i++) {
            channelsForRouting[i].policies[0].base_fee_mtokens = '0'
            channelsForRouting[i].policies[0].fee_rate = 0
            channelsForRouting[i].policies[1].base_fee_mtokens = '0'
            channelsForRouting[i].policies[1].fee_rate = 0

          }
        }

        const height = (await lnService.getHeight({ lnd: args.lnd })).current_block_height;
        let amount_sats = 1;
        if (args.amountReblance === 'Channelcapacity/2') {
          amount_sats = channelsForRouting[0].capacity / 2
        } else {
          amount_sats = parseInt(args.amountReblance)
          amount_sats = Math.min(amount_sats, channelsForRouting[0].capacity / 2);
        }
        const mtokens = String(amount_sats * 1000);
        const invoice = await lnService.createInvoice({ lnd: args.lnd, mtokens });
        const payment = invoice.payment
        const imtokens = invoice.mtokens
        const id_payment = invoice.id


        var { route } = await routeFromChannels({ channels: channelsForRouting, destination: getchannels.nodePublicKey, cltv_delta: 200, height: height, messages: [], mtokens: imtokens, payment: payment, total_mtokens: imtokens });

        if(args.verbose){
          console.log()
          args.logger.info("Route Before Passing it to LND:")
          args.logger.info(route)
          console.log()
        }

        if (route.fee > args.maxFeeSats) {

          const answer = await inquirer.prompt([
            {
              type: 'confirm',
              default: false,
              choices: ["yes", "no"],
              message: `Fees are higher than expected ${route.fee} Sats, your Maxfee was ${args.maxFeeSats} Sats, do you still want to ignite the Balance of ${amount_sats}?`,
              name: "feeTarget"
            }
          ])

          if (!answer.feeTarget) {
            return ([400, 'TargetFeesAreTooLow']);
          }

        }

        try {
          if (args.dryrun) {
            
            const result = (await lnService.payViaRoutes({ lnd: args.lnd, routes: [route] }));
            
            return (null, [{Route: route.hops}, bold(`Reblance Amount in Satoshis: ${route.tokens}`), bold(`Fees to pay for the Rebalance in Satoshis: ${route.fee}`)])

          } else {
            args.logger.info('Ignition in 1 2 3 🚀')
            const result = await lnService.payViaRoutes({ lnd: args.lnd, id: id_payment, routes: [route] });
            args.logger.info('Success ✅: Payment with the Details:')
            
            return (null, [{Route: route.hops}, bold(`Reblance Amount in Satoshis: ${route.tokens}`), bold(`Fees to pay for the Rebalance in Satoshis: ${route.fee}`)])

          }


        }
        catch (err) {
          if (!!err.find(o => o === 'UnknownPaymentHash')) {
            args.logger.info('Reblance would be successful ✅')

            return (null, [{Route: route.hops}, bold(`Reblance Amount in Satoshis: ${route.tokens}`), bold(`Fees to pay for the Rebalance in Satoshis: ${route.fee}`)])
          } else {
            flattenobject = flatten(err)
            const problemChannel = finalChannels.find(n => n.chanid === flattenobject.channel)
            return {
              error_code: flattenobject['0'],
              error: flattenobject['1'],
              channel_index: flattenobject.index,
              channelinfo: problemChannel
            }
          }

        }


      }],
    },
      returnResult({ reject, resolve, of: 'ignition' }, cbk))
  });
};

