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
    forward(arr: ArrayLike<number>): Float32Array;
    inverse(arr: ArrayLike<number>): Float32Array;
    dispose(): void;
}
