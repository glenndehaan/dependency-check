/**
 * Dependencies
 */
const fs = require("fs");
const program = require('commander');
const Listr = require('listr');

/**
 * Check if we are using the dev version
 */
const dev = process.env.NODE_ENV !== 'production';

/**
 * Reads a file from the filesystem
 *
 * @param path
 * @return {{}}
 */
const readJsonFile = (path) => {
    if (fs.existsSync(path)) {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    } else {
        return {};
    }
};

/**
 * Replaces multiple strings in a string
 *
 * @param str
 * @param mapObj
 * @return {string | void | *}
 */
const replaceAll = (str, mapObj) => {
    const re = new RegExp(Object.keys(mapObj).join("|"), "gi");

    return str.replace(re, (matched) =>{
        return mapObj[matched.toLowerCase()];
    });
};

/**
 * Check if all dependencies are OK
 *
 * @param path
 */
const checkDependencies = (path) => {
    return new Promise((resolve, reject) => {
        try {
            const file = readJsonFile(path);
            const versionCheckRegex = /[0-9]+.[0-9]+.[0-9]+$/;

            // Check what file we are dealing with

            // package.json / bower.json
            if (typeof file.dependencies !== "undefined") {
                const keys = Object.keys(file.dependencies);

                for(let item = 0; item < keys.length; item++) {
                    if(!versionCheckRegex.test(file.dependencies[keys[item]])) {
                        reject(`Dependency problem found! ${keys[item]}: ${file.dependencies[keys[item]]}`);
                    }

                    if(productionVersion) {
                        const stableVersion = replaceAll(file.dependencies[keys[item]].split(".")[0], {
                            '>=': '',
                            '~': '',
                            '^': '',
                            '<': '',
                            '>': '',
                            'v': ''
                        });

                        if(parseInt(stableVersion) < 1) {
                            reject(`Non stable dependency found! ${keys[item]}: ${file.dependencies[keys[item]]}`);
                        }
                    }
                }

                resolve();
            }

            // composer.json
            if (typeof file.require !== "undefined") {
                const keys = Object.keys(file.require);

                for(let item = 0; item < keys.length; item++) {
                    if(!versionCheckRegex.test(file.require[keys[item]])) {
                        reject(`Dependency problem found! ${keys[item]}: ${file.require[keys[item]]}`);
                    }

                    if(productionVersion) {
                        const stableVersion = replaceAll(file.require[keys[item]].split(".")[0], {
                           '>=': '',
                            '~': '',
                            '^': '',
                            '<': '',
                            '>': '',
                            'v': ''
                        });

                        if(parseInt(stableVersion) < 1) {
                            reject(`Non stable dependency found! ${keys[item]}: ${file.require[keys[item]]}`);
                        }
                    }
                }

                resolve();
            }

            reject("Unsupported file!");
        } catch (e) {
            reject(e);
        }
    })
};

/**
 * Read the programs package.json
 */
const packageJson = readJsonFile("../package.json");

/**
 * Output useful information about the program
 */
program
    .version(packageJson.version, '-v, --version')
    .description(packageJson.description)
    .usage('[options] <files ...>')
    .option('-s, --soft', "Don't crash when check's fail")
    .option('-c, --clean-ui', "Don't use any animations on the console output. Mainly used for a automation systems")
    .option('-p, --production-version', "Check if the package version is stable (>= 1.0.0)")
    .parse(process.argv);

/**
 * Define vars
 */
const files = program.args;
const tasks = [];
const cleanUi = typeof program.cleanUi !== "undefined";
const soft = typeof program.soft !== "undefined";
const productionVersion = typeof program.productionVersion !== "undefined";

/**
 * Loop over files and check if they exist
 */
for (let item = 0; item < files.length; item++) {
    const file = `${dev ? __dirname : process.cwd()}/${files[item]}`;

    if (fs.existsSync(file)) {
        if (!cleanUi) {
            tasks.push({
                title: `Checking ${file}`,
                task: (ctx, task) => checkDependencies(file).catch((e) => {
                    if (soft) {
                        task.skip(`${e}`);
                    } else {
                        throw new Error(e);
                    }
                })
            });
        } else {
            checkDependencies(file).catch((e) => {
                if (soft) {
                    console.warn(`[${file}] ${e}`);
                } else {
                    console.error(`[${file}] ${e}`);
                    process.exit(1);
                }
            });
        }
    } else {
        console.error(`[ERROR] The following file is missing: ${file}`);
        process.exit(1);
    }
}

/**
 * Run Listr if we are ready
 */
if (!cleanUi) {
    new Listr(tasks).run().catch(() => {
        console.log('Please review errors above!');
        process.exit(1);
    });
}
