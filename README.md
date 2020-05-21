# Redgrid CLI

This CLI allows performing tasks such as pairing a tuya device, sending commands, adding infrared virtual devices and sending infrared commands

```
redgrid [command]

Commands:
  redgrid link        Link a Genio device with the RedGrid managed TUYA cloud
  redgrid list        List the linked devices
  redgrid functions   Request a device for the list of commands/functions it
                       supports
  redgrid command     Send a command object to a TUYA device
  redgrid add-remote  Add a virtual remote device to a paired device
  redgrid ac-remotes  Return the list of supported AC remotes for a particular
                       IR blaster and brand of AC
  redgrid command-ac  Send an infrared control command to an aircon device

Options:
  --version   Show version number                                      [boolean]
  -h, --help  Show help  

```

## Example adding and controlling an IR device

```bash
# find supported remote indices for your IR device and AC brand
redgrid ac-remotes --deviceId xxx --brand Samsung
# choose one of the remote IDs from the output to use below
redgrid add-remote --deviceId xxx --remoteIndex 11842
# Use the output of the above to find the remoteId. Now we can send IR commands to control AC units
redgrid command-ac --deviceId xxx --remoteId yyy --remoteIndex 11842 --command '{"power": 1, "temp": 25}'
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
