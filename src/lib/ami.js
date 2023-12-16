import config from './../config.js';
import AsteriskManager from 'asterisk-manager';

const AMI = new AsteriskManager(config.amiPort,config.amiHost,config.amiUser,config.amiPass,true);

// // En caso de perder la conexión podemos reconectar con keepConnected
AMI.keepConnected();

export default AMI;