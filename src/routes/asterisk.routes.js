import { Router } from 'express';
import * as asterisk from '../controllers/asterisk.controllers.js';

const router = Router();

router.post('/HacerUnaLlamada', asterisk.OriginateCall);
router.post('/dialer', asterisk.DialerCalls);
router.post('/SipCreate', asterisk.SipCreate);
router.post('/CreateContext', asterisk.CreateContext);


export default router;