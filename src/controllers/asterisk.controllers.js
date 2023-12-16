import AMI from "../lib/ami.js";

export const OriginateCall = async (data) => {

    const result = await AMI.action({
        'action': 'originate',
        'channel': data.channel,
        'context': data.context,
        'exten': data.exten,
        'priority': data.priority,
        'variable': data.variable,
        'callerid': data.callerid,
        'async': true,
    }
    // , function (err, res) {
    //     if (err) {
    //         console.log(err);
    //         return err;
    //     } else {
    //         console.log(res);
    //     }
    // }
    );


    return result;

}