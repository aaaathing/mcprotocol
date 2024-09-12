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

	o.protocol.types.blstring = ["pstring",{countType:"u8"}] //byte len string
	o.protocol.types.slstring = ["pstring",{countType:"u16"}] //short len string
	o.protocol.eagLoginStates = {
		toServer:{types:genTypes({
			"0x01": [
				"eagLoginStates_opened_0_authAndProto",
				[ "container", [
					{ "name": "legacyProtocolVersion", "type": "u8" },//2
					{ "name": "clientProtovolVersionEag", "type": ["array", { "countType": "u16", type:"u16" }] },// [2,3]
					{ "name": "clientProtovolVersion", "type": ["array", { "countType": "u16", type:"u16" }] },// [47]
					{ "name": "clientBrand", "type": "blstring" },
					{ "name": "clientVersion", "type": "blstring" },
					{ "name": "clientAuth", "type": "bool" },
					{ "name": "clientAuthUsername", "type": "blstring" },
				]]
			],
			"0x04": [
				"eagLoginStates_clientVersion_1_moreAuth",
				[ "container", [
					{name:"clientUsername",type:"blstring"},
					{name:"clientRequestedServer",type:"blstring"},
					{name:"clientAuthPassword",type:"blstring"},
				]]
			],
			"0x07": [
				"eagLoginStates_profileData",
				[ "container", [
					{name:"key",type:"blstring"},
					{name:"value",type:"slstring"},
				]]
			],
			"0x08": [
				"eagLoginStates_finish",
				[ "container", []]
			]
		})},
		toClient:{types:genTypes({
			"0x03": [
				"eagLoginStates_versionError",
				[ "container", []]
			],
			"0x02": [
				"eagLoginStates_opened_2_serverInfoAndAuth",
				[ "container", [
					{name:"clientProtocolVersionEag",type:"u16"},
					{name:"clientProtocolVersion",type:"u16"},
					{name:"eagServerName",type:"blstring"},
					{name:"eagServerDescription",type:"blstring"},
					{name:"authMethod",type:"u8"},
					{ "name": "saltingData", "type": ["array", { "countType": "u16", type:"u8" }] },
				]]
			],
			"0x05": [
				"eagLoginStates_login_2_clientId",
				[ "container", [
					{name:"clientUsername",type:"blstring"},
					{name:"clientUUIDPart1",type:"u32"},
					{name:"clientUUIDPart2",type:"u32"},
					{name:"clientUUIDPart3",type:"u32"},
					{name:"clientUUIDPart4",type:"u32"},
				]]
			],
			"0x09": [
				"eagLoginStates_serverFinish",
				[ "container", []]
			]
		})}
	}
}
module.exports = data

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
		name[i] = before[i][0]
		params[before[i][0]] = "packet_"+before[i][0]
	}
	return ret
}