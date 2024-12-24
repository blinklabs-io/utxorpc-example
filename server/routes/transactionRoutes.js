import express from 'express';
import { createTransaction, submitTransaction, decodeUtxos } from '../controllers/transactionController.js';

const router = express.Router();

router.post('/create', createTransaction);
router.post('/submit', submitTransaction);
router.post('/decode-utxos', decodeUtxos);

export default router;