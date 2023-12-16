import { config } from 'dotenv';

config();

export default {
    amiHost : process.env.AMI_HOST || 'localhost',
    amiPort : process.env.AMI_PORT || 5038,
    amiUser : process.env.AMI_USER || 'asterisk',
    amiPass : process.env.AMI_PASS || 'asterisk',
    url: process.env.URL || 'http://localhost:3000'
}