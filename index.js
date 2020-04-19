require('dotenv').config()
const TuyaLink = require('@tuyapi/link').wizard
const ora = require('ora')
const argv = require('yargs')
    .usage('Pair a Genio device with the RedGrid TUYA cloud: $0 --ssid [string] --password [string]')
    .demandOption(['ssid','password'])
    .describe('ssid', 'The WiFi access point name (SSID) that the Genio device should connect to. This must be a 2.4GHz WiFi network (5GHz not supported)')
    .describe('password', 'The password for the WiFi access point.')
    .help('h')
    .alias('h', 'help')
    .argv;

const link = new TuyaLink({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  email: 'johndoe@example.com',
  password: 'examplepassword',
  schema: process.env.SCHEMA
})

link.init()
  .then(async () => {
    const spinner = ora('Connected to TUYA cloud. Searching for device to pair...').start()
    try {
      let devices = await link.linkDevice({ssid: argv.ssid, wifiPassword: argv.password})
      spinner.succeed('Device registered!');
      console.log(devices);
    } catch (e) {
      spinner.fail('Unable to pair device')
    }
  })
  .catch(e => {
    console.log('Unable to connect to TUYA cloud', e)
  })
