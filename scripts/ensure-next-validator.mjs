import fs from "node:fs";
import path from "node:path";

const typesDir = path.join(process.cwd(), ".next", "types");
const validatorPath = path.join(typesDir, "validator.ts");

fs.mkdirSync(typesDir, { recursive: true });

if (!fs.existsSync(validatorPath)) {
  fs.writeFileSync(validatorPath, "", "utf8");
}
