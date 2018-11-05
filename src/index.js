/**
 * Dependencies
 */
const fs = require("fs");
const program = require('commander');
const listr = require('listr');

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
 * Check if all dependencies are OK
 *
 * @param path
 */
const checkDependencies = (path) => {
    return new Promise((resolve, reject) => {
        try {
            const file = readJsonFile(path);

            // Check what file we are dealing with
            if (typeof file.dependencies !== "undefined") {
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
    .parse(process.argv);

/**
 * Define vars
 */
const files = program.args;
const tasks = [];
const cleanUi = typeof program.cleanUi !== "undefined";
const soft = typeof program.soft !== "undefined";

/**
 * Loop over files and check if they exist
 */
for (let item = 0; item < files.length; item++) {
    const file = `${__dirname}/${files[item]}`;

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
    new listr(tasks).run().catch(() => {
        console.log('Please review errors above!');
    });
}
