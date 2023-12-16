import AMI from "../lib/ami.js";

console.log("Iniciando eventos");

//escuchamos el evento AulaUtil
AMI.on("userevent", (event) => {

    if (event.userevent === "AulaUtil") {
        console.log("Evento AulaUtil");
        console.log(event);
        
    }
});