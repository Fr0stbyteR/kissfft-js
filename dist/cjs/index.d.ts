// Generated by dts-bundle-generator v7.2.0

/// <reference types="emscripten" />
/// <reference types="node" />

export type KissFFTModuleFactory = EmscriptenModuleFactory<KissFFTModule>;
export interface KissFFTModule extends EmscriptenModule {
	ccall: typeof ccall;
	cwrap: typeof cwrap;
	_kiss_fftr_alloc: (nfft: number, inverse_fft: boolean, $mem?: number, $lenmem?: number) => number;
	_kiss_fftr: (cfg: number, $timedata: number, $freqdata: number) => void;
	_kiss_fftri: (cfg: number, $freqdata: number, $timedata: number) => void;
	_kiss_fft_cleanup: () => void;
	_kiss_fft_alloc: (nfft: number, inverse_fft: boolean, $mem?: number, $lenmem?: number) => number;
	_kiss_fft: (cfg: number, $ffin: number, $fout: number) => void;
}
export interface InterfaceFFT {
	forward(arr: ArrayLike<number> | ((arr: Float32Array) => any)): Float32Array;
	inverse(arr: ArrayLike<number> | ((arr: Float32Array) => any)): Float32Array;
	dispose(): void;
}
/**
 * Load emcc-wasm files, than instantiate it
 * @param jsFile path to `emcc-wasm.js`
 * @param wasmFile path to `emcc-wasm.wasm`
 * @param dataFile path to `emcc-wasm.data`
 */
export declare const instantiateKissFFTModuleFromFile: (jsFile: string, wasmFile?: string, dataFile?: string) => Promise<KissFFTModule>;
export declare class KissFFT {
	private _FFT;
	private _FFTR;
	constructor(kissFFTModule: KissFFTModule);
	get FFT(): new (size: number) => InterfaceFFT;
	get FFTR(): new (size: number) => InterfaceFFT;
}

export {};
