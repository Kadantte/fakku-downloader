export const done: Set<String> = await (async () => {
  try {
    const text = await Bun.file("done.txt").text();

    return new Set(
      text
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length)
    );
  } catch (e) {
    return new Set();
  }
})();

export const notUnlimited: Set<String> = await (async () => {
  try {
    const text = await Bun.file("not_unlimited.txt").text();

    return new Set(
      text
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length)
    );
  } catch (e) {
    return new Set();
  }
})();
