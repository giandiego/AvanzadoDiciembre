import { Router } from 'express';
import * as asterisk from '../controllers/asterisk.controllers.js';

const router = Router();

router.post('/HacerUnaLlamada', asterisk.OriginateCall);
router.post('/dialer', asterisk.DialerCalls);


export default router;



