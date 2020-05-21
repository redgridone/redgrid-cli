const OpenAPI = require('@tuyapi/openapi')
const ControlApi = require('@redgrid/tuya-ac-api')
const TuyaLink = require('@tuyapi/link').wizard
const ora = require('ora')

const acBrands = require('./tuya-brands')

// these can't really live here this is insecure AF
const ApiConfig = {
  key: '5wp8nswxayvcr3xd988g',
  secret: 'rfhsfmq5qgymfgt3sutvrvtjpa9ghsuy',
  schema: 'redgrid'
}

const argv = require('yargs')
    .command({
      command: 'link',
      desc: 'Link a Genio device with the RedGrid managed TUYA cloud',
      builder: (yargs) => {
        yargs
          .describe('ssid', 'The WiFi access point name (SSID) that the Genio device should connect to. This must be a 2.4GHz WiFi network (5GHz not supported)')
          .describe('password', 'The password for the WiFi access point.')
          .demandOption(['ssid','password'])
      },
      handler: link
    })
    .command({
      command: 'list',
      desc: 'List the linked devices',
      builder: (yargs) => {},
      handler: list
    })
    .command({
      command: 'functions',
      desc: 'Request a device for the list of commands/functions it supports',
      builder: (yargs) => {
        yargs
          .describe('deviceId', 'The device ID of the genio device. Use regrid list to list all devices')
          .demandOption(['deviceId'])
      },
      handler: functions
    })
    .command({
      command: 'command',
      desc: 'Send a command object to a TUYA device',
      builder: (yargs) => {
        yargs
          .describe('deviceId', 'The device ID of the genio device. Use regrid list to list all devices')
          .describe('command', `Stringified JSON object of command to send. \n e.g. '{"code": "switch", "value": true}'`)
          .demandOption(['deviceId', 'command'])
      },
      handler: command
    })
    .command({
      command: 'add-remote',
      desc: 'Add a virtual remote device to a paired device',
      builder: (yargs) => {
        yargs
          .describe('deviceId', 'The device ID of the genio device. Use regrid list to list all devices')
          .describe('remoteIndex', 'The TUYA remote index. This is a layout for a particular brand and model')
          .demandOption(['deviceId', 'remoteIndex'])
      },
      handler: addRemote
    })
    .command({
      command: 'ac-remotes',
      desc: 'Return the list of supported AC remotes for a particular IR blaster and brand of AC',
      builder: (yargs) => {
        yargs
          .describe('deviceId', 'The device ID of the genio device. Use regrid list to list all devices')
          .describe('brand', `A supported brand. Must be one of ${acBrands.map(x => x.brand_name)}`)
          .demandOption(['deviceId', 'brand'])
      },
      handler: listRemoteIndices
    })
    .command({
      command: 'command-ac',
      desc: 'Send an infrared control command to an aircon device',
      builder: (yargs) => {
        yargs
          .describe('deviceId', 'The ID of the physical IR blaster device')
          .describe('remoteId', 'The ID of the virtual remote added to the IR device')
          .describe('remoteIndex', 'The TUYA remote index. This is a layout for a particular brand and model')
          .describe('command', `Stringified JSON object of IR command to send. \n has fields for power (0: off, 1: on), mode, (0: cooling, 1: heating, 2: automatic, 3: air supply, 4: dehumidification), temp (between 16 and 31) and wind (between 0 and 3). \n e.g '{"power": 1, "mode": 1}'`)
          .demandOption(['deviceId', 'remoteId', 'remoteIndex', 'command'])
      },
      handler: commandAc     
    })
    .help('h')
    .alias('h', 'help')
    .argv;


async function link(argv) {
  const linker = new TuyaLink({
    apiKey: ApiConfig.key,
    apiSecret: ApiConfig.secret,
    email: 'johndoe@example.com',
    password: 'examplepassword',
    schema: ApiConfig.schema
  })
  linker.init()
    .then(async () => {
      const spinner = ora('Connected to TUYA cloud. Searching for device to pair...').start()
      try {
        let devices = await linker.linkDevice({ssid: argv.ssid, wifiPassword: argv.password})
        spinner.succeed('Device registered!');
        console.log(devices);
      } catch (e) {
        spinner.fail('Unable to pair device')
      }
      console.log('All registered devices:')     
    })
    .catch(e => {
      console.log('Unable to connect to TUYA cloud', e)
    })  
}

async function list (argv) {
  try {
    const api = new OpenAPI(ApiConfig)
    await api.getToken()
    const result = await api.getDevices()
    console.log(result)
  } catch (e) {
    console.log('Error reaching TUYA cloud', e)
  }
}

async function functions (argv) {
  try {
    const api = new ControlApi(ApiConfig)
    await api.getToken()
    const result = await api.functions(argv.deviceId)
    console.log(result)
  } catch (e) {
    console.log('Error reaching TUYA cloud', e)
  }
}

async function command (argv) {
  const command = JSON.parse(argv.command)
  try {
    const api = new ControlApi(ApiConfig)
    await api.getToken()
    const result = await api.sendCommands(argv.deviceId, [command])
    console.log(result)
  } catch (e) {
    console.log('Error reaching TUYA cloud', e)
  }  
}

async function listRemoteIndices (argv) {
  const brand = acBrands.find(x => x.brand_name === argv.brand)
  if (brand === undefined) {
    console.log(`${argv.brand} is an unsupported brand. Must be one of ${acBrands.map(x => x.brand_name)}`)
    return
  }
  try {
    const api = new ControlApi(ApiConfig)
    await api.getToken()
    const result = await api.getSupportedRemotes(argv.deviceId, brand.brand_id)
    console.log(result)
  } catch (e) {
    console.log('Error reaching TUYA cloud', e)
  }      
}

async function addRemote (argv) {
  try {
    const api = new ControlApi(ApiConfig)
    await api.getToken()
    const result = await api.addRemote(argv.deviceId, argv.remoteIndex)
    console.log(result)
  } catch (e) {
    console.log('Error reaching TUYA cloud', e)
  }    
}

async function commandAc (argv) {
  const command = JSON.parse(argv.command)
  try {
    const api = new ControlApi(ApiConfig)
    await api.getToken()
    const result = await api.sendKeys(argv.deviceId, argv.remoteId, argv.remoteIndex, command)
    console.log(result)
  } catch (e) {
    console.log('Error reaching TUYA cloud', e)
  }    
}
