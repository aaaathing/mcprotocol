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
const setProtocol = require('minecraft-protocol/src/client/setProtocol')
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
  if (options.realms && options.auth !== 'microsoft') throw new Error('Currently Realms can only be joined with auth: "microsoft"')

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
  setProtocol(client, options)
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