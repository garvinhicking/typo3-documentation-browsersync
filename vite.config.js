import { defineConfig } from 'vite'
import { exec } from 'child_process'

export default defineConfig({
  build: {
    watch: {
      include: 'Documentation/**'
    },
  },
  plugins: [
    {
      name: 'html',
      handleHotUpdate({file, server}) {
        if (file.endsWith('.html')) {
          server.ws.send({
            type: 'full-reload',
            path: '*'
          });
        } else if(file.indexOf('/Documentation/') > 0) {
          // TODO: Execute docker command here.
          // TODO: Make "Documentation" directory configurable via env/param?!
          console.log('Re-rendering due to change in: ' + file);
        }
      }    
    },

    {
      name: 'postbuild-commands',
      closeBundle: async () => {
        console.log('reload ...');
        
        exec('pwd >> ./vite.log');
        // run during closeBundle hook. https://rollupjs.org/guide/en/#closebundle
      }
    },
  ]
});