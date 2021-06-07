import { generateMnemonicAndSeed } from "./wallet-seed.js";
import { DERIVATION_PATH, getAccountFromSeed } from "./account.js";
import chalk from "chalk";
import { Connection, PublicKey } from "@solana/web3.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
const argv = yargs(process.argv[2]).argv;

if (!argv.p) {
  throw new Error("invalid start args");
}

process.on("message", (msg) => {
  if (msg.stop) {
    process.exit(0);
  }
});

(async () => {
  await bruteForceFindAddress(argv.p);
  process.send("found");
})();

async function bruteForceFindAddress(prefix) {
  try {
    let accountAddress = null;
    let seedString = null;
    let i = 0;
    while (true) {
      let seed = await generateMnemonicAndSeed();
      let account = getAccountFromSeed(
        seed.seed,
        0,
        DERIVATION_PATH.bip44Change
      );
      let address = account.publicKey.toBase58();
      // console.log(`current seed: ${seed.seed}`);
      // console.log(`address: ${address}`);
      if (address.toLowerCase().startsWith(prefix.toLowerCase())) {
        console.log(chalk.red("found!"));
        accountAddress = address;
        seedString = seed.mnemonic;
        break;
      }
      // console.clear();
      i++;
    }
    console.log("");
    console.log(chalk.green(seedString));
    console.log(chalk.green(accountAddress));
    console.log(`total iterations: ${i}`);
  } catch (e) {
    console.log(e);
  }
}
