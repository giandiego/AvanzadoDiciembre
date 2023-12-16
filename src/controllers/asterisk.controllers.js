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

function padLeadingZeros(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

export const SipCreate = async (req, res) => {
    try {
        const s = req.body,
            i = s.Data;
        if (!s.sip) {
            throw new Error("Validate sip");
        }
        {
            const a = {
                Action: "UpdateConfig",
                reload: "yes",
                srcfilename: "sip.conf",
                dstfilename: "sip.conf",
                "action-000000": "newcat",
                "cat-000000": s.sip,
            };
            let count = 0;
            for (var [key, value] of Object.entries(i)) {
                count++;
                Object.assign(a, {
                    ["action-" + padLeadingZeros(count, 6)]: "append",
                    ["cat-" + padLeadingZeros(count, 6)]: s.sip,
                    ["var-" + padLeadingZeros(count, 6)]: key,
                    ["value-" + padLeadingZeros(count, 6)]: value,
                });
            }

            console.log(a);

            let action = await ActionAMI(AMI, a);

            if (action.hasOwnProperty("response")) {
                // SipReload();
                res.json({ success: true, message: action, data: a });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: action,
                    data: a,
                });
            }
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Something goes wrong retriving the SipCreate",
        });
    }
};


export const ActionAMI = async (ami, a) => {
    return new Promise((e) => {
        ami.action(a, function (a, s) {
            a ? (console.log("response error :", a.message), e(a.message)) : e(s);
        });
    });
};


export const CreateContext = async (req, res) => {
    try {
        const { contextName, extensionLines } = req.body;

        if (!contextName || !extensionLines || !Array.isArray(extensionLines)) {
            throw new Error("Datos inválidos. Asegúrese de enviar un 'contextName' y un arreglo de 'extensionLines'.");
        }

        const updateConfig = {
            Action: "UpdateConfig",
            reload: "yes",
            srcfilename: "extensions.api.conf",
            dstfilename: "extensions.api.conf",
            "action-000000": "newcat",
            "cat-000000": contextName
        };

        let count = 1;
        extensionLines.forEach(line => {
            Object.assign(updateConfig, {
                ["action-" + padLeadingZeros(count, 6)]: "append",
                ["cat-" + padLeadingZeros(count, 6)]: contextName,
                ["var-" + padLeadingZeros(count, 6)]: "exten",
                ["value-" + padLeadingZeros(count, 6)]: line
            });
            count++;
        });

        console.log(updateConfig);

        let action = await ActionAMI(AMI, updateConfig);

        if (action.hasOwnProperty("response")) {
            res.json({ success: true, message: action, data: updateConfig });
        }
        else {
            res.status(500).json({
                success: false,
                message: action,
                data: updateConfig,
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Something goes wrong creating the TTS context",
        });
    }
};


export const SipReload = async () => {
    try {
        let a = {
          Action: "Command",
          Command: "sip reload",
        };
        let action = await ActionAMI(AMI, a);
        return action;
    } catch (error) {
      return error;
    }
  };