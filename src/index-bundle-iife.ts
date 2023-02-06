import * as kissfftwasm from "./exports-bundle";
// export default kissfftwasm;
// Bug with dts-bundle-generator

export * from "./exports-bundle";

(globalThis as any).kissfftwasm = kissfftwasm;
