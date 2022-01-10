# Ringtool for easy rebalancing big lightning SWAPS

This CMD Tool facilitates the Reblance of big SWAPS

## Advantages

* Gives you an overview wether a Channel has alreasdy been opended before reblancing
* Possibility to set fees to zero, circumventing the gossip protocol (which might be slow for less connected nodes)
* Inserts a default (fake) policy in case no policy for the channel has been propagated.



## Installation

Tested on Raspiblitz and Umbrel!

### Fetching it from the npm Repo

* Check that nodejs is at least version `>v16` (if not update with `sudo npm install -g n && sudo n stable`)
* Install the software globally with `sudo npm install -g ringtoolsjs`

### Build from Source

* Fetch this repo with `git clone url`
* Change in this directory `cd ringtooljs`
* Check whether nodejs is installed with `node -v` (if not install: `sudo apt install nodejs npm`)
* Install dependencies with `npm install`
* To make the Ringtool globally available type `sudo npm install -g`
* Check whether everything is working with  `ringtooljs -h`

```
ringtooljs -h

   ringtooljs 1.0.0 

   USAGE

     ringtooljs <command> [options]

   COMMANDS

     ignite [pubkeys...]      Ignite the ROF (Rebalance Lightning Channels)        
     status [pubkeys...]      Status of Channels of the ROF (whether opened or not)
     help <command>           Display help for a specific command                  

   GLOBAL OPTIONS

     -h, --help         Display help                                      
     -V, --version      Display version                                   
     --no-color         Disable colors                                    
     --quiet            Quiet mode - only displays warn and error messages
     -v, --verbose      Verbose mode - will also output debug messages    

```

## Usage

This tool is based on Balance of Sathosi. Every Command has ARGUMENTS and OPTIONS. In the Help Menu it is always shown whether each commands are mandatory the some default values.

To see the help of commands type `ringtooljs ignite -h`


For example:

```
 USAGE

     ringtooljs ignite [pubkeys...]

   ARGUMENTS

     [pubkeys...]      provide pubkeys in the ROF order separated by comma or newline, your node does not need to be first      optional      

   OPTIONS

     --max-fee-sats <max-fee-sats>             maxfees in sats willing to pay for the rebalance            optional      default: 100                
     --amount-rebalance <amount-reblance>      amount to rebalance                                         optional      default: "Channelcapacity/2"
     -z, --zero-fees                           Force Zero fees                                             optional      default: false              
     -l, --ln-dir <ln-dir>                     Path to lnd directory                                       optional      default: ""                 
     --dry-run <dryrun>                        Dummy Payment is sent to simulate the ROF Igntion           optional                                  
     --pubkey-file <pubkey-file>               When no pubkeys are provide specify a pubkey-file Path      optional                                  

   GLOBAL OPTIONS

     -h, --help         Display help                                      
     -V, --version      Display version                                   
     --no-color         Disable colors                                    
     --quiet            Quiet mode - only displays warn and error messages
     -v, --verbose      Verbose mode - will also output debug messages    

```

To reblance a big SWAP, just put the files in a txt-File:

```shell
cat  pubkeys.txt 

       │ File: pubkeys.txt 
Line   | pubkey,[Telegram Handle]
───────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
1      | 02bc320249b608a53a76cf3cbd448fdd3ab8f3766f96e8649c2edc26cf03bf8277,@LNClash
2      | 02b2d5b1e3167287ea4d1835e5272d99f7beb8c283f7a27d15198270630d3eb23a,@FollowTheWhiteRabbit
3      | 034997db2fa4563a86b0a06103944ad8eb5c2ff013e58afaa90f3de8a7bfd2b6d6,@Mongo
4      | 0258adfbecc79c65f5d32ff0d7e9da6dc5e765140a8e8de7ed5ca0c6a4f6d37fb3,@Spast
5      | 02826f50035eca93c7ebfbad4f9621a8eb201f4e28f994db5b6b5af32a65efb6b9,@ziggie
6      | 02ba62f2cf65a10b9867477f266e67ef7e5f34b8b8b128916497bf54e0603a4693,@Anathos    


```

You can either provide the file with the option --pubkey-file or just do it in the following way:

```shell
ringtooljs status $(cat pubkeys.txt)


┌───────────────────────┬─────────────────────────┬───────────────┬────────────────────────────────────────────────────────────────────┬────────────────┬────────────────┐
│ Telegram Name         │ alias                   │ ChanID        │ Public Key to open Channel with                                    │ Basefee [msat] │ Feerate [ppm]) │
├───────────────────────┼─────────────────────────┼───────────────┼────────────────────────────────────────────────────────────────────┼────────────────┼────────────────┤
│ @ziggie               │ ✅ hippiesabotage       │ 709514x183x2  │ 0258adfbecc79c65f5d32ff0d7e9da6dc5e765140a8e8de7ed5ca0c6a4f6d37fb3 │ 0              │ 150            │
├───────────────────────┼─────────────────────────┼───────────────┼────────────────────────────────────────────────────────────────────┼────────────────┼────────────────┤
│ @Spast                │ ✅ 0258adfbecc79c65f5d3 │ 709567x2332x1 │ 02bc320249b608a53a76cf3cbd448fdd3ab8f3766f96e8649c2edc26cf03bf8277 │ 0              │ -              │
├───────────────────────┼─────────────────────────┼───────────────┼────────────────────────────────────────────────────────────────────┼────────────────┼────────────────┤
│ @LNClash              │ ✅ LNClash              │ 709519x1674x0 │ 02b2d5b1e3167287ea4d1835e5272d99f7beb8c283f7a27d15198270630d3eb23a │ 0              │ 40             │
├───────────────────────┼─────────────────────────┼───────────────┼────────────────────────────────────────────────────────────────────┼────────────────┼────────────────┤
│ @FollowTheWhiteRabbit │ ✅ FollowTheWhiteRabbit │ 709543x1609x0 │ 034997db2fa4563a86b0a06103944ad8eb5c2ff013e58afaa90f3de8a7bfd2b6d6 │ 0              │ 100            │
├───────────────────────┼─────────────────────────┼───────────────┼────────────────────────────────────────────────────────────────────┼────────────────┼────────────────┤
│ @Mongo                │ ✅ 034997db2fa4563a86b0 │ 709522x1475x1 │ 02826f50035eca93c7ebfbad4f9621a8eb201f4e28f994db5b6b5af32a65efb6b9 │ 1000           │ 10             │
└───────────────────────┴─────────────────────────┴───────────────┴────────────────────────────────────────────────────────────────────┴────────────────┴────────────────┘
```

## Commands will be added and the tool further enhanced
