import AMI from "../lib/ami.js";

//recibe una lista de números y llama
export const DialerCalls = async (req, res) => {

    const { action, numbers, variables } = req.body;

    if (action === 'ListNumbers') {

        const ListNumbers = numbers;

        //recorremos el objeto data
        for (let index = 0; index < ListNumbers.length; index++) {
            const lead = ListNumbers[index];

            console.log("los datos son: ", lead);
            AMI.action({
                'action': 'originate',
                channel: "Local/" + lead.numero + "@DIALER/n",//Local/1234@DIALER/n
                context: 'test-manager',
                exten: 's',
                priority: 1,
                variable: variables,
                callerid: lead.callerid
            }
                , function (err, res) {
                    if (err) {
                        console.log(err);
                        return err;
                    } else {
                        console.log(res);
                        return res;
                    }
                }
            );
        }

        res.json({
            message: 'Números recibidos',
            result: "Estamos procesando las llamadas..."
        });

    }
}

export const OriginateCall = async (req, res) => {

    try {
        const data = req.body;

        console.log("se recibe de postman: ", data);

        const result = await AMI.action({
            'action': 'originate',
            'channel': data.channel,
            'context': data.context,
            'exten': data.exten,
            'priority': data.priority,
            'variable': data.variables,
            'callerid': data.callerid,
            'async': true,
        }
            , function (err, res) {
                if (err) {
                    console.log(err);
                    return err;
                } else {
                    console.log(res);
                    return res;
                }
            }
        );


        res.json({ message: 'Llamada iniciada', result });


    } catch (error) {
        res.status(500).json({ message: 'Error al realizar la llamada', error: error.message });
    }
}