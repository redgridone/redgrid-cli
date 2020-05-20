const OpenAPI = require('@tuyapi/openapi')
const ControlApi = require('@redgrid/tuya-ac-api')
const TuyaLink = require('@tuyapi/link').wizard
const ora = require('ora')

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

async function list(argv) {
  try {
    const api = new OpenAPI(ApiConfig)
    await api.getToken()
    const result = await api.getDevices()
    console.log(result)
  } catch (e) {
    console.log('Error reaching TUYA cloud', e)
  }
}

async function functions(argv) {
  try {
    const api = new ControlApi(ApiConfig)
    await api.getToken()
    const result = await api.functions(argv.deviceId)
    console.log(result)
  } catch (e) {
    console.log('Error reaching TUYA cloud', e)
  }
}

async function command(argv) {
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
