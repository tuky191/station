import { defineConfig } from 'cypress';
import sharp from 'sharp';
import Jimp from 'jimp';
import qrCode from 'qrcode-reader';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        decodeQrFromSvg({ svg }) {
          return new Promise((resolve, reject) => {
            sharp(Buffer.from(svg))
              .png()
              .toBuffer({ resolveWithObject: true })
              .then(({ data }) => {
                Jimp.read(data, function (err, image) {
                  if (err) {
                    return reject(err);
                  }
                  // Creating an instance of qrcode-reader module
                  let qrcode = new qrCode();
                  qrcode.callback = function (err, value) {
                    if (err) {
                      return reject(err);
                    }
                    resolve(value.result);
                  };
                  // Decoding the QR code
                  qrcode.decode(image.bitmap);
                });
              })
              .catch((err) => {
                return reject(err);
              });
          });
        },
      });
    },
    baseUrl: 'https://localhost:3000',
    viewportHeight: 1000,
    viewportWidth: 1280,
    retries: {
      runMode: 2,
      openMode: 1,
    },

    env: {
      apiUrl: 'https://localhost:3000',
      mobileViewportWidthBreakpoint: 414,
      coverage: false,
      codeCoverage: {
        url: 'http://localhost:3000/__coverage__',
      },
      'cypress-react-selector': {
        root: '#station',
      },
    },
    specPattern: 'cypress/e2e/tests/**/*.ts',
    //integrationFolder: "cypress/tests",
  },
});
