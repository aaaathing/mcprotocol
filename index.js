'use strict'

window.mcProtocol = {}
process.versions = {node:"Infinity.Infinity.Infinity"}
window.mcProtocol.ping = require("minecraft-protocol/src/ping.js")

//from minecraft-protocol/src/createClient.js
let DefaultClientImpl = require("minecraft-protocol/src/client.js")
const assert = require('assert')

const encrypt = require('minecraft-protocol/src/client/encrypt')
const keepalive = require('minecraft-protocol/src/client/keepalive')
const compress = require('minecraft-protocol/src/client/compress')
const play = require('minecraft-protocol/src/client/play')
const tcpDns = require('minecraft-protocol/src/client/tcp_dns')
const autoVersion = require('minecraft-protocol/src/client/autoVersion')
const pluginChannels = require('minecraft-protocol/src/client/pluginChannels')
const versionChecking = require('minecraft-protocol/src/client/versionChecking')
const uuid = require('minecraft-protocol/src/datatypes/uuid')

window.mcProtocol.createClient = createClient

function createClient (options) {
  assert.ok(options, 'options is required')
  assert.ok(options.username, 'username is required')
  if (!options.version && !options.realms) { options.version = false }
  
  // TODO: avoid setting default version if autoVersion is enabled
  const optVersion = options.version || require('minecraft-protocol/src/version').defaultVersion
  const mcData = require('minecraft-data')(optVersion)
  if (!mcData) throw new Error(`unsupported protocol version: ${optVersion}`)
  const version = mcData.version
  options.majorVersion = version.majorVersion
  options.protocolVersion = version.version
  const hideErrors = options.hideErrors || false
  const Client = options.Client || DefaultClientImpl

  const client = new Client(false, version.minecraftVersion, options.customPackets, hideErrors)
	client.framer = new uselessTransform() //replace
	client.splitter = new uselessTransform() //replace

  tcpDns(client, options)
	{
  	client.username = options.username
		client.uuid = uuid.nameToMcOfflineUUID(client.username)
		options.auth = 'offline'
		options.connect(client)
	}
  if (options.version === false) autoVersion(client, options)
  
	client.on('connect', function () {
    if (client.wait_connect) {
      client.on('connect_allowed', nextEag)
    } else {
      nextEag()
    }

		function nextEag(){
			client.state = "eagLoginStates"
			client.write('eagLoginStates_opened_0_authAndProto', {
        legacyProtocolVersion:2,
				clientProtovolVersionEag: [2,3],
				clientProtovolVersion: [options.protocolVersion], //47
				clientBrand: "EaglercraftX",
				clientVersion: "u35",
				clientAuth: false,
				clientAuthUsername: options.username,
      })
		}
    function next () {
      const mcData = require('minecraft-data')(client.version)
      let taggedHost = options.host
      if (client.tagHost) taggedHost += client.tagHost
      if (options.fakeHost) taggedHost = options.fakeHost

      client.write('set_protocol', {
        protocolVersion: options.protocolVersion,
        serverHost: taggedHost,
        serverPort: options.port,
        nextState: 2
      })
      client.state = states.LOGIN
      client.write('login_start', {
        username: client.username,
        signature: (client.profileKeys && !mcData.supportFeature('useChatSessions'))
          ? {
              timestamp: BigInt(client.profileKeys.expiresOn.getTime()), // should probably be called "expireTime"
              // Remove padding on the public key: not needed in vanilla server but matches how vanilla client looks
              publicKey: client.profileKeys.public.export({ type: 'spki', format: 'der' }),
              signature: mcData.supportFeature('profileKeySignatureV2')
                ? client.profileKeys.signatureV2
                : client.profileKeys.signature
            }
          : null,
        playerUUID: client.session?.selectedProfile?.id ?? client.uuid
      })
    }
  })

  keepalive(client, options)
  encrypt(client, options)
  play(client, options)
  compress(client, options)
  pluginChannels(client, options)
  versionChecking(client, options)

  return client
}

const Transform = require('readable-stream').Transform
class uselessTransform extends Transform{
  _transform (chunk, enc, cb) {
    this.push(chunk)
    return cb()
  }
}