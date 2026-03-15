import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import curations from "../config/room-gallery-curation.json" with { type: "json" };

const ROOT_DIR = path.join(process.cwd(), "public/assets/gallery/Nuestras habitaciones");
const GALLERY_WIDTH = 1400;
const QUALITY = 82;

function findSourcePath(folderPath, discardPath, filename) {
  const direct = path.join(folderPath, filename);
  if (fs.existsSync(direct)) {
    return direct;
  }

  const discarded = path.join(discardPath, filename);
  if (fs.existsSync(discarded)) {
    return discarded;
  }

  return null;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function writeOptimizedPair(inputPath, baseOutputPath, width) {
  const pipeline = sharp(inputPath).rotate().resize({
    width,
    withoutEnlargement: true,
  });

  await pipeline
    .clone()
    .webp({
      quality: QUALITY,
      effort: 5,
    })
    .toFile(`${baseOutputPath}.webp`);

  await pipeline
    .clone()
    .jpeg({
      quality: QUALITY,
      mozjpeg: true,
      chromaSubsampling: "4:4:4",
    })
    .toFile(`${baseOutputPath}.jpg`);
}

function moveOriginalsToDiscard(folderPath, discardPath, keepFilenames) {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    if (!/\.(jpe?g|png|webp)$/i.test(entry.name)) {
      continue;
    }

    if (keepFilenames.has(entry.name)) {
      continue;
    }

    const sourcePath = path.join(folderPath, entry.name);
    const targetPath = path.join(discardPath, entry.name);
    if (sourcePath === targetPath) {
      continue;
    }

    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }

    fs.renameSync(sourcePath, targetPath);
  }
}

async function curateRoom(room) {
  const folderPath = path.join(ROOT_DIR, room.folder);
  const discardPath = path.join(folderPath, "descartadas");
  ensureDir(discardPath);

  const descriptiveSource = findSourcePath(folderPath, discardPath, room.descriptiveSource);
  if (!descriptiveSource) {
    throw new Error(`No se encontro la ficha descriptiva: ${room.folder} -> ${room.descriptiveSource}`);
  }

  const keepFilenames = new Set();

  const descriptiveBase = path.join(folderPath, `${room.slug}-ficha`);
  await writeOptimizedPair(descriptiveSource, descriptiveBase, GALLERY_WIDTH);
  keepFilenames.add(`${room.slug}-ficha.jpg`);
  keepFilenames.add(`${room.slug}-ficha.webp`);

  for (const [index, image] of room.selected.entries()) {
    const inputPath = findSourcePath(folderPath, discardPath, image.source);
    if (!inputPath) {
      throw new Error(`No se encontro la imagen seleccionada: ${room.folder} -> ${image.source}`);
    }

    const sequence = String(index + 1).padStart(2, "0");
    const baseOutput = path.join(folderPath, `${room.slug}-${sequence}`);
    await writeOptimizedPair(inputPath, baseOutput, GALLERY_WIDTH);
    keepFilenames.add(`${room.slug}-${sequence}.jpg`);
    keepFilenames.add(`${room.slug}-${sequence}.webp`);
  }

  moveOriginalsToDiscard(folderPath, discardPath, keepFilenames);
}

async function main() {
  for (const room of curations.rooms) {
    await curateRoom(room);
    console.log(`OK ${room.folder}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
