# Ringtool for easy rebalancing big lightning SWAPS

This CMD Tool facilitates the Reblance of big SWAPS

## Advantages

* Gives you an overview wether a Channel has alreasdy been opended before reblancing
* Possibility to set fees to zero, circumventing the gossip protocol (which might be slow for less connected nodes)
* Inserts a default (fake) policy in case no policy for the channel has be propagated.



## Installation

Tested on Raspiblitz and Umbrel!

* Fetch this repo with `git clone url`
* Change in this directory `cd ringtool`
* Check whether nodejs is installed with `node -v` (if not install: `sudo apt install nodejs npm`)
* Install dependencies with `npm install`
* To make the Ringtool available type `sudo npm install -g`
* Check whether everything is working with  `ringtool -h`

```
ringtool -h

   ringtool 1.0.0 

   USAGE

     ringtool <command> [options]

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

This tool is based on Balance of Sathosi. Every Command has ARGUMENTS and OPTIONS. In the Help Menu it is always shown whether which commands are mandatory the some default values.

To see the help of commands type `ringtool ignite -h`


For example:

```
 USAGE

     ringtool ignite [pubkeys...]

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
cat bos_channels.txt

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

You can either provide the file with the option --pubkey-file or just to it in the following way:

```shell
ringtool ignite $(cat pubkeys.txt) --dryrun --zero-fees
```


## Commands will be added and the tool further enhanced