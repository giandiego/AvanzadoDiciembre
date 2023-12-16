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

export const ManageContext = async (req, res) => {
    try {
        const { type, fileName, contextName, extensionLines,changes, linesToDelete  } = req.body;

        if (!type || !fileName || !contextName) {
            throw new Error("Datos inválidos. Asegúrese de enviar los campos requeridos.");
        }

        const updateConfig = {
            Action: "UpdateConfig",
            reload: "yes",
            srcfilename: fileName,
            dstfilename: fileName,
        };

        switch (type) {
            case "new":
                updateConfig["action-000000"] = "newcat";
                updateConfig["cat-000000"] = contextName;
                extensionLines.forEach((line, index) => {
                    const lineFormat = index === 0
                        ? `s,${line.priority},${line.application}(${line.data || ''})`
                        : `n,${line.application}(${line.data || ''})`;
                    Object.assign(updateConfig, {
                        ["action-" + padLeadingZeros(index + 1, 6)]: "append",
                        ["cat-" + padLeadingZeros(index + 1, 6)]: contextName,
                        ["var-" + padLeadingZeros(index + 1, 6)]: index === 0 ? "exten" : "same",
                        ["value-" + padLeadingZeros(index + 1, 6)]: lineFormat
                    });
                });
                break;

            case "change":
                changes.forEach((change, index) => {
                    const oldLineFormat = `${change.old.priority},${change.old.application}(${change.old.data || ''})`;
                    const newLineFormat = `${change.new.priority},${change.new.application}(${change.new.data || ''})`;
                    Object.assign(updateConfig, {
                        ["action-" + padLeadingZeros(index, 6)]: "update",
                        ["cat-" + padLeadingZeros(index, 6)]: contextName,
                        ["var-" + padLeadingZeros(index, 6)]: change.old.priority === "s" ? "exten" : "same",
                        ["match-" + padLeadingZeros(index, 6)]: oldLineFormat,
                        ["value-" + padLeadingZeros(index, 6)]: newLineFormat
                    });
                });
                break;

            case "delete":
                linesToDelete.forEach((line, index) => {
                    const lineFormat = `${line.priority},${line.application}(${line.data || ''})`;
                    Object.assign(updateConfig, {
                        ["action-" + padLeadingZeros(index, 6)]: "delete",
                        ["cat-" + padLeadingZeros(index, 6)]: contextName,
                        ["var-" + padLeadingZeros(index, 6)]: line.priority === "s" ? "exten" : "same",
                        ["match-" + padLeadingZeros(index, 6)]: lineFormat
                    });
                });
                break;

            default:
                throw new Error("Tipo de acción no reconocido.");
        }

        console.log(updateConfig);

        let action = await ActionAMI(AMI, updateConfig);
        if (action.hasOwnProperty("response")) {
            res.json({ success: true, message: action, data: updateConfig });
        } else {
            res.status(500).json({ success: false, message: action, data: updateConfig });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || "Error al manejar el contexto" });
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