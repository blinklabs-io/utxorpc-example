// transaction-handler
import { Core, Blaze } from "@blaze-cardano/sdk";
import { U5C } from "@utxorpc/blaze-provider";
import express from "express";
import cors from "cors";
import { C } from "lucid-cardano";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const provider = new U5C({
  url: "https://preview.utxorpc-v0.demeter.run",
  headers: {
    "dmtr-api-key": process.env.DMTR_API_KEY,
  },
});

const { AssetId } = Core;

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/create-transaction", async (req, res) => {
  try {
    const { recipientAddress, amount, address, assetId } = req.body;
    console.log("Received request body:", req.body);

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
      console.log("Creating ADA transaction");
      tx = tx.payLovelace(
        Core.Address.fromBech32(recipientAddress),
        BigInt(amount * 1_000_000)
      );
    } else {
      console.log("Creating token transaction");

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
});

app.post("/api/submit-transaction", async (req, res) => {
  try {
    const { signedTx } = req.body;

    const transaction = Core.Transaction.fromCbor(signedTx);

    const txId = await provider.postTransactionToChain(transaction);

    res.json({ txId });
  } catch (error) {
    console.error("Error submitting transaction:", error);
    res.status(500).json({ error: "Failed to submit transaction" });
  }
});

app.post("/api/decode-utxos", async (req, res) => {
  try {
    const { utxos } = req.body;
    console.log("Received UTXOs:", utxos);

    const decodedUtxos = utxos.map((hexString) => {
      console.log("Decoding UTXO:", hexString);
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
      };

      console.log("Decoded UTXO:", decoded);
      return decoded;
    });

    res.json(decodedUtxos);
  } catch (error) {
    console.error("Error decoding UTXOs:", error);
    res.status(500).json({ error: "Failed to decode UTXOs" });
  }
});

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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
