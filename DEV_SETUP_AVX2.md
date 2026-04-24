# Running on CPUs without AVX2

Next.js 16's default native SWC and Turbopack binaries require **AVX2** CPU instructions. On older CPUs (e.g. Intel Ivy Bridge / pre-2013, some budget VPS instances), the dev/build process crashes with `Bus error (core dumped)` and the CLI exits silently with code 0 — making the failure look like the server "just quit."

## Check if your CPU is affected

```bash
grep -c avx2 /proc/cpuinfo
```

- Returns `> 0` → you have AVX2, no workaround needed.
- Returns `0` → you must apply the workaround below.

## One-time setup

Install the WASM SWC fallback (already in this repo's lockfile, but safe to re-run):

```bash
npm install --save-dev @next/swc-wasm-nodejs
```

## After every `npm install`

`npm install` will (re)download the native SWC binaries that crash. Disable them:

```bash
mv node_modules/@next/swc-linux-x64-gnu  node_modules/@next/_swc-linux-x64-gnu.disabled  2>/dev/null
mv node_modules/@next/swc-linux-x64-musl node_modules/@next/_swc-linux-x64-musl.disabled 2>/dev/null
```

Also block Next from re-downloading them into the user cache:

```bash
rm -rf ~/.cache/next-swc
mkdir -p ~/.cache/next-swc
chmod 000 ~/.cache/next-swc
```

## Running the project

Always pass `--webpack` (Turbopack also requires AVX2):

```bash
# Dev
npx next dev --webpack

# Production build & start
npx next build --webpack
npx next start
```

## VPS deployment checklist

Before deploying to a VPS, run on the target server:

```bash
grep -c avx2 /proc/cpuinfo
lscpu | grep "Model name"
```

If AVX2 is missing:

1. Apply the "one-time setup" + "after every npm install" steps above as part of your deploy script.
2. Update your start command to use `--webpack`.
3. Expect ~2-3x slower build times due to WASM. First request after start is also slower while WASM warms up.

## Why this happens

The `@next/swc-linux-x64-gnu` (and `-musl`) prebuilt binaries are compiled with `-mavx2`. When loaded on a CPU without those instructions, the kernel kills the process with SIGBUS. Other native bindings in this project (`@tailwindcss/oxide`, `lightningcss`, `@unrs/resolver`) tested fine on pre-AVX2 CPUs — only `@next/swc` is the problem.
