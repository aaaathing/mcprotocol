const dataVersion = require("./package.json").version
let data = window.mcProtocol.data = {}
let paths
window.mcProtocol.dataPrefetch = async function(pcOrBedrock, version, progCb){
	if(!paths) paths = await (await fetch("https://unpkg.com/minecraft-data@"+dataVersion+"/minecraft-data/data/dataPaths.json")).json()
	if(!data[pcOrBedrock]) data[pcOrBedrock] = {}
	let o = data[pcOrBedrock][version/*.replace("_eag", "")*/] = {}
	let thesePaths = paths[pcOrBedrock][version/*.replace("_eag", "")*/]

	let total = Object.keys(thesePaths).length, prog = 0
	progCb(prog,total)
	for(let i in thesePaths){
		if(i === "proto"){
			//o[i] = await (await fetch("https://unpkg.com/minecraft-data@"+dataVersion+"/minecraft-data/data/"+thesePaths[i]+"/"+i+".yml")).text()
		}else{
			o[i] = await (await fetch("https://unpkg.com/minecraft-data@"+dataVersion+"/minecraft-data/data/"+thesePaths[i]+"/"+i+".json")).json()
		}
		prog++
		progCb(prog,total)
	}

	/*if(version.endsWith("_eag")){
		//delete o.protocol.handshaking.toServer.types.packet_legacy_server_list_ping
		//delete o.protocol.handshaking.toServer.types.packet[1][0].type[1].mappings['0xfe']
		//delete o.protocol.handshaking.toServer.types.packet[1][1].type[1].fields.legacy_server_list_ping
	}*/
}
module.exports = data