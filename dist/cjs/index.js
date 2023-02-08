(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // src/instantiateKissFFTModuleFromFile.ts
  var instantiateKissFFTModuleFromFile = async (jsFile, wasmFile = jsFile.replace(/c?js$/, "wasm"), dataFile = jsFile.replace(/c?js$/, "data")) => {
    var _a, _b;
    let Module;
    let wasmBinary;
    const jsCodeHead = /var (.+) = \(\(\) => \{/;
    if (typeof globalThis.fetch === "function") {
      let jsCode = await (await fetch(jsFile)).text();
      jsCode = `${jsCode}
export default ${(_a = jsCode.match(jsCodeHead)) == null ? void 0 : _a[1]};
`;
      const jsFileMod = URL.createObjectURL(new Blob([jsCode], { type: "text/javascript" }));
      Module = (await import(
        /* webpackIgnore: true */
        jsFileMod
      )).default;
      wasmBinary = new Uint8Array(await (await fetch(wasmFile)).arrayBuffer());
    } else {
      const { promises: fs } = await import("fs");
      const { pathToFileURL } = await import("url");
      let jsCode = await fs.readFile(jsFile, { encoding: "utf-8" });
      jsCode = `
import process from "process";
import * as path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __filename = fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);

${jsCode}

export default ${(_b = jsCode.match(jsCodeHead)) == null ? void 0 : _b[1]};
`;
      const jsFileMod = jsFile.replace(/c?js$/, "mjs");
      await fs.writeFile(jsFileMod, jsCode);
      Module = (await import(
        /* webpackIgnore: true */
        pathToFileURL(jsFileMod).href
      )).default;
      await fs.unlink(jsFileMod);
      wasmBinary = (await fs.readFile(wasmFile)).buffer;
    }
    const module = await Module({
      wasmBinary
      /*,
      getPreloadedPackage: (remotePackageName: string, remotePackageSize: number) => {
          if (remotePackageName === "libfaust-wasm.data") return dataBinary;
          return new ArrayBuffer(0);
      }*/
    });
    return module;
  };
  var instantiateKissFFTModuleFromFile_default = instantiateKissFFTModuleFromFile;

  // src/KissFFT.ts
  var KissFFT = class {
    constructor(kissFFTModule) {
      const {
        _kiss_fftr_alloc,
        _kiss_fftr,
        _kiss_fftri,
        _kiss_fft,
        _kiss_fft_alloc,
        _kiss_fft_cleanup,
        _free,
        _malloc
      } = kissFFTModule;
      class FFT {
        constructor(size) {
          this.size = size;
          this.fcfg = _kiss_fft_alloc(size, false);
          this.icfg = _kiss_fft_alloc(size, true);
          this.inptr = kissFFTModule._malloc(size * 8 + size * 8);
          this.outptr = this.inptr + size * 8;
          this.cin = new Float32Array(kissFFTModule.HEAPU8.buffer, this.inptr, size * 2);
          this.cout = new Float32Array(kissFFTModule.HEAPU8.buffer, this.outptr, size * 2);
        }
        forward(cin) {
          if (typeof cin === "function")
            cin(this.cin);
          else
            this.cin.set(cin);
          _kiss_fft(this.fcfg, this.inptr, this.outptr);
          return this.cout;
        }
        inverse(cpx) {
          if (typeof cpx === "function")
            cpx(this.cin);
          else
            this.cin.set(cpx);
          _kiss_fft(this.icfg, this.inptr, this.outptr);
          return this.cout;
        }
        dispose() {
          _free(this.inptr);
          _kiss_fft_cleanup();
        }
      }
      class FFTR {
        constructor(size) {
          this.size = size;
          this.fcfg = _kiss_fftr_alloc(size, false);
          this.icfg = _kiss_fftr_alloc(size, true);
          this.rptr = _malloc(size * 4 + (size + 2) * 4);
          this.cptr = this.rptr + size * 4;
          this.ri = new Float32Array(kissFFTModule.HEAPU8.buffer, this.rptr, size);
          this.ci = new Float32Array(kissFFTModule.HEAPU8.buffer, this.cptr, size + 2);
        }
        forward(real) {
          if (typeof real === "function")
            real(this.ri);
          else
            this.ri.set(real);
          _kiss_fftr(this.fcfg, this.rptr, this.cptr);
          return this.ci;
        }
        inverse(cpx) {
          if (typeof cpx === "function")
            cpx(this.ci);
          else
            this.ci.set(cpx);
          _kiss_fftri(this.icfg, this.cptr, this.rptr);
          return this.ri;
        }
        dispose() {
          _free(this.rptr);
          _kiss_fft_cleanup();
        }
      }
      this._FFT = FFT;
      this._FFTR = FFTR;
    }
    get FFT() {
      return this._FFT;
    }
    get FFTR() {
      return this._FFTR;
    }
  };
  var KissFFT_default = KissFFT;
})();
//# sourceMappingURL=index.js.map
