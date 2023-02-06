import factoryFn from "../libkissfft-wasm/libkissfft.cjs";
import wasmBinary from "../libkissfft-wasm/libkissfft.wasm";

export const KissFFTModuleFactoryFn = factoryFn;
export const KissFFTModuleFactoryWasm = wasmBinary;

/**
 * Instantiate EMCC Module using bundled binaries. Module constructor and files can be overriden.
 */
const instantiateKissFFTModule = async (ModuleFactoryIn = factoryFn, wasmBinaryIn = wasmBinary) => {
    const g = globalThis as any;
    if (g.AudioWorkletGlobalScope) {
        g.importScripts = () => {};
        g.self = { location: { href: "" } };
    }
    const module = await ModuleFactoryIn({
        wasmBinary: wasmBinaryIn/*,
        getPreloadedPackage: (remotePackageName: string, remotePackageSize: number) => {
            if (remotePackageName === "libfaust-wasm.data") return dataBinaryIn.buffer;
            return new ArrayBuffer(0);
        }*/
    });
    if (g.AudioWorkletGlobalScope) {
		delete g.importScripts;
		delete g.self;
    }
    return module;
};

export default instantiateKissFFTModule;
