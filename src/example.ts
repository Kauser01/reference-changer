import ReferenceChanger from "./index";

let handler = new ReferenceChanger(process.cwd(), "./src/index.ts", "./src/index1.ts");

handler.change_copy();