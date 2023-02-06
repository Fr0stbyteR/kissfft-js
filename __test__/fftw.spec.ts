import * as fs from "fs";
import * as path from "path";
import { instantiateKissFFTModule, KissFFT } from "../dist/esm-bundle/index.js";
import type { KissFFTModule } from "../src/types";
import A2_1024 from "./audioBuffer.js";

const fftModuleJsPath = path.join(__dirname, "../libkissfft-wasm/libkissfft.js");
const testVectorsFilePath = path.join(__dirname, "test_vectors.json");
let testVectors: number[];

const scaleTransform = (trans: Float32Array, size: number) => {
    let i = 0, bSi = 1.0 / size, x = trans;
    while (i < x.length) {
        x[i] *= bSi; i++;
    }
    return x;
};

const getMiscRealBuffer = (size: number) => {
    const result = new Float32Array(size);
    for (let i = 0; i < result.length; i++)
        result[i] = (i % 2) / 4.0;
    return result;
}

const getMiscComplexBuffer = (size: number) => {
    const result = new Float32Array(2 * size);
    for (var i = 0; i < size; i++) {
        // result[2*i] = i
        // result[2*i + 1] = i
        result[2 * i] = Math.random();
        result[2 * i + 1] = Math.random();
    }
    return result;
}

const reorganizeNumpyRealOutput = (a: number[]) => {
    const b = new Array(a.length);
    b.fill(0);
    b[0] = a[0];
    b[a.length / 2] = a[a.length - 1];
    for (var i = 1; i < a.length / 2; i++) {
        b[i] = a[2 * i - 1];
        b[a.length - i] = a[2 * i];
    }
    return b;
}

let Module: KissFFTModule;
let kissFFT: KissFFT;

beforeAll(async () => {
    Module = await instantiateKissFFTModule();
    testVectors = JSON.parse(fs.readFileSync(testVectorsFilePath, { encoding: "utf-8" }));
    kissFFT = new KissFFT(Module);
});

describe("kissfft-js", function () {
    it("should successfully transform and invert real valued input buffer", function () {
        const size = A2_1024.length;
        const fftr = new kissFFT.FFTR(size);
        const transform = fftr.forward(A2_1024);
        const transScaled = scaleTransform(transform, size);
        const a2_again = fftr.inverse(transScaled);

        // Just to show how you can clean up after you"re done ;)
        fftr.dispose();  // fftr is now no longer usable for FFTs

        for (let i = 0; i < size; i++) {
            expect(A2_1024[i]).toBeCloseTo(a2_again[i], 0.0000005);
        }
    });

    it("should successfully transform and invert non-power-of-2 buffers", function () {
        const non2PowSize = 1536;  // 1.5 times test buffer size
        const buffer = getMiscRealBuffer(non2PowSize);
        const fftr = new kissFFT.FFTR(non2PowSize);
        const transform = fftr.forward(buffer);
        const transScaled = scaleTransform(transform, non2PowSize);
        const backAgain = fftr.inverse(transScaled);

        fftr.dispose();

        for (let i = 0; i < non2PowSize; i++) {
            expect(buffer[i]).toBeCloseTo(backAgain[i], 0.0000005);
        }
    });
});
