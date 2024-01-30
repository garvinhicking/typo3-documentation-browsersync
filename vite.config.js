import { defineConfig } from 'vite'
import { execSync } from 'child_process'
import { existsSync } from 'fs';
import { resolve, relative, sep } from 'path';

function isSubdirectory(parent, child) {
  const resolvedParent = resolve(parent);
  const resolvedChild = resolve(child);

  const relativePath = relative(resolvedParent, resolvedChild);

  // If the relative path starts with ".." or has a leading separator, it's not a subdirectory
  return !relativePath.startsWith(`..${sep}`) && !relativePath.startsWith(sep);
}

let sourceDirectory = process.env.SOURCE || 'Documentation';
let targetDirectory = process.env.TARGET || 'Documentation-GENERATED-temp';
let vitePort        = process.env.VITE_PORT || 5173;

// Example how to run this with different directories:
// SOURCE=./path/to/Documentation TARGET=./another/path/to/Documentation-Output/ VITE_PORT=5173 npm run dev
// Note that the paths need to be within the project directory, else vite does not watch these directories.

if (!existsSync(sourceDirectory)) {
  console.log(`\x1b[37m\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m \x1b[1m\x1b[36m[typo3-documentation-browsersync] \x1b[0m\x1b[31mSpecified \x1b[4m${sourceDirectory}\x1b[0m\x1b[31m does not exist, fallback to current directory.\x1b[0m`);
  sourceDirectory = './';
}

if (!existsSync(targetDirectory)) {
  console.log(`\x1b[37m\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m \x1b[1m\x1b[36m[typo3-documentation-browsersync] \x1b[0m\x1b[31mSpecified \x1b[4m${targetDirectory}\x1b[0m\x1b[31m does not exist, fallback to current directory.\x1b[0m`);
  targetDirectory = './';
}

if (!isSubdirectory(process.cwd(), sourceDirectory)) {
  console.log(`\x1b[37m\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m \x1b[1m\x1b[36m[typo3-documentation-browsersync] \x1b[0m\x1b[31mSpecified \x1b[4m${sourceDirectory}\x1b[0m\x1b[31m is not within project scope, vite cannot watch changes.\x1b[0m`);
  process.exit(1);
}

if (!isSubdirectory(process.cwd(), targetDirectory)) {
  console.log(`\x1b[37m\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m \x1b[1m\x1b[36m[typo3-documentation-browsersync] \x1b[0m\x1b[31mSpecified \x1b[4m${targetDirectory}\x1b[0m\x1b[31m is not within project scope, vite cannot watch changes.\x1b[0m`);
  process.exit(1);
}

console.log(`\x1b[37m\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m \x1b[1m\x1b[36m[typo3-documentation-browsersync] \x1b[0m\x1b[32mListening on \x1b[4m${sourceDirectory}\x1b[0m\x1b[32m which renders to \x1b[4m${targetDirectory}\x1b[0m`);
console.log(`\x1b[37m\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m \x1b[1m\x1b[36m[typo3-documentation-browsersync] \x1b[0m\x1b[32mUse e.g. \x1b[4mhttp://localhost:${vitePort}/${targetDirectory}/Index.html\x1b[0m\x1b[32m to view documentation.\x1b[0m`);

export default defineConfig({
  build: {
    watch: {
      include: sourceDirectory + '/**'
    },
  },
  server: {
    port: vitePort
  },
  plugins: [
    {
      name: 'html',
      handleHotUpdate({file, server}) {
        if (file.indexOf('/' + targetDirectory + '/') > 0 && file.endsWith('.html')) {
          // Changes on targetDirectory (HTML output)

          console.log(`\x1b[37m\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m \x1b[1m\x1b[36m[typo3-documentation-browsersync] \x1b[0m\x1b[32m\x1b[33mBrowser reload\x1b[32m on \x1b[4m${file}\x1b[0m`);
          server.ws.send({
            type: 'full-reload',
            path: '*'
          });
        } else if(file.indexOf('/' + sourceDirectory + '/') > 0) {
          // Changes on sourceDirectory (ReST input)

          console.log(`\x1b[37m\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m \x1b[1m\x1b[36m[typo3-documentation-browsersync] \x1b[0m\x1b[32m\x1b[33mRender\x1b[32m on \x1b[4m${file}\x1b[0m`);

          try {
            // The container by defaults operates on /project/Documentation/ and writes to /project/Documentation-GENERATED-temp/.
            // We make our lives easy by just mapping those expected directories to our sourceDirectory/targetDirectory variables.
            const shellExec = execSync(
                'php /opt/guides/bin/guides --no-progress --config Documentation Documentation'
            ).toString();

            console.log(shellExec);
            console.log(`\x1b[37m\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m \x1b[1m\x1b[36m[typo3-documentation-browsersync] \x1b[0m\x1b[32m\x1b[33mRendering performed.\x1b[0m`);

            server.ws.send({
              type: 'full-reload',
              path: '*'
            });
          } catch (error) {
            console.log(`\x1b[37m\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m \x1b[1m\x1b[36m[typo3-documentation-browsersync] \x1b[0m\x1b[1m\x1b[31mRendering Error:\x1b[0m\n-------------------\n${error.message}-------------------\n`);
          }
        }
      }    
    }
  ]
});
