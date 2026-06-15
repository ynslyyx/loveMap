const path = require("path");
const fs = require("fs");

exports.default = async function (context) {
  const localesDir = path.join(context.appOutDir, "locales");
  if (!fs.existsSync(localesDir)) return;

  const keep = new Set(["en-US.pak", "zh-CN.pak"]);
  for (const file of fs.readdirSync(localesDir)) {
    if (!keep.has(file)) {
      fs.unlinkSync(path.join(localesDir, file));
    }
  }
};
