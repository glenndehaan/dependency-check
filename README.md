# Dependency Check

A small tool to check if all package dependencies are production ready

## Structure
- NodeJS
- Commander
- Listr
- PKG

## Basic Usage
- Download the latest binary from the GitHub releases page
- You can now start using the binary as follows: `./dependency-check-linux [options] <files ...>`

## Development Usage
- Install NodeJS 8.0 or higher
- Run `npm start` in the root project folder

## Command Line options
|        Parameter       |                                         Notes                                        |
|------------------------|--------------------------------------------------------------------------------------|
|-v, --version           | output the version number                                                            |
|-s, --soft              | Don't crash when check's fail                                                        |
|-c, --clean-ui          | Don't use any animations on the console output. Mainly used for a automation systems |
|-p, --production-version| Check if the package version is stable (>= 1.0.0)                                    |
|-h, --help              | output usage information                                                             |


## License

MIT
