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
	function genTypes(before){
		let name, params
		let ret = {
			packet:[ "container",
				[
					{ "name": "name", "type": [
						"mapper", {
							"type": "varint", "mappings": (name={})
						}
					]},
					{ "name": "params", "type": [
						"switch", { "compareTo": "name", "fields": (params={})}
					]}
				]
			]
		}
		for(let i in before){
			ret["packet_"+before[i][0]] = before[i][1]
			name[i] = "packet_"+before[i][0]
			params[before[i][0]] = "packet_"+before[i][0]
		}
		return ret
	}
	o.protocol.stateClientVersion = {
		toServer:{
			types:genTypes({
				"0x01": [
					"client_version_01",
					[ "container", [ {
						"name": "time",
						"type": "i64"
					} ]]
				]
			})
		}
	}
}
module.exports = data