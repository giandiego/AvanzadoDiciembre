import * as asterisk from './controllers/asterisk.controllers.js';

//hacemos una llamada al número 5000


const llamada  = await asterisk.OriginateCall({
    channel: 'PJSIP/5000',
    context: 'test-manager',
    exten: 's',
    priority: 1,
    callerid: 'pepe <nodejs>',
    variable : {
        'var1' : 'value1',
        'var2' : 'value2'
    }
})

console.log("resultado: ",llamada)