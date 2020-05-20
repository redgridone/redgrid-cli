# Redgrid CLI

This CLI allows performing tasks such as pairing a tuya device, sending commands, adding infrared virtual devices and sending infrared commands

```
redgrid [command]

Commands:
  redgrid link       Link a Genio device with the RedGrid managed TUYA cloud
  redgrid list       List the linked devices
  redgrid functions  Request a device for the list of commands/functions it
                      supports
  redgrid command    Send a command object to a TUYA device

Options:
  --version   Show version number                                      [boolean]
  -h, --help  Show help                                                [boolean]

```

## Simple Installation

If you want to simply run the script with minimal effort download the prebuilt version for your OS from the releases page.

## Development Installation

If you want to make some changes (or just don't want to install the 30MB binaries) you can get it up and running with the following

```bash
git clone https://github.com/redgridone/redgrid-cli
cd regrid-cli
npm install
node index.js --help
```
