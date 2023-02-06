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
        this.cin.set(cin);
        _kiss_fft(this.fcfg, this.inptr, this.outptr);
        return new Float32Array(kissFFTModule.HEAPU8.buffer, this.outptr, this.size * 2);
      }
      inverse(cpx) {
        this.cin.set(cpx);
        _kiss_fft(this.icfg, this.inptr, this.outptr);
        return new Float32Array(kissFFTModule.HEAPU8.buffer, this.outptr, this.size * 2);
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
        this.ri.set(real);
        _kiss_fftr(this.fcfg, this.rptr, this.cptr);
        return new Float32Array(kissFFTModule.HEAPU8.buffer, this.cptr, this.size + 2);
      }
      inverse(cpx) {
        this.ci.set(cpx);
        _kiss_fftri(this.icfg, this.cptr, this.rptr);
        return new Float32Array(kissFFTModule.HEAPU8.buffer, this.rptr, this.size);
      }
      dispose() {
        _free(this.rptr);
        _kiss_fft_cleanup();
      }
    }
    this.FFT = FFT;
    this.FFTR = FFTR;
  }
};
var KissFFT_default = KissFFT;
export {
  KissFFT_default as KissFFT,
  instantiateKissFFTModuleFromFile_default as instantiateKissFFTModuleFromFile
};
//# sourceMappingURL=index.js.map
