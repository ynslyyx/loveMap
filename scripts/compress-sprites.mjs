import sharp from "sharp";
import { readdir, stat } from "fs/promises";
import { join } from "path";

const dir = process.argv[2] || "public/sprites/cities";

async function compress(dir) {
  const files = (await readdir(dir)).filter((f) => f.endsWith(".png"));
  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const src = join(dir, file);
    const size = (await stat(src)).size;
    totalBefore += size;

    await sharp(src)
      .png({ quality: 80, compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer()
      .then((buf) => {
        totalAfter += buf.length;
        return sharp(buf).toFile(src);
      });

    const saved = ((1 - (await stat(src)).size / size) * 100).toFixed(0);
    console.log(`${file}: ${(size / 1024).toFixed(0)}KB → ${(await stat(src)).size / 1024 | 0}KB (${saved}% off)`);
  }

  console.log(`\nTotal: ${(totalBefore / 1048576).toFixed(1)}MB → ${(totalAfter / 1048576).toFixed(1)}MB (saved ${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%)`);
}

compress(dir);
