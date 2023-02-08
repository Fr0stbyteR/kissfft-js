import type { InterfaceFFT, KissFFTModule } from "./types";

class KissFFT {
    private _FFT: new (size: number) => InterfaceFFT;
    private _FFTR: new (size: number) => InterfaceFFT;
    constructor(kissFFTModule: KissFFTModule) {
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
        class FFT implements InterfaceFFT {
            size: number;
            fcfg: number;
            icfg: number;
            inptr: number;
            outptr: number;
            cin: Float32Array;
            cout: Float32Array;
            constructor(size: number) {
                this.size = size;
                this.fcfg = _kiss_fft_alloc(size, false);
                this.icfg = _kiss_fft_alloc(size, true);

                this.inptr = kissFFTModule._malloc(size * 8 + size * 8);
                this.outptr = this.inptr + size * 8;

                this.cin = new Float32Array(kissFFTModule.HEAPU8.buffer, this.inptr, size * 2);
                this.cout = new Float32Array(kissFFTModule.HEAPU8.buffer, this.outptr, size * 2);
            }

            forward(cin: ArrayLike<number> | ((arr: Float32Array) => any)) {
                if (typeof cin === "function") cin(this.cin);
                else this.cin.set(cin);
                _kiss_fft(this.fcfg, this.inptr, this.outptr);
                return this.cout;
            }

            inverse(cpx: ArrayLike<number> | ((arr: Float32Array) => any)) {
                if (typeof cpx === "function") cpx(this.cin);
                else this.cin.set(cpx);
                _kiss_fft(this.icfg, this.inptr, this.outptr);
                return this.cout;
            }

            dispose() {
                _free(this.inptr);
                _kiss_fft_cleanup();
            }
        }
        class FFTR implements InterfaceFFT {
            size: number;
            fcfg: number;
            icfg: number;
            rptr: number;
            cptr: number;
            ri: Float32Array;
            ci: Float32Array;
            constructor(size: number) {
                this.size = size;
                this.fcfg = _kiss_fftr_alloc(size, false);
                this.icfg = _kiss_fftr_alloc(size, true);

                this.rptr = _malloc(size * 4 + (size + 2) * 4);
                this.cptr = this.rptr + size * 4;

                this.ri = new Float32Array(kissFFTModule.HEAPU8.buffer, this.rptr, size);
                this.ci = new Float32Array(kissFFTModule.HEAPU8.buffer, this.cptr, size + 2);
            }
            forward(real: ArrayLike<number> | ((arr: Float32Array) => any)) {
                if (typeof real === "function") real(this.ri);
                else this.ri.set(real);
                _kiss_fftr(this.fcfg, this.rptr, this.cptr);
                return this.ci;
            }
            inverse(cpx: ArrayLike<number> | ((arr: Float32Array) => any)) {
                if (typeof cpx === "function") cpx(this.ci);
                else this.ci.set(cpx);
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
    get FFT() { return this._FFT }
    get FFTR() { return this._FFTR }
}

export default KissFFT;
