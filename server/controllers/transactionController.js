import { Core, Blaze } from "@blaze-cardano/sdk";
import { U5C } from "@utxorpc/blaze-provider";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { C } from "lucid-cardano";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const API_URL = process.env.UTXORPC_URL || "https://preview.utxorpc-v0.demeter.run";

const provider = new U5C({
  url: API_URL,
  headers: {
    "dmtr-api-key": process.env.DMTR_API_KEY,
  },
});

export const createTransaction = async (req, res) => {
  try {
    const { recipientAddress, amount, address, assetId } = req.body;

    const coreAddress = Core.Address.fromBech32(address);
    const wallet = {
      address: address,
      getUnspentOutputs: async () =>
        await provider.getUnspentOutputs(coreAddress),
      getChangeAddress: async () => coreAddress,
      getUnspentOutputsWithAsset: async (assetId) =>
        await provider.getUnspentOutputsWithAsset(coreAddress, assetId),
      getNetworkId: async () => 0,
    };

    const blaze = await Blaze.from(provider, wallet);
    const utxos = await provider.getUnspentOutputs(coreAddress);
    console.log("utxos", utxos);
    let tx = blaze.newTransaction();

    if (assetId === "lovelace") {
      tx = tx.payLovelace(
        Core.Address.fromBech32(recipientAddress),
        BigInt(amount * 1_000_000)
      );
    } else {

      const [policyId, assetNameHex] = assetId.split(".");

      const properAssetId = AssetId.fromParts(policyId, assetNameHex);
      console.log("Proper Asset ID:", properAssetId);

      const coreValue = {
        coins: 2_000_000n,
        assets: new Map([[properAssetId, BigInt(amount)]]),
      };

      const value = Core.Value.fromCore(coreValue);

      tx = tx.payAssets(Core.Address.fromBech32(recipientAddress), value);

      const unsignedTx = await tx.complete();
      const unsignedTxCbor = unsignedTx.toCbor();
      return res.json({ unsignedTx: unsignedTxCbor });
    }

    const unsignedTx = await tx.complete();
    const unsignedTxCbor = unsignedTx.toCbor();
    return res.json({ unsignedTx: unsignedTxCbor });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Failed to create transaction" });
  }
};

export const submitTransaction = async (req, res) => {
  try {
    const { signedTx } = req.body;

    const transaction = Core.Transaction.fromCbor(signedTx);

    const txId = await provider.postTransactionToChain(transaction);

    res.json({ txId });
  } catch (error) {
    console.error("Error submitting transaction:", error);
    res.status(500).json({ error: "Failed to submit transaction" });
  }
};

export const decodeUtxos = async (req, res) => {
  try {
    const { utxos } = req.body;

    const decodedUtxos = utxos.map((hexString) => {
      const utxo = C.TransactionUnspentOutput.from_bytes(
        Buffer.from(hexString, "hex")
      );

      const output = utxo.output();
      const input = utxo.input();

      const decoded = {
        txHash: input.transaction_id().to_hex(),
        outputIndex: parseInt(input.index().to_str()),
        amount: {
          coins: output.amount().coin().to_str(),
          assets: output.amount().multiasset()
            ? parseMultiAssets(output.amount().multiasset())
            : undefined,
        },
        address: output.address().to_bech32(),
        assetDetails: [],
      };

      function hexToString(hex) {
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
      }

      if (decoded.amount.assets) {
        decoded.assetDetails = Object.entries(decoded.amount.assets).map(([assetId, amount]) => {
          const [policyId, assetNameHex] = assetId.split(".");
          return {
            id: `${policyId}.${assetNameHex}`,
            policyId,
            assetName: hexToString(assetNameHex),
            amount
          };
        });
      }

      return decoded;
    });
    res.json(decodedUtxos);
  } catch (error) {
    console.error("Error decoding UTXOs:", error);
    res.status(500).json({ error: "Failed to decode UTXOs" });
  }
};

function parseMultiAssets(multiAsset) {
  const assets = {};
  const policies = multiAsset.keys();

  for (let i = 0; i < policies.len(); i++) {
    const policy = policies.get(i);
    const policyAssets = multiAsset.get(policy);
    const assetNames = policyAssets.keys();

    for (let j = 0; j < assetNames.len(); j++) {
      const assetName = assetNames.get(j);
      const amount = policyAssets.get(assetName);
      const assetId = `${policy.to_hex()}.${Buffer.from(
        assetName.name()
      ).toString("hex")}`;
      assets[assetId] = amount.to_str();
    }
  }

  return assets;
}
